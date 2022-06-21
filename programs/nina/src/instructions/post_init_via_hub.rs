use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(
    hub_handle: String,
    slug: String,
    _uri: String,
)]
pub struct PostInitViaHub<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-post".as_ref(), hub.key().as_ref(), slug.as_ref()],
        bump,
        payer = author,
        space = 328
    )]
    pub post: AccountLoader<'info, Post>,
    #[account(
        init,
        seeds = [b"nina-hub-post".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = author,
        space = 244
    )]
    pub hub_post: AccountLoader<'info, HubPost>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = author,
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
}

pub fn handler (
    ctx: Context<PostInitViaHub>,
    _hub_handle: String,
    slug: String,
    uri: String,
) -> Result<()> {
    Post::post_init_helper(
        &mut ctx.accounts.author,
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.post,
        &mut ctx.accounts.hub_post,
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_collaborator,
        None,
        slug.clone(),
        uri.clone()
    )?;

    emit!(PostInitializedViaHub {
        public_key: ctx.accounts.post.key(),
        added_by: ctx.accounts.author.key(),
        hub: ctx.accounts.hub.key(),
        hub_post: ctx.accounts.hub_post.key(),
        slug: slug.clone(),
        uri: uri.clone(),
        datetime: Clock::get()?.unix_timestamp,
        hub_content: ctx.accounts.hub_content.key(),
        reference_content: None,
        reference_hub_content: None,
        reference_hub_content_child: None,
        reposted_from_hub: None,
    });

    Ok(())
}