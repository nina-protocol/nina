use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer};

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ExchangeCancel<'info> {
    pub initializer: Signer<'info>,
    #[account(
        mut,
        constraint = initializer_sending_token_account.owner == *initializer.key,
        constraint = initializer_sending_token_account.key() == exchange.initializer_sending_token_account,
    )]
    pub initializer_sending_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        close = initializer,
        constraint = exchange.initializer == *initializer.key,
        constraint = exchange.exchange_escrow_token_account == exchange_escrow_token_account.key(),
        has_one = exchange_escrow_token_account,
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        constraint = exchange_escrow_token_account.owner == *exchange_signer.key,
    )]
    pub exchange_escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [exchange.to_account_info().key.as_ref()],
        bump = exchange.bump,
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
    ctx: Context<ExchangeCancel>,
    amount: u64,
) -> ProgramResult {
    let exchange = &mut ctx.accounts.exchange;

    if exchange.initializer_amount != amount {
        return Err(ErrorCode::ExchangeCancelAmountMismatch.into());
    }
    let seeds = &[
        exchange.to_account_info().key.as_ref(),
        &[exchange.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_accounts = Transfer {
        from: ctx.accounts.exchange_escrow_token_account.to_account_info(),
        to: ctx.accounts.initializer_sending_token_account.to_account_info(),
        authority: ctx.accounts.exchange_signer.to_account_info().clone(),
    };

    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;            

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