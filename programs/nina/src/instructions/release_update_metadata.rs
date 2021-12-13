use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke_signed},
    program_option::{COption},
};
use anchor_spl::token::{Mint, Token};
use metaplex_token_metadata::{
    self,
    state::{Creator},
    instruction::{create_metadata_accounts},
};

use crate::state::*;
use crate::utils::{metaplex_program_public_key, pressing_plant_account};

#[derive(Accounts)]
pub struct ReleaseUpdateMetadata<'info> {
    #[account(mut)]
    #[cfg_attr(
        not(feature = "test"),
        account(address = pressing_plant_account::ID),
    )]
    pub payer: Signer<'info>,
    #[account(
        has_one = release_signer,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: AccountInfo<'info>,
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    #[account(
        address = release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Account<'info, Mint>,
    pub token_metadata_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseUpdateMetadata>,
    metadata_data: ReleaseMetadataData,
) -> ProgramResult {
    let release = ctx.accounts.release.load()?;

    let seeds = &[
        ctx.accounts.release.to_account_info().key.as_ref(),
        &[release.bumps.signer],
    ];

    let creators: Vec<Creator> =
        vec![Creator {
            address: *ctx.accounts.release_signer.to_account_info().key,
            verified: true,
            share: 100,
        }];

    let metadata_infos = vec![
        ctx.accounts.metadata.clone(),
        ctx.accounts.release_mint.to_account_info().clone(),
        ctx.accounts.release_signer.clone(),
        ctx.accounts.payer.to_account_info().clone(),
        ctx.accounts.token_metadata_program.clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        ctx.accounts.system_program.to_account_info().clone(),
        ctx.accounts.rent.to_account_info().clone(),
        ctx.accounts.release.to_account_info().clone(),
    ];

    invoke_signed(
        &create_metadata_accounts(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.release_mint.key(),
            ctx.accounts.release_signer.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.release_signer.key(),
            metadata_data.name,
            metadata_data.symbol,
            metadata_data.uri.clone(),
            Some(creators),
            metadata_data.seller_fee_basis_points,
            true,
            false,
        ),
        metadata_infos.as_slice(),
        &[seeds],
    )?;
    
    emit!(ReleaseMetadataUpdated {
        public_key: ctx.accounts.release.key(),
        metadata_public_key: *ctx.accounts.metadata.to_account_info().key,
        uri: metadata_data.uri
    });

    Ok(())
}