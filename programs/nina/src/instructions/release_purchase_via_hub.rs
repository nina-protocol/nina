use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};

use crate::state::*;

#[derive(Accounts)]
#[instruction(
    _amount: u64,
    hub_name: String
)]
pub struct ReleasePurchaseViaHub<'info> {
    pub payer: Signer<'info>,
    /// CHECK: the payer is usually the purchaser, though they can purchase for another account (receiver)
    /// This is safe because we don't care who the payer sets as receiver.
    pub receiver: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = royalty_token_account,
        has_one = release_signer,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
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
        constraint = payer_token_account.owner == *payer.key,
        constraint = payer_token_account.mint == release.load()?.payment_mint
    )]
    pub payer_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = receiver_release_token_account.owner == *receiver.key,
        constraint = receiver_release_token_account.mint == release.load()?.release_mint
    )]
    pub receiver_release_token_account: Box<Account<'info, TokenAccount>>,
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
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,    
    )]
    pub hub: AccountLoader<'info, HubV1>,
    #[account(
        mut,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
    )]
    pub hub_release: Box<Account<'info, HubReleaseV1>>,
    /// CHECK: This is safe because PDA is derived from hub which is checked above
    #[account(
        constraint = hub.load()?.curator == hub_curator.key(),
    )]
    pub hub_curator: UncheckedAccount<'info>,
    /// CHECK: This is safe because PDA is derived from hub which is checked above
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
    _hub_name: String,
) -> Result<()> {
    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.sales = u64::from(hub_release.sales)
        .checked_add(1)
        .unwrap();

    Release::release_purchase_handler(
        ctx.accounts.payer.clone(),
        ctx.accounts.receiver.clone(),
        &ctx.accounts.release,
        ctx.accounts.release_signer.clone(),
        ctx.accounts.payer_token_account.clone(),
        ctx.accounts.receiver_release_token_account.clone(),
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
    let referral_amount = u64::from(amount)
        .checked_mul(hub.referral_fee)
        .unwrap()
        .checked_div(1000000)
        .unwrap();
    token::transfer(cpi_ctx, referral_amount)?;    

    emit!(ReleaseSoldViaHub {
        public_key: *ctx.accounts.release.to_account_info().key,
        purchaser: *ctx.accounts.receiver.to_account_info().key,
        hub: *ctx.accounts.hub.to_account_info().key,
        date: ctx.accounts.clock.unix_timestamp
    });

    Ok(())
}