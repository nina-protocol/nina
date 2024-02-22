use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token, Burn};
use solana_program::program_option::COption;
use mpl_token_metadata::types::DataV2;

use crate::state::*;
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleaseUpdateMetadata<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we check in the handler that authority === payer 
    /// or that payer is nina operated file-service wallet
    pub authority: UncheckedAccount<'info>,
    #[account(
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        constraint = release.load()?.authority == authority.key(),
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(
      mut,
      address = release.load()?.release_mint,
      constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Box<Account<'info, Mint>>,
    /// CHECK: This is safe because it is initialized here
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is safe because we check against ID
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseUpdateMetadata>,
    bumps: ReleaseBumps,
    metadata_data: ReleaseMetadataData,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::ReleaseUpdateMetadataDelegatePayerMismatch.into());
        }
    }

    Release::update_metadata_handler(
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.metadata.to_account_info().clone(),
        ctx.accounts.metadata_program.to_account_info().clone(),
        ctx.accounts.release.clone(),
        metadata_data.clone(),
        bumps,
    )?;

    Ok(())
}