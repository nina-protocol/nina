use anchor_lang::prelude::*;
use crate::utils::{nina_publishing_account};
use crate::state::*;
use anchor_spl::token::{self, Token, Mint, SetAuthority};

#[derive(Accounts)]
#[instruction(
	bumps: ReleaseBumps,
	metadata_data: ReleaseMetadataData,
)]
pub struct AdminMigrateReleaseMint<'info> {
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
	pub release_mint: Box<Account<'info, Mint>>,
	#[account(
        address = release.load()?.release_mint_seed,
        constraint = release_mint_seed.mint_authority == COption::Some(*release_signer.key),
	)]
	pub release_mint_seed: Account<'info, Mint>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
      seeds = [release.key().as_ref()],
      bump,
	)]
	pub release_signer: AccountInfo<'info>,
    /// CHECK: This is safe because it is initialized here
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    /// CHECK: This is safe because we check against ID
 	#[account(address = mpl_token_metadata::ID)]
    pub metadata_program: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
	ctx: Context<AdminMigrateReleaseMint>,
	bumps: ReleaseBumps,
	metadata_data: ReleaseMetadataData,
) -> Result<()> {
	let mut release = release_loader.load_mut()?;
	release.release_mint = ctx.account.release_mint.to_account_info().key;
	//Transfer Mint Authority To release_signer PDA
	// Need to do this for Metaplex
	let cpi_accounts = SetAuthority {
		current_authority: payer.to_account_info(),
		account_or_mint: release_mint.to_account_info()
	};
	let cpi_program = token_program.to_account_info().clone();
	let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
	token::set_authority(cpi_ctx, AuthorityType::MintTokens.into(), Some(release.release_signer))?;

	Ok(())
}