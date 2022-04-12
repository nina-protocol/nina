use anchor_lang::prelude::*;
use crate::state::*;

#[account(zero_copy)]
#[repr(packed)]
pub struct Post {
    pub author: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    pub slug: [u8; 100],
	pub uri:  [u8; 100],
	pub published_through_hub: Pubkey,
}

impl Post {
    pub fn post_init_helper<'info> (
        author: &mut Signer<'info>,
        hub: AccountLoader<'info, Hub>,
        post_account_loader: &mut AccountLoader<'info, Post>,
        hub_post_account_loader: &mut AccountLoader<'info, HubPost>,
        hub_content_account: &mut Account<'info, HubContent>,
        hub_collaborator: &mut Account<'info, HubCollaborator>,
        reference_hub_content: Option<Account<'info, HubContent>>,
        slug: String,
        uri: String,    
    ) -> Result<()> {    
        Hub::hub_collaborator_can_add_or_publish_content(
            hub_collaborator,
            false
       )?;
    
        let mut post = post_account_loader.load_init()?;
        post.author = author.key();
        post.published_through_hub = hub.key();
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
    
        let mut hub_post = hub_post_account_loader.load_init()?;
        hub_post.hub = hub.key();
        hub_post.post = post_account_loader.key();
        hub_post.version_uri = uri_array;
        if reference_hub_content.is_some() {
            hub_post.reference_hub_content = Some(reference_hub_content.unwrap().key());
        }      

        emit!(PostInitializedViaHub {
            public_key: post_account_loader.key(),
            hub: hub.key(),
            hub_post: hub_post_account_loader.key(),
            slug: slug,
            uri: uri,
        });

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
}

#[event]
pub struct PostUpdatedViaHub {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub hub_post: Pubkey,
	pub uri: String,
}
