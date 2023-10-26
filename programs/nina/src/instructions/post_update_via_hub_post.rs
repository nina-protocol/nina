use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    hub_handle: String,
    slug: String,
    _uri: String,
)]
pub struct PostUpdateViaHubPost<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    ///CHECK: This is safe bc we check constraints
    #[account(
        constraint = author.key() == post.load()?.author
    )]
    pub author: UncheckedAccount<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
      mut,
      seeds = [b"nina-post".as_ref(), hub.key().as_ref(), slug.as_ref()],
      bump,
    )]
    pub post: AccountLoader<'info, Post>,
    #[account(
        mut,
        seeds = [b"nina-hub-post".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
    )]
    pub hub_post: AccountLoader<'info, HubPost>,
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), author.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
}

pub fn handler (
    ctx: Context<PostUpdateViaHubPost>,
    _hub_handle: String,
    _slug: String,
    uri: String,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.author.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::PostUpdateViaHubPostDelegatePayerMismatch.into());
        }
    }

    let mut post = ctx.accounts.post.load_mut()?;

    let mut uri_array = [0u8; 100];
    uri_array[..uri.len()].copy_from_slice(&uri.as_bytes());
    post.uri = uri_array;
    post.updated_at = Clock::get()?.unix_timestamp;

    let mut hub_post = ctx.accounts.hub_post.load_mut()?;
    hub_post.version_uri = uri_array;
    
    Ok(())
}
