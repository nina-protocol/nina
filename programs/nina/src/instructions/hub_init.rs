use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};
use crate::state::*;
use crate::utils::{wrapped_sol,file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(params: HubInitParams)]
pub struct HubInit<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we check in the handler that authority === payer 
    /// or that payer is nina operated file-service wallet
    pub authority: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-hub".as_ref(), params.handle.as_bytes()],
        bump,
        payer = payer,
        space = 337
    )]
    pub hub: AccountLoader<'info, Hub>,
    /// CHECK: This is safe because we are deriving the PDA from hub - which is initialized above
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
        payer = payer,
        space = 147,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    pub system_program: Program<'info, System>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubInit>,
    params: HubInitParams,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubInitDelegatePayerMismatch.into());
        }
    }

    Hub::check_hub_fees(
        params.publish_fee,
        params.referral_fee
    )?;
    
    let mut hub = ctx.accounts.hub.load_init()?;
    hub.authority = *ctx.accounts.authority.to_account_info().key;
    hub.hub_signer = *ctx.accounts.hub_signer.to_account_info().key;
    hub.publish_fee = params.publish_fee;
    hub.referral_fee = params.referral_fee;
    hub.total_fees_earned = 0;
    hub.datetime = Clock::get()?.unix_timestamp;
    hub.hub_signer_bump = params.hub_signer_bump;

    let mut handle_array = [0u8; 100];
    handle_array[..params.handle.len()].copy_from_slice(&params.handle.as_bytes());
    hub.handle = handle_array;

    let mut uri_array = [0u8; 100];
    uri_array[..params.uri.len()].copy_from_slice(&params.uri.as_bytes());
    hub.uri = uri_array;

    let hub_collaborator = &mut ctx.accounts.hub_collaborator;
    hub_collaborator.hub = ctx.accounts.hub.key();
    hub_collaborator.collaborator = ctx.accounts.authority.key();
    hub_collaborator.can_add_content = true;
    hub_collaborator.can_add_collaborator = true;
    hub_collaborator.allowance = -1;
    hub_collaborator.datetime = hub.datetime;

    Ok(())
}
