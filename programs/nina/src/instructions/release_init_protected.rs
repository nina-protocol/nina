use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, MintTo, SetAuthority, Token};

use crate::state::*;
use crate::errors::*;
use crate::utils::{nina_publishing_account};

#[derive(Accounts)]
pub struct ReleaseInitializeProtected<'info> {
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub release: Loader<'info, Release>,
	#[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    pub release_mint: Account<'info, Mint>,
    #[account(
        mut,
        address = nina_publishing_account::ID
    )]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == payment_mint.key(),
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = authority_release_token_account.owner == authority.key(),
        constraint = authority_release_token_account.mint == release_mint.key(),
    )]
    pub authority_release_token_account: Box<Account<'info, TokenAccount>>,
    pub payment_mint: Account<'info, Mint>,
    #[account(
        constraint = royalty_token_account.mint == payment_mint.key(),
        constraint = royalty_token_account.owner == *release_signer.key
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.vault_signer,
        constraint = vault_token_account.mint == release_mint.key(),
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [b"nina-vault".as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseInitializeProtected>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
) -> ProgramResult {
    // Hard code fee that publishers pay in their release to the NinaVault
    let vault_fee_percentage = 12500;

    // Expand math to calculate vault fee avoiding floats
    let mut vault_fee = ((config.amount_total_supply * 1000000) * vault_fee_percentage) / 1000000;

    // Releases are not fractional and the fee rounds up all fractions to ensure at least 1 release is paid as fee
    if vault_fee % 1000000 > 0 {
        vault_fee += 1000000
    }

    // Unexpand math
    vault_fee = vault_fee / 1000000;
    
    if vault_fee != config.amount_to_vault_token_account {
        return Err(ErrorCode::InvalidVaultFee.into());
    }


    if config.amount_to_artist_token_account + 
       config.amount_to_vault_token_account > 
       config.amount_total_supply {
        return Err(ErrorCode::InvalidAmountMintToArtist.into())
    }

    let mut release = ctx.accounts.release.load_init()?;
    release.authority = *ctx.accounts.authority.to_account_info().key;
    release.payer = *ctx.accounts.payer.to_account_info().key;
    release.release_signer = *ctx.accounts.release_signer.to_account_info().key;
    release.release_mint = *ctx.accounts.release_mint.to_account_info().key;
    release.authority_token_account = *ctx.accounts.authority_token_account.to_account_info().key;
    release.royalty_token_account = *ctx.accounts.royalty_token_account.to_account_info().key;
    release.payment_mint = *ctx.accounts.payment_mint.to_account_info().key;

    release.price = config.price;
    release.total_supply = config.amount_total_supply;
    release.remaining_supply = config.amount_total_supply - config.amount_to_artist_token_account - config.amount_to_vault_token_account;
    release.resale_percentage = config.resale_percentage;
    release.release_datetime = config.release_datetime as i64;

    release.total_collected = 0 as u64;
    release.sale_counter = 0 as u64;
    release.sale_total = 0 as u64;
    release.exchange_sale_counter = 0 as u64;
    release.exchange_sale_total = 0 as u64;
    release.bumps = bumps;

    release.append_royalty_recipient({
        RoyaltyRecipient {
            recipient_authority: *ctx.accounts.authority.to_account_info().key,
            recipient_token_account: *ctx.accounts.authority_token_account.to_account_info().key,
            percent_share: 1000000 as u64,
            owed: 0 as u64,
            collected: 0 as u64,
        }
    })?;

    //Transfer Mint Authority To release_signer PDA
    // Need to do this for Metaplex
    let cpi_accounts = SetAuthority {
        current_authority: ctx.accounts.payer.to_account_info(),
        account_or_mint: ctx.accounts.release_mint.to_account_info()
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::set_authority(cpi_ctx, AuthorityType::MintTokens.into(), Some(release.release_signer))?;

    //MintTo Artist
    if config.amount_to_artist_token_account > 0 {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.release_mint.to_account_info(),
            to: ctx.accounts.authority_release_token_account.to_account_info(),
            authority: ctx.accounts.release_signer.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info().clone();

        let seeds = &[
            ctx.accounts.release.to_account_info().key.as_ref(),
            &[release.bumps.signer],
        ];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, config.amount_to_artist_token_account)?;
    };

    //MintTo Vault
    let cpi_accounts = MintTo {
        mint: ctx.accounts.release_mint.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.release_signer.to_account_info().clone(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();

    let seeds = &[
        ctx.accounts.release.to_account_info().key.as_ref(),
        &[release.bumps.signer],
    ];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, config.amount_to_vault_token_account)?;

    Ok(())
}