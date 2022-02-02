use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleasePurchaseViaHub<'info> {
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
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    #[account(
        constraint = hub.load()?.curator == hub_curator.key(),
    )]
    pub hub_curator: UncheckedAccount<'info>,
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = hub_token_account.owner == hub_signer.key(),
        constraint = hub_token_account.mint == release.load()?.payment_mint
    )]
    pub hub_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<ReleasePurchaseViaHub>,
    amount: u64,
) -> ProgramResult {
    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.sales += 1;

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

    // Transfer referral fee from Payer to Hub curator
    let cpi_accounts = Transfer {
        from: ctx.accounts.payer_token_account.to_account_info(),
        to: ctx.accounts.hub_token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info().clone(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let hub = ctx.accounts.hub.load()?;
    let referral_amount = (amount * hub.referral_fee) / 1000000;
    token::transfer(cpi_ctx, referral_amount)?;    

    emit!(ReleaseSoldViaHub {
        public_key: *ctx.accounts.release.to_account_info().key,
        purchaser: *ctx.accounts.purchaser.to_account_info().key,
        hub: *ctx.accounts.hub.to_account_info().key,
        date: ctx.accounts.clock.unix_timestamp
    });

    Ok(())
}