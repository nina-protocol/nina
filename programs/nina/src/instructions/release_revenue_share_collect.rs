use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

use crate::state::*;

#[derive(Accounts)]
pub struct ReleaseRevenueShareCollect<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = authority_token_account.owner == *authority.key,
        constraint = authority_token_account.mint == release.load()?.payment_mint
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = royalty_token_account.owner == *release_signer.key,
        constraint = royalty_token_account.mint == release.load()?.payment_mint
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = release_mint.key() == release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        has_one = release_signer,
        has_one = royalty_token_account,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump = release.load()?.bumps.release,
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.to_account_info().key.as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<ReleaseRevenueShareCollect>,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::ReleaseRevenueShareCollectDelegatePayerMismatch.into());
        }
    }

    Release::release_revenue_share_collect_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.authority.to_account_info().key,
        ctx.accounts.authority_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
    )?;

    Ok(())
}
