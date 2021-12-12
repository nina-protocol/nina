use anchor_lang::prelude::*;
use anchor_spl::token::{Mint};
use solana_program::program_option::COption;

use crate::state::*;

#[derive(Accounts)]
pub struct RedeemableUpdateConfig<'info> {
    #[account(
        constraint = authority.key() == release.load()?.authority,
    )]
    pub authority: Signer<'info>,
    #[account(
        seeds = [b"nina-release".as_ref(), redeemable_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
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
        constraint = redeemable_mint.mint_authority == COption::Some(release.load()?.release_signer),
        constraint = redeemable_mint.key() == release.load()?.release_mint,
    )]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(
        constraint = redeemed_mint.mint_authority == COption::Some(redeemable_signer.key()),
    )]
    pub redeemed_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RedeemableUpdateConfig>,
    config: RedeemableConfig,
) -> ProgramResult {
    let mut redeemable = ctx.accounts.redeemable.load_mut()?;

    let mut encryption_public_key_array = [0u8; 120];
    encryption_public_key_array[..config.encryption_public_key.len()].copy_from_slice(&config.encryption_public_key);
    redeemable.encryption_public_key = encryption_public_key_array;

    let description_bytes = config.description.as_bytes();
    let mut description = [0u8; 280];
    description[..description_bytes.len()].copy_from_slice(description_bytes);
    redeemable.description = description;


    Ok(())
}