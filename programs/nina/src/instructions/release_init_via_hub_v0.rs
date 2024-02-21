use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Mint, Token};
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
#[instruction(
    _config: ReleaseConfig,
    _bumps: ReleaseBumps,
    _metadata_data: ReleaseMetadataData,
)]
pub struct ReleaseInitializeViaHubV0<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        bump,
        payer = payer,
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
        mut,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
        constraint = hub_collaborator.collaborator == authority.key(),
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
        space = 120
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
        space = 153
    )]
    pub hub_content: Box<Account<'info, HubContent>>,
    /// CHECK: This is safe because we are deriving the PDA from hub - which is initialized above
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        constraint = hub_wallet.owner == hub_signer.key(),
        constraint = hub_wallet.mint == payment_mint.key() 
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
        constraint = royalty_token_account.owner == release_signer.key(),
        constraint = royalty_token_account.mint == payment_mint.key(),
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
    /// CHECK: This is safe because we check in the handler that authority === payer 
    /// or that payer is nina operated file-service wallet
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,
}

pub fn handler(
    ctx: Context<ReleaseInitializeViaHubV0>,
    config: ReleaseConfig,
    bumps: ReleaseBumps,
    metadata_data: ReleaseMetadataData,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::ReleaseInitDelegatedPayerMismatch.into());
        }
    }

    Hub::hub_collaborator_can_add_or_publish_content(
        &mut ctx.accounts.hub_collaborator,
        true
    )?;

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
        ctx.accounts.payer.clone(),
        ctx.accounts.metadata_program.to_account_info().clone(),
        ctx.accounts.system_program.clone(),
        ctx.accounts.release.clone(),
        metadata_data.clone(),
        bumps,
    )?;

    Hub::hub_release_create_handler(
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_release,
        ctx.accounts.release.clone(),
        ctx.accounts.authority.key(),
        true,
        None,
    )?;

    Ok(())
}
