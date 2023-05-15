use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, SetAuthority, Token};
use solana_program::program_option::COption;

use crate::utils::{nina_publishing_account};
use crate::state::*;

#[derive(Accounts)]
pub struct RedeemableInitialize<'info> {
    #[account(
        mut,
        constraint = authority.key() == release.load()?.authority,
    )]
    /**
        Only nina_publishing_account can make redeemables.

        This functionality was put in place for The Soft LP, but 
        the interface for encrypting shipping info is precarious:

        if either party loses their encryption key which is stored in localStorage
        then they will never be able to decrypt existing shipping info again.

        This is especially bad in the case of an artist as they will not be able
        to fulfill any subsequent redemptions on that release.

        Redemptions either need to have better key maintenance ux or perhaps
        shouldn't happen on-chain at all.
    */
    #[cfg_attr(
        not(feature = "test"),
        account(address = address = nina_publishing_account::ID),
    )]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"nina-release".as_ref(), redeemable_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(
        init,
        seeds = [b"nina-redeemable".as_ref(), release.key().as_ref(), redeemed_mint.key().as_ref()],
        bump,
        payer = authority,
        space = 586,
    )]
    pub redeemable: AccountLoader<'info, Redeemable>,
    /// CHECK: This is safe because PDA is derived from redeemable which is initialized above
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
        constraint = redeemed_mint.mint_authority == COption::Some(authority.key()),
    )]
    pub redeemed_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<RedeemableInitialize>,
    config: RedeemableConfig,
    bumps: RedeemableBumps,
) -> Result<()> {
    let authority = *ctx.accounts.authority.to_account_info().key;
    
    let mut redeemable = ctx.accounts.redeemable.load_init()?;
    redeemable.authority = authority;
    redeemable.release = *ctx.accounts.release.to_account_info().key;
    redeemable.redeemable_signer = *ctx.accounts.redeemable_signer.to_account_info().key;
    redeemable.redeemable_mint = *ctx.accounts.redeemable_mint.to_account_info().key;
    redeemable.redeemed_mint = *ctx.accounts.redeemed_mint.to_account_info().key;
    redeemable.redeemed_max = config.redeemed_max;
    redeemable.redeemed_count = 0;
    redeemable.bumps = bumps;

    let mut encryption_public_key_array = [0u8; 120];
    encryption_public_key_array[..config.encryption_public_key.len()].copy_from_slice(&config.encryption_public_key);
    redeemable.encryption_public_key = encryption_public_key_array;

    let description_bytes = config.description.as_bytes();
    let mut description = [0u8; 280];
    description[..description_bytes.len()].copy_from_slice(description_bytes);
    redeemable.description = description;

    //Transfer Mint Authority To release_signer PDA
    // Need to do this for Metaplex
    let cpi_accounts = SetAuthority {
        current_authority: ctx.accounts.authority.to_account_info(),
        account_or_mint: ctx.accounts.redeemed_mint.to_account_info()
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::set_authority(cpi_ctx, AuthorityType::MintTokens.into(), Some(redeemable.redeemable_signer))?;

    Ok(())
}