use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token};
use anchor_lang::solana_program::{
    program::{invoke_signed},
};
use mpl_token_metadata::{
    self,
    state::{Creator},
    instruction::{create_metadata_accounts_v2},
};
use crate::state::*;

#[derive(Accounts)]
#[instruction(
    _config: ReleaseConfig,
    _bumps: ReleaseBumps,
    _metadata_data: ReleaseMetadataData,
    hub_name: String
)]
pub struct ReleaseInitializeViaHub<'info> {
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = authority,
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: AccountInfo<'info>,
    #[account(
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
        constraint = hub_artist.artist == authority.key(),
    )]
    pub hub_artist: Box<Account<'info, HubArtist>>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,    
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = authority,
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    /// CHECK: This is safe because we check hub via seeds above
    #[account(
        constraint = hub.load()?.curator == hub_curator.key(),
    )]
    pub hub_curator: UncheckedAccount<'info>,
    #[account(
        constraint = hub_curator_token_account.owner == hub_curator.key(),
        constraint = hub_curator_token_account.mint == payment_mint.key(),
    )]
    pub hub_curator_token_account: Box<Account<'info, TokenAccount>>,
    pub release_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == payment_mint.key(),
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    pub payment_mint: Account<'info, Mint>,
    #[account(
        constraint = royalty_token_account.mint == payment_mint.key(),
        constraint = royalty_token_account.owner == *release_signer.key
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is safe because it is initialized here
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    /// CHECK: This is safe because we check against ID
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseInitializeViaHub>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
    metadata_data: ReleaseMetadataData,
    _hub_name: String,
) -> Result<()> {
    let seeds = &[
        ctx.accounts.release.to_account_info().key.as_ref(),
        &[bumps.signer],
    ];

    Release::release_init_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.release_mint.to_account_info().clone(),
        ctx.accounts.payment_mint.to_account_info().clone(),
        ctx.accounts.authority.to_account_info().clone(),
        ctx.accounts.authority.to_account_info().clone(),
        ctx.accounts.authority_token_account.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
        config,
        bumps,
    )?;

    let hub = ctx.accounts.hub.load()?;
    Release::release_revenue_share_transfer_handler (
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.authority.to_account_info().key,
        *ctx.accounts.hub_curator.to_account_info().key,
        ctx.accounts.hub_curator_token_account.to_account_info().clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        hub.publish_fee,
        true,
    )?;

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
        ctx.accounts.authority.to_account_info().clone(),
        ctx.accounts.metadata_program.clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        ctx.accounts.system_program.to_account_info().clone(),
        ctx.accounts.rent.to_account_info().clone(),
        ctx.accounts.release.to_account_info().clone(),
    ];

    invoke_signed(
        &create_metadata_accounts_v2(
            ctx.accounts.metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.release_mint.key(),
            ctx.accounts.release_signer.key(),
            ctx.accounts.authority.key(),
            ctx.accounts.release_signer.key(),
            metadata_data.name,
            metadata_data.symbol,
            metadata_data.uri.clone(),
            Some(creators),
            metadata_data.seller_fee_basis_points,
            true,
            false,
            None,
            None
        ),
        metadata_infos.as_slice(),
        &[seeds],
    )?;

    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.hub = ctx.accounts.hub.key();
    hub_release.release = ctx.accounts.release.key();
    hub_release.published_through_hub = true;
    hub_release.sales = 0;
    
    emit!(HubReleaseAdded {
        public_key: ctx.accounts.hub_release.key(),
        hub: ctx.accounts.hub.key(),
        release: ctx.accounts.release.key(),
    });

    Ok(())
}
