use anchor_lang::prelude::*;
use crate::state::*;

#[account(zero_copy)]
#[repr(packed)]
// size = 8 + 32 + 8 + 8 + 100 + 100 (+ 40) = 296
pub struct Post {
    pub author: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    pub slug: [u8; 100],
	pub uri:  [u8; 100],
}

impl Post {
    pub fn post_init_helper<'info> (
        author: &mut Signer<'info>,
        hub: AccountLoader<'info, Hub>,
        post_account_loader: &mut AccountLoader<'info, Post>,
        hub_post_account_loader: &mut AccountLoader<'info, HubPost>,
        hub_content_account: &mut Account<'info, HubContent>,
        hub_collaborator: &mut Account<'info, HubCollaborator>,
        reference_release: Option<AccountLoader<'info, Release>>,
        slug: String,
        uri: String,    
    ) -> Result<()> {    
        Hub::hub_collaborator_can_add_or_publish_content(
            hub_collaborator,
            false
       )?;
    
        let mut post = post_account_loader.load_init()?;
        post.author = author.key();
        post.created_at = Clock::get()?.unix_timestamp;
        post.updated_at = post.created_at;
    
        let mut slug_array = [0u8; 100];
        slug_array[..slug.len()].copy_from_slice(&slug.as_bytes());
        post.slug = slug_array;
    
        let mut uri_array = [0u8; 100];
        uri_array[..uri.len()].copy_from_slice(&uri.as_bytes());
        post.uri = uri_array;
    
        let hub_content = hub_content_account;
        hub_content.added_by = author.key();
        hub_content.hub = hub.key();
        hub_content.child = hub_post_account_loader.key();
        hub_content.content_type = HubContentType::Post;
        hub_content.datetime = post.created_at;
        hub_content.visible = true;
        hub_content.published_through_hub = true;

        let mut hub_post = hub_post_account_loader.load_init()?;
        hub_post.hub = hub.key();
        hub_post.post = post_account_loader.key();
        hub_post.version_uri = uri_array;

        if reference_release.is_some() {
            let release = reference_release.unwrap();        
            hub_post.reference_content = Some(release.key());
            hub_post.reference_content_type = HubContentType::NinaReleaseV1;
        }      

        Ok(())
    }
}

#[event]
pub struct PostInitializedViaHub {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub hub_post: Pubkey,
	pub slug: String,
	pub uri: String,
    pub datetime: i64,
    pub hub_content: Pubkey,
    pub reference_content: Option<Pubkey>,
    pub reference_hub_content: Option<Pubkey>,
    pub reference_hub_content_child: Option<Pubkey>,
    pub added_by: Pubkey,
    pub reposted_from_hub: Pubkey,
}

#[event]
pub struct PostUpdatedViaHub {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub hub_post: Pubkey,
	pub uri: String,
}
