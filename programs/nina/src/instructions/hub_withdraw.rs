use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};

use crate::utils::{file_service_account};
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    amount: u64,
    hub_handle: String
)]
pub struct HubWithdraw<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        constraint = hub.load()?.authority == authority.key(),
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,    
    )]
    pub hub: AccountLoader<'info, Hub>,
    /// CHECK: This is safe because we derive PDA from hub and check hub.authority
    #[account(
        constraint = hub.load()?.hub_signer == hub_signer.key(),
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = withdraw_target.owner == hub_signer.key(),
        constraint = withdraw_target.mint == withdraw_mint.key()
    )]
    pub withdraw_target: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = withdraw_destination.owner == *authority.key,
        constraint = withdraw_destination.mint == withdraw_mint.key()
    )]
    pub withdraw_destination: Box<Account<'info, TokenAccount>>,
    pub withdraw_mint: Account<'info, Mint>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<HubWithdraw>,
    amount: u64,
    _hub_handle: String,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubWithdrawDelegatedPayerMismatch.into());
        }
    }

    if ctx.accounts.withdraw_target.amount < amount {
        return Err(error!(ErrorCode::HubWithdrawAmountTooHigh));
    }

    if amount <= 0 {
        return Err(error!(ErrorCode::HubWithdrawAmountMustBeGreaterThanZero));
    }

    let hub = ctx.accounts.hub.load()?;

    //Withdraw to Authority Token Account
    let cpi_accounts = Transfer {
        from: ctx.accounts.withdraw_target.to_account_info(),
        to: ctx.accounts.withdraw_destination.to_account_info(),
        authority: ctx.accounts.hub_signer.to_account_info().clone(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();

    let seeds = &[
        b"nina-hub-signer".as_ref(),
        ctx.accounts.hub.to_account_info().key.as_ref(),
        &[hub.hub_signer_bump],
    ];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
