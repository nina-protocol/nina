use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct HubAddRelease<'info> {
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
        payer = authority,
        space  = 120
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = authority,
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
    Hub::hub_collaborator_can_add_or_publish_content(
        &mut ctx.accounts.hub_collaborator,
        false
    )?;
    
    Hub::hub_release_create_handler(
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_release,
        ctx.accounts.release.clone(),
        ctx.accounts.authority.clone(),
        false,
        if ctx.remaining_accounts.len() == 1 {Some(ctx.remaining_accounts[0].clone())} else {None}
    )?;

    emit!(HubReleaseAdded {
        public_key: ctx.accounts.hub_release.key(),
        hub:ctx.accounts.hub.key(),
        release: ctx.accounts.release.key(),
        datetime: Clock::get()?.unix_timestamp,
        hub_content: ctx.accounts.hub_content.key(),
        added_by: ctx.accounts.authority.key(),
        published_through_hub: false,
        reposted_from_hub: if ctx.remaining_accounts.len() == 1 {Some(ctx.remaining_accounts[0].key())} else {None}
    });

    Ok(())
}
