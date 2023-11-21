use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use solana_program::program_option::COption;
use crate::state::*;
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleaseOpenToLimitedEdition<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
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
    pub release_signer: AccountInfo<'info>,
    #[account(
        mut,
        address = release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Account<'info, Mint>,
}

pub fn handler(
  ctx: Context<ReleaseOpenToLimitedEdition>,
  amount: u64,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::ReleaseCloseEditionDelegatePayerMismatch.into());
        }
    }

    if amount < ctx.accounts.release.load()?.sale_counter {
        return Err(ErrorCode::ReleaseOpenToLimitedEditionInvalidAmount.into());
    }

    let mut release = ctx.accounts.release.load_mut()?;
    release.remaining_supply = amount - release.sale_counter;
    release.total_supply = amount;

    Ok(())
}