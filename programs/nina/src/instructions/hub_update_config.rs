use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{file_service_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    _uri: String,
    hub_handle: String,
    _publish_fee: u64,
    _referral_fee: u64,
)]
pub struct HubUpdateConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = hub.load()?.authority == authority.key(),
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
}

pub fn handler (
    ctx: Context<HubUpdateConfig>,
    uri: String,
    _hub_handle: String,
    publish_fee: u64,
    referral_fee: u64,
) -> Result<()> {
    if ctx.accounts.payer.key() != ctx.accounts.authority.key() {
        if ctx.accounts.payer.key() != file_service_account::ID {
            return Err(ErrorCode::HubUpdateConfigDelegatePayerMismatch.into());
        }
    }

    Hub::check_hub_fees(
        publish_fee,
        referral_fee
    )?;

    let mut hub = ctx.accounts.hub.load_mut()?;

    let mut uri_array = [0u8; 100];
    uri_array[..uri.len()].copy_from_slice(&uri.as_bytes());
    
    hub.uri = uri_array;
    hub.publish_fee = publish_fee;
    hub.referral_fee = referral_fee;
    
    Ok(())
}
