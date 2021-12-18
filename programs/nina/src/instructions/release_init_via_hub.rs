use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token, Burn};

use crate::state::*;

#[derive(Accounts)]
pub struct ReleaseInitializeViaHub<'info> {
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub release: AccountLoader<'info, Release>,
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), payer.key().as_ref()],
        bump,
        constraint = hub_artist.artist == payer.key(),
    )]
    pub hub_artist: Box<Account<'info, HubArtist>>,
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    pub hub_curator: UncheckedAccount<'info>,
    #[account(
        constraint = hub_curator_usdc_token_account.owner == hub_curator.key(),
        constraint = hub_curator_usdc_token_account.mint == payment_mint.key(),
    )]
    pub hub_curator_usdc_token_account: Box<Account<'info, TokenAccount>>,
    pub release_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,
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
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseInitializeViaHub>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
) -> ProgramResult {
    Release::release_init_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.release_mint.to_account_info().clone(),
        ctx.accounts.payment_mint.to_account_info().clone(),
        ctx.accounts.payer.to_account_info().clone(),
        ctx.accounts.authority.to_account_info().clone(),
        ctx.accounts.authority_token_account.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
        config,
        bumps,
    )?;

    let hub = ctx.accounts.hub.load()?;
    &ctx.accounts.release.load();
    Release::release_revenue_share_transfer_handler (
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.authority.to_account_info().key,
        *ctx.accounts.hub_curator.to_account_info().key,
        ctx.accounts.hub_curator_usdc_token_account.to_account_info().clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        hub.fee,
        true,
    )?;

    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.hub = ctx.accounts.hub.key();
    hub_release.release = ctx.accounts.release.key();

    Ok(())
}