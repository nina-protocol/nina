use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token};

use crate::state::*;
use crate::utils::{wrapped_sol};

#[derive(Accounts)]
pub struct ExchangeCancelSol<'info> {
    pub initializer: Signer<'info>,
    #[account(
        mut,
        close = initializer,
        constraint = exchange.initializer == *initializer.key,
        constraint = exchange.exchange_escrow_token_account == exchange_escrow_token_account.key(),
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        constraint = exchange_escrow_token_account.owner == *exchange_signer.key,
        constraint = exchange_escrow_token_account.mint == wrapped_sol::ID,
        constraint = exchange_escrow_token_account.mint == exchange.initializer_sending_mint,
    )]
    pub exchange_escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [exchange.to_account_info().key.as_ref()],
        bump,
    )]
    pub exchange_signer: UncheckedAccount<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[access_control(Exchange::cancel_amount_validation(
    &ctx.accounts.exchange,
    amount,
))]
pub fn handler(
    ctx: Context<ExchangeCancelSol>,
    amount: u64,
) -> ProgramResult {
    Exchange::close_escrow_token_account(
        ctx.accounts.initializer.to_account_info(),
        &ctx.accounts.exchange,
        ctx.accounts.exchange_signer.to_account_info(),
        ctx.accounts.exchange_escrow_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    )?;

    emit!(ExchangeCancelled {
        public_key: *ctx.accounts.exchange.to_account_info().key,
    });

    Ok(())
}