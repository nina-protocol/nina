use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token};
use crate::state::*;

#[derive(Accounts)]
#[instruction(
    _config: ReleaseConfig,
    _bumps: ReleaseBumps,
    _metadata_data: ReleaseMetadataData,
    hub_name: String
)]
pub struct ReleaseInitializeViaHub<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = authority,
        space = 1210
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: AccountInfo<'info>,
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
        constraint = hub_collaborator.collaborator == authority.key(),
    )]
    pub hub_collaborator: Box<Account<'info, HubCollaborator>>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,    
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = authority,
        space = 32 + 32 + 8 + 8 + 8
    )]
    pub hub_content: Box<Account<'info, HubContent>>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = authority,
        space = 32 + 32 + 8 + 1 + 8
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    /// CHECK: This is safe because we are deriving the PDA from hub - which is initialized above
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        constraint = hub_wallet.owner == hub_signer.key (),
        constraint = hub_wallet.key() == hub.load()?.hub_wallet 
    )]
    pub hub_wallet: Box<Account<'info, TokenAccount>>,
    pub release_mint: Box<Account<'info, Mint>>,
    #[account(
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == payment_mint.key(),
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    pub payment_mint: Box<Account<'info, Mint>>,
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
        *ctx.accounts.hub_signer.to_account_info().key,
        ctx.accounts.hub_wallet.to_account_info().clone(),
        ctx.accounts.token_program.to_account_info().clone(),
        hub.publish_fee,
        true,
    )?;

    Release::create_metadata_handler(
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.metadata.to_account_info().clone(),
        ctx.accounts.release_mint.clone(),
        ctx.accounts.authority.clone(),
        ctx.accounts.metadata_program.to_account_info().clone(),
        ctx.accounts.token_program.clone(),
        ctx.accounts.system_program.clone(),
        ctx.accounts.rent.clone(),
        ctx.accounts.release.clone(),
        metadata_data,
        bumps,
    )?;

    Hub::hub_release_create_handler(
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_release,
        ctx.accounts.release.clone(),
        ctx.accounts.authority.clone(),
    )?;

    Ok(())
}
