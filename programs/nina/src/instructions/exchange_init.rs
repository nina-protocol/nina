use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke},
};
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};
use spl_token::instruction::{close_account};

use crate::state::*;
use crate::errors::ErrorCode;
use crate::utils::{wrapped_sol};

#[derive(Accounts)]
pub struct ExchangeInitialize<'info> {
    pub initializer: Signer<'info>,
    #[account(
        constraint = release_mint.key() == release.load()?.release_mint,
    )]
    pub release_mint: Account<'info, Mint>,
    #[account(
        constraint = initializer_expected_token_account.owner == *initializer.key,
        constraint = initializer_expected_token_account.mint == initializer_expected_mint.key(),
    )]
    pub initializer_expected_token_account: Box<Account<'info, TokenAccount>>,
    pub initializer_expected_mint: Account<'info, Mint>,
    pub initializer_sending_mint: Account<'info, Mint>,
    #[account(zero)]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        constraint = initializer_sending_token_account.owner == *initializer.key,
        constraint = initializer_sending_token_account.mint == initializer_sending_mint.key(),
    )]
    pub initializer_sending_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = exchange_escrow_token_account.owner == *exchange_signer.key,
        constraint = exchange_escrow_token_account.mint == initializer_sending_mint.key(),
    )]
    pub exchange_escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [exchange.key().as_ref()],
        bump,
    )]
    pub exchange_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<ExchangeInitialize>,
    config: ExchangeConfig,
    bump: u8,
) -> ProgramResult {
    if config.expected_amount <= 0 || config.initializer_amount <= 0 {
        return Err(ErrorCode::PriceTooLow.into());
    }

    let exchange = &mut ctx.accounts.exchange;
    exchange.release_mint = *ctx.accounts.release_mint.to_account_info().key;
    exchange.release = *ctx.accounts.release.to_account_info().key;
    exchange.initializer = *ctx.accounts.initializer.to_account_info().key;
    exchange.initializer_sending_token_account = *ctx.accounts.initializer_sending_token_account.to_account_info().key;
    exchange.initializer_sending_mint = *ctx.accounts.initializer_sending_mint.to_account_info().key;
    exchange.initializer_expected_token_account = *ctx.accounts.initializer_expected_token_account.to_account_info().key;
    exchange.initializer_expected_mint = *ctx.accounts.initializer_expected_mint.to_account_info().key;
    exchange.exchange_escrow_token_account = *ctx.accounts.exchange_escrow_token_account.to_account_info().key;
    exchange.exchange_signer = *ctx.accounts.exchange_signer.to_account_info().key;
    exchange.is_selling = config.is_selling;
    exchange.expected_amount = config.expected_amount;
    exchange.initializer_amount = config.initializer_amount;
    exchange.bump = bump;

    // Ensure exchange is valid
    
    Release::is_exchange_valid(
        *ctx.accounts.release.load()?,
        exchange.initializer_sending_mint,
        exchange.initializer_expected_mint,
        exchange.is_selling,
    )?;

    // transfer offer assets to escrow
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_accounts = Transfer {
        from: ctx.accounts.initializer_sending_token_account.to_account_info(),
        to: ctx.accounts.exchange_escrow_token_account.to_account_info(),
        authority: ctx.accounts.initializer.to_account_info().clone(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, exchange.initializer_amount)?;

    // if initializer is sending wrapped sol
    if exchange.initializer_sending_mint == wrapped_sol::ID {
        // We wil be closing initializer_sending_token_account used to wrap sol
        // If initializer_sending_token_account includes more than amount expected throw an error
        // this account is probably not one that we want to be closing
        if ctx.accounts.initializer_sending_token_account.amount != exchange.initializer_amount {
            return Err(ErrorCode::NotUsingTemporaryTokenAccount.into());
        }
        
        invoke(
            // close initializer_sending_token_account - a temp wrapped sol account
            // and return lamports to the initializer
            &close_account(
                ctx.accounts.token_program.to_account_info().key,
                ctx.accounts.initializer_sending_token_account.to_account_info().key,
                ctx.accounts.initializer.to_account_info().key,
                ctx.accounts.initializer.to_account_info().key,
                &[],
            )?,
            &[
                ctx.accounts.initializer.to_account_info().clone(),
                ctx.accounts.initializer_sending_token_account.to_account_info().clone(),
                ctx.accounts.initializer.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
            ]
        )?;
    }

    emit!(ExchangeAdded {
        public_key: *ctx.accounts.exchange.to_account_info().key,
        release: *ctx.accounts.release.to_account_info().key,
        release_mint: *ctx.accounts.release.to_account_info().key,
        initializer: *ctx.accounts.initializer.to_account_info().key,
        expected_amount: config.expected_amount,
        initializer_amount: config.initializer_amount
    });

    Ok(())
}