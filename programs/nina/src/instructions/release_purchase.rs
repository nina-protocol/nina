use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, TokenAccount, Token, Mint};

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleasePurchase<'info> {
    pub payer: Signer<'info>,
    pub purchaser: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = royalty_token_account,
        has_one = release_signer,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = payer_token_account.owner == *payer.key,
        constraint = payer_token_account.mint == release.load()?.payment_mint
    )]
    pub payer_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = purchaser_release_token_account.owner == *purchaser.key,
        constraint = purchaser_release_token_account.mint == release.load()?.release_mint
    )]
    pub purchaser_release_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = royalty_token_account.owner == *release_signer.key,
        constraint = royalty_token_account.mint == release.load()?.payment_mint
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        address = release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Account<'info, Mint>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<ReleasePurchase>,
    amount: u64,
) -> ProgramResult {
    Release::release_purchase_handler(
        ctx.accounts.payer.clone(),
        ctx.accounts.purchaser.clone(),
        &ctx.accounts.release,
        ctx.accounts.release_signer.clone(),
        ctx.accounts.payer_token_account.clone(),
        ctx.accounts.purchaser_release_token_account.clone(),
        ctx.accounts.royalty_token_account.clone(),
        ctx.accounts.release_mint.clone(),
        ctx.accounts.token_program.clone(),
        ctx.accounts.clock.clone(),
        amount,
    )?;

    emit!(ReleaseSold {
        public_key: *ctx.accounts.release.to_account_info().key,
        purchaser: *ctx.accounts.purchaser.to_account_info().key,
        date: ctx.accounts.clock.unix_timestamp
    });

    Ok(())
}