use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct HubAddRelease<'info> {
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
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
        space  = 120
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
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Box<Account<'info, HubCollaborator>>,
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    //    Remaining Accounts
    //    Only needed if reposted
    //    reposted_from_hub
}

pub fn handler (
    ctx: Context<HubAddRelease>,
    _hub_handle: String,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubAddReleaseDelegatedPayerMismatch.into());
        }
    }

    Hub::hub_collaborator_can_add_or_publish_content(
        &mut ctx.accounts.hub_collaborator,
        false
    )?;
    
    Hub::hub_release_create_handler(
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_release,
        ctx.accounts.release.clone(),
        ctx.accounts.authority.key(),
        false,
        if ctx.remaining_accounts.len() == 1 {Some(ctx.remaining_accounts[0].clone())} else {None}
    )?;

    Ok(())
}
