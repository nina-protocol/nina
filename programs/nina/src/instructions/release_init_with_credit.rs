use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token, Burn};

use crate::state::*;
use crate::utils::{nina_publishing_credit_mint};

#[derive(Accounts)]
pub struct ReleaseInitializeWithCredit<'info> {
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = payer,
        space = 1210
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    pub release_mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: the payer is usually the authority, though they can set someone else as authority
    /// This is safe because we don't care who the payer sets as authority.
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,
    #[account(
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == payment_mint.key(),
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = authority_publishing_credit_token_account.owner == authority.key(),
        constraint = authority_publishing_credit_token_account.mint == publishing_credit_mint.key(),
    )]
    pub authority_publishing_credit_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    #[cfg_attr(
        not(feature = "test"),
        account(address = nina_publishing_credit_mint::ID),
    )]
    pub publishing_credit_mint: Account<'info, Mint>,
    pub payment_mint: Account<'info, Mint>,
    #[account(
        constraint = royalty_token_account.mint == payment_mint.key(),
        constraint = royalty_token_account.owner == *release_signer.key
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseInitializeWithCredit>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
) -> Result<()> {

    // Redeemer burn redeemable token
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_accounts = Burn {
        mint: ctx.accounts.publishing_credit_mint.to_account_info(),
        from: ctx.accounts.authority_publishing_credit_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info().clone(),
    };
    
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, 1)?;

    Release::release_init_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.release_mint.to_account_info().clone(),
        ctx.accounts.payment_mint.to_account_info().clone(),
        ctx.accounts.payer.to_account_info().clone(),
        ctx.accounts.authority.to_account_info().clone(),
        ctx.accounts.authority_token_account.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
        config,
        bumps,
    )?;

    emit!(ReleaseCreated {
        public_key: ctx.accounts.release.key(),
        mint: ctx.accounts.release_mint.key(),
        authority: ctx.accounts.authority.key(),
        date: config.release_datetime,
    });

    Ok(())
}