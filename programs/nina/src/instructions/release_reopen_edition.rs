use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use solana_program::program_option::COption;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleaseReopenEdition<'info> {
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
    ctx: Context<ReleaseReopenEdition>,
    amount: u64,
    price: u64,
) -> Result<()> {
    let mut release = ctx.accounts.release.load_mut()?;

    if release.sale_counter != 0 {
        return Err(ErrorCode::ReleaseSaleAlreadyStartedCannotReopen.into());
    }

    release.total_supply = amount;
    release.remaining_supply = amount;
    release.price = price;

    Ok(())
}