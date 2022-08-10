use anchor_lang::prelude::*;
use crate::utils::{nina_publishing_account};
use crate::state::*;

#[derive(Accounts)]
pub struct AdminSetReleaseMint<'info> {
	#[cfg_attr(
		not(feature = "test"),
		account(address = address = nina_publishing_account::ID),
	)]
	pub admin: Signer<'info>,
	#[account(
		mut,
		seeds = [b"nina-release".as_ref(), release_mint_seed.key().as_ref()],
		bump,
	)]
	pub release: AccountLoader<'info, Release>,
	#[account(
        mut,
        address = release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
	pub release_mint: Account<'info, Mint>,
	#[account(
        address = release.load()?.release_mint_seed,
        constraint = release_mint_seed.mint_authority == COption::Some(*release_signer.key),
	)]
	pub release_mint_seed: Account<'info, Mint>,
}

pub fn handler(
	ctx: Context<AdminSetReleaseMint>,
) -> Result<()> {
	let mut release = release_loader.load_mut()?;
	release.release_mint = ctx.account.release_mint_seed.to_account_info().key;

	Ok(())
}