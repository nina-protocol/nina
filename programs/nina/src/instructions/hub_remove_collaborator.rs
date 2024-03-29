use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;
use crate::utils::{file_service_account};

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct HubRemoveCollaborator<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), collaborator.key().as_ref()],
        bump,
        close = authority
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    /// CHECK: This is safe because it is checked against hub_collaborator which verifies the HubCollaboratorV1 by seeds
    #[account(
        constraint = collaborator.key() == hub_collaborator.collaborator,
    )]
    pub collaborator: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    ctx: Context<HubRemoveCollaborator>,
    _hub_handle: String,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubRemoveCollaboratorDelegatedPayerMismatch.into());
        }
    }

    let hub = ctx.accounts.hub.load()?;
    
    // Only authority of hub and collaborator in the HubCollaborator account can remove the account
    if ctx.accounts.authority.to_account_info().key != ctx.accounts.collaborator.to_account_info().key && 
        *ctx.accounts.authority.to_account_info().key != hub.authority {
        return Err(error!(ErrorCode::HubCollaboratorCannotBeRemovedFromHubUnauthorized));
    }

    // Authority cannot remove themself
    if *ctx.accounts.collaborator.to_account_info().key == hub.authority {
        return Err(error!(ErrorCode::HubCollaboratorCannotRemoveAuthorityFromHub));
    }

    Ok(())
}
