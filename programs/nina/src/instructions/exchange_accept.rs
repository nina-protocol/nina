use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke_signed, invoke},
};
use anchor_spl::token::{self, TokenAccount, Token, Transfer};
use spl_token::instruction::{close_account};

use crate::state::*;
use crate::errors::ErrorCode;
use crate::utils::{wrapped_sol};

#[derive(Accounts)]
pub struct ExchangeAccept<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    /// CHECK: This is safe because we check against exchange.initializer
    #[account(mut)]
    pub initializer: AccountInfo<'info>,
    #[account(
        mut,
        close = initializer,
        constraint = exchange.initializer == *initializer.key,
        constraint = exchange.exchange_escrow_token_account == exchange_escrow_token_account.key(),
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        constraint = initializer_expected_token_account.owner == *initializer.key,
        constraint = initializer_expected_token_account.mint == exchange.initializer_expected_mint,
    )]
    pub initializer_expected_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = taker_expected_token_account.owner == *taker.key,
        constraint = taker_expected_token_account.mint == exchange.initializer_sending_mint,
    )]
    pub taker_expected_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = taker_sending_token_account.owner == *taker.key,
        constraint = taker_sending_token_account.mint == exchange.initializer_expected_mint,
    )]
    pub taker_sending_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = exchange_escrow_token_account.owner == *exchange_signer.key,
        constraint = exchange_escrow_token_account.mint == exchange.initializer_sending_mint,
    )]
    pub exchange_escrow_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is safe because we derive PDA from exchange and check exchange.initializer above
    #[account(
        seeds = [exchange.to_account_info().key.as_ref()],
        bump,
    )]
    pub exchange_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.vault_signer,
        constraint = vault_token_account.mint == release.load()?.payment_mint,
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [b"nina-vault".as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        constraint = royalty_token_account.owner == release.load()?.release_signer,
        constraint = royalty_token_account.mint == release.load()?.payment_mint,
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>, 
    #[account(zero)]
    pub exchange_history: Box<Account<'info, ExchangeHistory>>,
    #[account(
        mut,
        seeds = [b"nina-release".as_ref(), exchange.release_mint.as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<ExchangeAccept>,
    params: ExchangeAcceptParams,
) -> Result<()> {
    let vault_fee_percentage = 12500;
    let exchange = &mut ctx.accounts.exchange;
    let release = &mut ctx.accounts.release.load_mut()?;

    if release.resale_percentage != params.resale_percentage {
        return Err(error!(ErrorCode::RoyaltyPercentageIncorrect))
    }

    if exchange.expected_amount != params.expected_amount {
        return Err(error!(ErrorCode::ExpectedAmountMismatch))
    }

    if exchange.initializer_amount != params.initializer_amount {
        return Err(error!(ErrorCode::InitializerAmountMismatch))
    }

    let is_wrapped_sol = exchange.initializer_sending_mint == wrapped_sol::ID || exchange.initializer_expected_mint == wrapped_sol::ID;

    // Calculate amounts for transfers
    let amount_to_initializer;
    let amount_to_taker;
    let amount_to_vault;
    let amount_to_royalties;
    let price;
    let seller;
    let buyer;

    if exchange.is_selling {
        amount_to_royalties = u64::from(params.expected_amount)
            .checked_mul(params.resale_percentage)
            .unwrap()
            .checked_div(1000000)
            .unwrap();
        amount_to_initializer = u64::from(params.expected_amount)
            .checked_sub(amount_to_royalties)
            .unwrap();
        amount_to_taker = params.initializer_amount;
        seller = ctx.accounts.initializer.to_account_info().key;
        buyer = ctx.accounts.taker.to_account_info().key;
        price = params.expected_amount;
    } else {
        amount_to_royalties = u64::from(params.initializer_amount)
            .checked_mul(params.resale_percentage)
            .unwrap()
            .checked_div(1000000)
            .unwrap();
        amount_to_initializer = params.expected_amount;
        amount_to_taker = u64::from(params.initializer_amount)
            .checked_sub(amount_to_royalties)
            .unwrap();
        seller = ctx.accounts.taker.to_account_info().key;
        buyer = ctx.accounts.initializer.to_account_info().key;
        price = params.initializer_amount;
    }

    //escrow to taker
    let seeds = &[
        exchange.to_account_info().key.as_ref(),
        &[exchange.bump],
    ];
    let signer = &[&seeds[..]];

    if !exchange.is_selling || !is_wrapped_sol {
        // taker to initializer
        let cpi_program = ctx.accounts.token_program.to_account_info().clone();
        let cpi_accounts = Transfer {
            from: ctx.accounts.taker_sending_token_account.to_account_info(),
            to: ctx.accounts.initializer_expected_token_account.to_account_info(),
            authority: ctx.accounts.taker.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount_to_initializer)?;
    };

    if exchange.is_selling || !is_wrapped_sol {
        let cpi_program = ctx.accounts.token_program.to_account_info().clone();
        let cpi_accounts = Transfer {
            from: ctx.accounts.exchange_escrow_token_account.to_account_info(),
            to: ctx.accounts.taker_expected_token_account.to_account_info(),
            authority: ctx.accounts.exchange_signer.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount_to_taker)?;
    }

    // seller to vault and royalties
    if exchange.is_selling {
        let cpi_program = ctx.accounts.token_program.to_account_info().clone();
        let cpi_accounts = Transfer {
            from: ctx.accounts.taker_sending_token_account.to_account_info(),
            to: ctx.accounts.royalty_token_account.to_account_info(),
            authority: ctx.accounts.taker.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount_to_royalties)?;
    } else {
        let cpi_program = ctx.accounts.token_program.to_account_info().clone();
        let cpi_accounts = Transfer {
            from: ctx.accounts.exchange_escrow_token_account.to_account_info(),
            to: ctx.accounts.royalty_token_account.to_account_info(),
            authority: ctx.accounts.exchange_signer.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount_to_royalties)?;
    }

    // If initializer expects wrapped sol
    if exchange.initializer_expected_mint == wrapped_sol::ID {
        // We wil be closing taker_sending_token_account used to wrap sol
        // If taker_sending_token_account includes more than amount expected throw an error
        // this account is probably not one that we want to be closing
        if ctx.accounts.taker_sending_token_account.amount != params.expected_amount {
            return Err(error!(ErrorCode::NotUsingTemporaryTokenAccount));
        }

        // Keep track of the rent paid for taker_sending_token_account so we can return to taker later
        let taker_sending_token_account_lamports = u64::from(ctx.accounts.taker_sending_token_account.to_account_info().lamports())
            .checked_sub(amount_to_initializer)
            .unwrap();
        invoke(
            // close taker_sending_token_account assign lamports to the exchange account
            &close_account(
                ctx.accounts.token_program.to_account_info().key,
                ctx.accounts.taker_sending_token_account.to_account_info().key,
                exchange.to_account_info().key,
                ctx.accounts.taker.to_account_info().key,
                &[],
            )?,
            &[
                ctx.accounts.taker.to_account_info().clone(),
                ctx.accounts.taker_sending_token_account.to_account_info().clone(),
                exchange.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
            ],
        )?;

        // transfer amount_to_initializer from exchange account to initializer
        **exchange.to_account_info().try_borrow_mut_lamports()? = u64::from(exchange.to_account_info().try_lamports()?)
            .checked_sub(amount_to_initializer)
            .unwrap();
        **ctx.accounts.initializer.to_account_info().try_borrow_mut_lamports()? = u64::from(ctx.accounts.initializer.to_account_info().try_lamports()?)
            .checked_add(amount_to_initializer)
            .unwrap();
        
        // transfer taker_sending_token_account rent from exchange account to taker
        **exchange.to_account_info().try_borrow_mut_lamports()? = u64::from(exchange.to_account_info().try_lamports()?)
            .checked_sub(taker_sending_token_account_lamports)
            .unwrap();
        **ctx.accounts.taker.to_account_info().try_borrow_mut_lamports()? = u64::from(ctx.accounts.taker.to_account_info().try_lamports()?)
            .checked_add(taker_sending_token_account_lamports)
            .unwrap();
    }

    // If initializer sent wrapped sol
    if exchange.initializer_sending_mint == wrapped_sol::ID {
        // Keep track of the rent paid for exchange_escrow_token_account so we can return to taker later
        let exchange_escrow_token_account_lamports = u64::from(ctx.accounts.exchange_escrow_token_account.to_account_info().try_lamports()?)
            .checked_sub(amount_to_taker)
            .unwrap();
        invoke_signed(
            // close exchange_escrow_token_account assign lamports to the exchange account
            &close_account(
                ctx.accounts.token_program.to_account_info().key,
                ctx.accounts.exchange_escrow_token_account.to_account_info().key,
                exchange.to_account_info().key,
                ctx.accounts.exchange_signer.to_account_info().key,
                &[],
            )?,
            &[
                ctx.accounts.exchange_signer.to_account_info().clone(),
                ctx.accounts.exchange_escrow_token_account.to_account_info().clone(),
                exchange.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
            ],
            signer
        )?;

        // transfer amount_to_taker from exchange account to taker
        **exchange.to_account_info().try_borrow_mut_lamports()? = u64::from(exchange.to_account_info().try_lamports()?)
            .checked_sub(amount_to_taker)
            .unwrap();
        **ctx.accounts.taker.to_account_info().try_borrow_mut_lamports()? = u64::from(ctx.accounts.taker.to_account_info().try_lamports()?)
            .checked_add(amount_to_taker)
            .unwrap();

        // transfer exchange_escrow_token_account rent from exchange account to initializer
        **exchange.to_account_info().try_borrow_mut_lamports()? = u64::from(exchange.to_account_info().try_lamports()?)
            .checked_sub(exchange_escrow_token_account_lamports)
            .unwrap();
        **ctx.accounts.initializer.to_account_info().try_borrow_mut_lamports()? = u64::from(ctx.accounts.initializer.to_account_info().try_lamports()?)
            .checked_add(exchange_escrow_token_account_lamports)
            .unwrap();
    }       

    // Transfer rent lamports from Exchange back to Initializer - closing out the exchange account
    let exchange_lamports = exchange.to_account_info().try_lamports()?;
    **exchange.to_account_info().try_borrow_mut_lamports()? = 0;
    **ctx.accounts.initializer.to_account_info().try_borrow_mut_lamports()? = u64::from(ctx.accounts.initializer.to_account_info().try_lamports()?)
        .checked_add(exchange_lamports)
        .unwrap();

    // Update Sales Counters
    release.total_collected = u64::from(release.total_collected)
        .checked_add(amount_to_royalties)
        .unwrap();
    release.exchange_sale_counter = u64::from(release.exchange_sale_counter)
        .checked_add(1)
        .unwrap();
    release.exchange_sale_total = u64::from(release.exchange_sale_total)
        .checked_add(amount_to_royalties)
        .unwrap();

    //Update Royalty Recipent Counters
    release.update_royalty_recipients_owed(amount_to_royalties);

    // Create a state account to store the historical record of the exchange
    let exchange_history = &mut ctx.accounts.exchange_history;
    exchange_history.seller = *seller;
    exchange_history.buyer = *buyer;
    exchange_history.release = exchange.release;
    exchange_history.datetime = params.datetime;
    exchange_history.price = price;

    emit!(ExchangeCompleted {
        public_key: *ctx.accounts.exchange.to_account_info().key,
        taker: *ctx.accounts.taker.to_account_info().key,
        datetime: params.datetime
    });

    Ok(())
}