use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, MintTo, Burn, Token, Mint};
use solana_program::program_option::COption;

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RedeemableRedeem<'info> {
    pub redeemer: Signer<'info>,
    #[account(
        mut,
        constraint = redeemable_mint.mint_authority == COption::Some(release.load()?.release_signer),
        constraint = redeemable_mint.key() == release.load()?.release_mint,
    )]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = redeemed_mint.mint_authority == COption::Some(redeemable_signer.key()),
    )]
    pub redeemed_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [b"nina-redeemable".as_ref(), release.key().as_ref(), redeemed_mint.key().as_ref()],
        bump,
    )]
    pub redeemable: AccountLoader<'info, Redeemable>,
    #[account(
        seeds = [b"nina-redeemable-signer".as_ref(), redeemable.key().as_ref()],
        bump,
    )]
    pub redeemable_signer: UncheckedAccount<'info>,
    #[account(
        seeds = [b"nina-release".as_ref(), redeemable_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(zero)]
    pub redemption_record: AccountLoader<'info, RedemptionRecord>,
    #[account(
        mut,
        constraint = redeemer_redeemable_token_account.owner == *redeemer.key,
        constraint = redeemer_redeemable_token_account.mint == redeemable_mint.key(),
    )]
    pub redeemer_redeemable_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = redeemer_redeemed_token_account.owner == *redeemer.key,
        constraint = redeemer_redeemed_token_account.mint == redeemed_mint.key(),
    )]
    pub redeemer_redeemed_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<RedeemableRedeem>,
    encryption_public_key: Vec<u8>,
    address: Vec<u8>,
    iv: Vec<u8>,
) -> ProgramResult {
    let mut redeemable = ctx.accounts.redeemable.load_mut()?;

    if redeemable.redeemed_count >= redeemable.redeemed_max {
        return Err(ErrorCode::NoMoreRedeemablesAvailable.into())
    }

    // Redeemer burn redeemable token
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_accounts = Burn {
        mint: ctx.accounts.redeemable_mint.to_account_info(),
        to: ctx.accounts.redeemer_redeemable_token_account.to_account_info(),
        authority: ctx.accounts.redeemer.to_account_info().clone(),
    };
    
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, 1)?;

    // Redeemed Mint MintTo Redeemer
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_accounts = MintTo {
        mint: ctx.accounts.redeemed_mint.to_account_info(),
        to: ctx.accounts.redeemer_redeemed_token_account.to_account_info(),
        authority: ctx.accounts.redeemable_signer.to_account_info().clone(),
    };

    let seeds = &[
        b"nina-redeemable-signer".as_ref(),
        ctx.accounts.redeemable.to_account_info().key.as_ref(),
        &[redeemable.bumps.signer],
    ];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, 1)?;

    let mut redemption_record = ctx.accounts.redemption_record.load_init()?;
    redemption_record.redeemer = *ctx.accounts.redeemer.to_account_info().key;
    redemption_record.redeemable = *ctx.accounts.redeemable.to_account_info().key;
    redemption_record.release = *ctx.accounts.release.to_account_info().key;

    let mut address_array = [0u8; 272];
    address_array[..address.len()].copy_from_slice(&address);
    redemption_record.address = address_array;

    let mut iv_array = [0u8; 16];
    iv_array[..iv.len()].copy_from_slice(&iv);
    redemption_record.iv = iv_array;

    let mut encryption_public_key_array = [0u8; 120];
    encryption_public_key_array[..encryption_public_key.len()].copy_from_slice(&encryption_public_key);
    redemption_record.encryption_public_key = encryption_public_key_array;

    redeemable.redeemed_count +=1;

    emit!(RedeemableRedeemed {
        authority: *ctx.accounts.redeemer.to_account_info().key,
        public_key: *ctx.accounts.redemption_record.to_account_info().key,
        release: *ctx.accounts.release.to_account_info().key,
    });

    Ok(())
}