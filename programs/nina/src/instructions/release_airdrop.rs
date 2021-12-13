use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::{COption},
};
use anchor_spl::token::{self, TokenAccount, MintTo, Token, Mint};

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ReleaseAirdrop<'info> {
    #[account(
        constraint = release.load()?.authority == payer.key(),
    )]
    pub payer: Signer<'info>,
    #[account(
        mut,
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
    pub recipient: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = recipient_release_token_account.owner == *recipient.key,
        constraint = recipient_release_token_account.mint == release.load()?.release_mint
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
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<ReleaseAirdrop>,
) -> ProgramResult {
    let mut release = ctx.accounts.release.load_mut()?;

    if release.remaining_supply == 0 {
        return Err(ErrorCode::SoldOut.into())
    }

    // Update Counters
    release.remaining_supply -= 1;

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