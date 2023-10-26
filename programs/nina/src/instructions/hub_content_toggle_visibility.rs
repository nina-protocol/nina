use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;
use crate::utils::{file_service_account};

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct HubContentToggleVisibility<'info> {
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
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), content_account.key().as_ref()],
        bump,
    )]
    pub hub_content: Account<'info, HubContent>,
    /// CHECK: This is okay bc we check hub_content.added_by and hub.authority to authorize changes below
    pub content_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    ctx: Context<HubContentToggleVisibility>,
    _hub_handle: String,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubContentToggleVisibilityDelegatedPayerMismatch.into());
        }
    }

    let hub = ctx.accounts.hub.load()?;
    let hub_content = &mut ctx.accounts.hub_content;

    // Only hub curator and release authority can remove a hub release
    if *ctx.accounts.authority.to_account_info().key != hub.authority &&
       *ctx.accounts.authority.to_account_info().key != hub_content.added_by {
        return Err(error!(ErrorCode::HubContentCannotBeToggledUnauthorized));
    }

    hub_content.visible = !hub_content.visible;

    Ok(())
}
