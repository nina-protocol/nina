use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;
use crate::utils::{file_service_account};

#[derive(Accounts)]
#[instruction(
    _can_add_content: bool,
    _can_add_collaborator: bool,
    _allowance: i8,
    hub_handle: String,
)]
pub struct HubUpdateCollaboratorPermissions<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
    )]
    pub authority_hub_collaborator: Account<'info, HubCollaborator>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), collaborator.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    /// CHECK: This is safe because we are checking the HubCollaborator above
    pub collaborator: UncheckedAccount<'info>,
}

pub fn handler (
    ctx: Context<HubUpdateCollaboratorPermissions>,
    can_add_content: bool,
    can_add_collaborator: bool,
    allowance: i8,
    _hub_handle: String,
) -> Result<()> {  
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubUpdateCollaboratorPermissionsDelegatePayerMismatch.into());
        }
    }

    if ctx.accounts.authority.key() != ctx.accounts.hub.load()?.authority {
      return Err(error!(ErrorCode::HubCollaboratorCannotUpdateHubCollaboratorUnauthorized))
    }
  
    let hub_collaborator = &mut ctx.accounts.hub_collaborator;
    hub_collaborator.can_add_content = can_add_content;
    hub_collaborator.can_add_collaborator = can_add_collaborator;
    hub_collaborator.allowance = allowance;
    
    Ok(())
}
