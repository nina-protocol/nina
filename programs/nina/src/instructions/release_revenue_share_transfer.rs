use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::state::*;

#[derive(Accounts)]
pub struct ReleaseRevenueShareTransfer<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = authority_token_account.owner == *authority.key
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = royalty_token_account.owner == *release_signer.to_account_info().key,
        constraint = royalty_token_account.mint == release.load()?.payment_mint,
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = release_mint.key() == release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        address = release.load()?.release_mint_seed,
        constraint = release_mint_seed.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint_seed: Account<'info, Mint>,
    #[account(
        mut,
        has_one = release_signer,
        has_one = royalty_token_account,
        seeds = [b"nina-release".as_ref(), release_mint_seed.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.to_account_info().key.as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    /// CHECK: This is safe because we don't care who the authority is assigning as new_royalty_recipient
    pub new_royalty_recipient: UncheckedAccount<'info>,
    #[account(
        constraint = new_royalty_recipient_token_account.owner == *new_royalty_recipient.key,
    )]
    pub new_royalty_recipient_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseRevenueShareTransfer>,
    transfer_share: u64,
) -> Result<()> {
    // Collect Royalty so transferring user has no pending royalties
    Release::release_revenue_share_collect_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.authority.to_account_info().key,
        ctx.accounts.authority_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
    )?;

    Release::release_revenue_share_transfer_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.authority.to_account_info().key,
        *ctx.accounts.new_royalty_recipient.to_account_info().key,
        ctx.accounts.new_royalty_recipient_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
        transfer_share,
        false,
    )?;

    Ok(())
}