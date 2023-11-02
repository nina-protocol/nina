use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    _hub_handle: String,
    slug: String,
    _uri: String,
)]
pub struct PostInitViaHub<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-post".as_ref(), hub.key().as_ref(), slug.as_ref()],
        bump,
        payer = payer,
        space = 328
    )]
    pub post: AccountLoader<'info, Post>,
    #[account(
        init,
        seeds = [b"nina-hub-post".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = payer,
        space = 244
    )]
    pub hub_post: AccountLoader<'info, HubPost>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = payer,
        space = 153
    )]
    pub hub_content: Account<'info, HubContent>,
    #[account(
        mut,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), author.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is safe because we check in the handler that author === payer 
    /// or that payer is nina operated file-service wallet
    pub author: UncheckedAccount<'info>,
}

pub fn handler (
    ctx: Context<PostInitViaHub>,
    _hub_handle: String,
    slug: String,
    uri: String,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.author.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::PostInitViaHubDelegatePayerMismatch.into());
        }
    }

    Post::post_init_helper(
        ctx.accounts.author.key(),
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.post,
        &mut ctx.accounts.hub_post,
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_collaborator,
        None,
        slug.clone(),
        uri.clone()
    )?;

    Ok(())
}