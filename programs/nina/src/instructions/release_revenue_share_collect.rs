use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token};

use crate::state::*;

#[derive(Accounts)]
pub struct ReleaseRevenueShareCollect<'info> {
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
        seeds = [release.to_account_info().key.as_ref()],
        bump = release.load()?.bumps.signer,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = release_signer,
        has_one = royalty_token_account,
        seeds = [b"nina-release".as_ref(), release.load()?.release_mint.as_ref()],
        bump = release.load()?.bumps.release,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<ReleaseRevenueShareCollect>,
) -> ProgramResult {    

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
