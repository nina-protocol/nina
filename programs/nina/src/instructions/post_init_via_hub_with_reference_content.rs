use anchor_lang::prelude::*;
use crate::state::*;


#[derive(Accounts)]
#[instruction(
    hub_handle: String,
    slug: String,
    _uri: String,
)]
pub struct PostInitViaHubWithReferenceContent<'info> {
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
        space = 8 + 32 + 8 + 8 + 80 + 80 + 32 + 40
    )]
    pub post: AccountLoader<'info, Post>,
    #[account(
        init,
        seeds = [b"nina-hub-post".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = author,
        space = 8 + 32 + 32 + 32 + 80 + 40
    )]
    pub hub_post: AccountLoader<'info, HubPost>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = author,
    )]
    pub hub_content: Account<'info, HubContent>,
    pub reference_hub_content: Account<'info, HubContent>,
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
    ctx: Context<PostInitViaHubWithReferenceContent>,
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
        Some(ctx.accounts.reference_hub_content.clone()),
        slug,
        uri
   )?;

    Ok(())
}