use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, TokenAccount, MintTo, Token, Mint};
use crate::utils::{dispatcher_account};

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleaseClaim<'info> {
    #[account(
        address = dispatcher_account::ID,
    )]
    pub payer: Signer<'info>,
    #[account(
        mut,
        has_one = release_signer,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because the PDA is derived from release which is checked above
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    /// CHECK: This is safe because we don't care about who is claiming the release
    pub recipient: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = recipient_release_token_account.owner == *recipient.key,
        constraint = recipient_release_token_account.mint == release.load()?.release_mint,
    )]
    pub recipient_release_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        address = release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Account<'info, Mint>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<ReleaseClaim>,
) -> Result<()> {
    let mut release = ctx.accounts.release.load_mut()?;

    if release.remaining_supply == 0 {
        return Err(error!(ErrorCode::SoldOut))
    }

    if ctx.accounts.recipient_release_token_account.amount > 0 {
        return Err(error!(ErrorCode::ReleaseAlreadyOwned))
    }

    // Update Counters
    release.remaining_supply = u64::from(release.remaining_supply)
        .checked_sub(1)
        .unwrap();
    release.sale_counter = u64::from(release.sale_counter)
        .checked_add(1)
        .unwrap();  

    //MintTo RecipientReleaseTokenAccount
    let cpi_accounts = MintTo {
        mint: ctx.accounts.release_mint.to_account_info(),
        to: ctx.accounts.recipient_release_token_account.to_account_info(),
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

    Ok(())
}