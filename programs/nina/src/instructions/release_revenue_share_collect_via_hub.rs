use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::state::*;

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct ReleaseRevenueShareCollectViaHub<'info> {
    #[account(
        mut,
        constraint = hub.load()?.authority == authority.key()
    )]
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = royalty_token_account.owner == *release_signer.key,
        constraint = royalty_token_account.mint == release.load()?.payment_mint
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        has_one = release_signer,
        has_one = royalty_token_account,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump = release.load()?.bumps.release,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(
        constraint = release_mint.key() == release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Box<Account<'info, Mint>>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.to_account_info().key.as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(
        constraint = hub.load()?.hub_signer == hub_signer.key(),
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    /// CHECK: This is safe because we are deriving the PDA from hub - which is initialized above
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = hub_wallet.owner == hub_signer.key(),
        constraint = hub_wallet.mint == release.load()?.payment_mint
    )]
    pub hub_wallet: Box<Account<'info, TokenAccount>>,  
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<ReleaseRevenueShareCollectViaHub>,
    _hub_handle: String,
) -> Result<()> {
    
    Release::release_revenue_share_collect_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.hub_signer.to_account_info().key,
        ctx.accounts.hub_wallet.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
    )?;

    Ok(())
}
