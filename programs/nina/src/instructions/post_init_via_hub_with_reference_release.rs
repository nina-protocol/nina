use anchor_lang::prelude::*;
use crate::state::*;


#[derive(Accounts)]
#[instruction(
    hub_handle: String,
    slug: String,
    _uri: String,
)]
pub struct PostInitViaHubWithReferenceRelease<'info> {
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
        init_if_needed,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), reference_release.key().as_ref()],
        bump,
        payer = author,
        space = 153
    )]
    pub reference_release_hub_content: Box<Account<'info, HubContent>>,
    #[account(
        init_if_needed,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), reference_release.key().as_ref()],
        bump,
        payer = author,
        space  = 120
    )]
    pub reference_release_hub_release: Box<Account<'info, HubRelease>>,
    pub reference_release: AccountLoader<'info, Release>,
    #[account(
        mut,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), author.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    //    Remaining Accounts
    //    Only needed if reposted
    //    reposted_from_hub
}

pub fn handler (
    ctx: Context<PostInitViaHubWithReferenceRelease>,
    _hub_handle: String,
    slug: String,
    uri: String,
) -> Result<()> {
    let release = &ctx.accounts.reference_release;

    Post::post_init_helper(
        ctx.accounts.author.key(),
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.post,
        &mut ctx.accounts.hub_post,
        &mut ctx.accounts.hub_content,
        &mut ctx.accounts.hub_collaborator,
        Some(release.clone()),
        slug.clone(),
        uri.clone()
    )?;

    let reference_release_hub_content = &mut ctx.accounts.reference_release_hub_content;
    let reference_release_hub_release = &mut ctx.accounts.reference_release_hub_release;

    reference_release_hub_content.added_by = ctx.accounts.author.key();
    reference_release_hub_content.hub = ctx.accounts.hub.key();
    reference_release_hub_content.child = reference_release_hub_release.key();
    reference_release_hub_content.content_type = HubContentType::NinaReleaseV1;
    reference_release_hub_content.datetime = Clock::get()?.unix_timestamp;
    reference_release_hub_content.published_through_hub = false;
    reference_release_hub_content.visible = true;
    reference_release_hub_release.hub = ctx.accounts.hub.key();
    reference_release_hub_release.release = release.key();
    reference_release_hub_release.sales = 0;

    if ctx.remaining_accounts.len() == 1 {
        reference_release_hub_content.reposted_from_hub = ctx.remaining_accounts[0].key();
    }

    Ok(())
}