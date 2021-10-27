use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token};

use crate::state::*;
use crate::utils::{nina_publishing_account};

#[derive(Accounts)]
pub struct ReleaseInitializeProtected<'info> {
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub release: Loader<'info, Release>,
	#[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    pub release_mint: Account<'info, Mint>,
    #[account(
        mut,
        address = nina_publishing_account::ID
    )]
    pub payer: Signer<'info>,
    pub authority: UncheckedAccount<'info>,
    #[account(
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == payment_mint.key(),
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = authority_release_token_account.owner == authority.key(),
        constraint = authority_release_token_account.mint == release_mint.key(),
    )]
    pub authority_release_token_account: Box<Account<'info, TokenAccount>>,
    pub payment_mint: Account<'info, Mint>,
    #[account(
        constraint = royalty_token_account.mint == payment_mint.key(),
        constraint = royalty_token_account.owner == *release_signer.key
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.vault_signer,
        constraint = vault_token_account.mint == release_mint.key(),
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [b"nina-vault".as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseInitializeProtected>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
) -> ProgramResult {
    Release::release_init_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.release_mint.to_account_info().clone(),
        ctx.accounts.payment_mint.to_account_info().clone(),
        ctx.accounts.payer.to_account_info().clone(),
        ctx.accounts.authority.to_account_info().clone(),
        ctx.accounts.authority_token_account.to_account_info().clone(),
        ctx.accounts.authority_release_token_account.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        ctx.accounts.vault_token_account.to_account_info().clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        config,
        bumps,
    )?;

    Ok(())
}