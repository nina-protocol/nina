use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token};
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct ReleaseInitialize<'info> {
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
    pub release_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we check in the handler that authority === payer 
    /// or that payer is nina operated file-service wallet
    pub authority: UncheckedAccount<'info>,
    #[account(
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == payment_mint.key(),
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    pub payment_mint: Account<'info, Mint>,
    #[account(
        constraint = royalty_token_account.mint == payment_mint.key(),
        constraint = royalty_token_account.owner == *release_signer.key
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is safe because it is initialized here
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    /// CHECK: This is safe because we check against ID
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseInitialize>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
    metadata_data: ReleaseMetadataData,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::ReleaseInitDelegatedPayerMismatch.into());
        }
    }

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

    Release::create_metadata_handler(
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.metadata.to_account_info().clone(),
        ctx.accounts.release_mint.clone(),
        ctx.accounts.authority.clone(),
        ctx.accounts.metadata_program.to_account_info().clone(),
        ctx.accounts.token_program.clone(),
        ctx.accounts.system_program.clone(),
        ctx.accounts.rent.clone(),
        ctx.accounts.release.clone(),
        metadata_data.clone(),
        bumps,
    )?;

    Ok(())
}