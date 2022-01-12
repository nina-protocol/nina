use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke},
    program_option::{COption},
};

use anchor_spl::token::{self, TokenAccount, MintTo, Transfer, Token, Mint};
use spl_token::instruction::{close_account};

use crate::state::*;
use crate::errors::ErrorCode;
use crate::utils::{wrapped_sol};

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
    let mut release = ctx.accounts.release.load_mut()?;

    if !(release.release_datetime < ctx.accounts.clock.unix_timestamp) {
        return Err(ErrorCode::ReleaseNotLive.into());
    }

    if release.remaining_supply == 0 {
        return Err(ErrorCode::SoldOut.into())
    }

    if amount != release.price {
        return Err(ErrorCode::WrongAmount.into())
    };

    // Transfer USDC from Payer to Royalty USDC Account
    let cpi_accounts = Transfer {
        from: ctx.accounts.payer_token_account.to_account_info(),
        to: ctx.accounts.royalty_token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info().clone(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Update Sales Counters
    release.total_collected += amount;
    release.sale_counter += 1;
    release.sale_total += amount;
    release.remaining_supply -= 1;

    //Update Royalty Recipent Counters
    release.update_royalty_recipients_owed(amount);

    //MintTo PurchaserReleaseTokenAccount
    let cpi_accounts = MintTo {
        mint: ctx.accounts.release_mint.to_account_info(),
        to: ctx.accounts.purchaser_release_token_account.to_account_info(),
        authority: ctx.accounts.release_signer.to_account_info().clone(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();

    let seeds = &[
        ctx.accounts.release.to_account_info().key.as_ref(),
        &[release.bumps.signer],
    ];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, 1)?;

    if release.payment_mint == wrapped_sol::ID {
        invoke(
            &close_account(
                ctx.accounts.token_program.to_account_info().key,
                ctx.accounts.payer_token_account.to_account_info().key,
                ctx.accounts.payer.to_account_info().key,
                ctx.accounts.payer.to_account_info().key,
                &[],
            )?,
            &[
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.payer_token_account.to_account_info().clone(),
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
            ]
        )?;
    }

    emit!(ReleaseSold {
        public_key: *ctx.accounts.release.to_account_info().key,
        date: ctx.accounts.clock.unix_timestamp
    });

    Ok(())
}