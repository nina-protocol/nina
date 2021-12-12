use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct RedeemableShippingUpdate<'info> {
    pub authority: Signer<'info>,
    #[account(
        constraint = redeemable.load()?.authority == *authority.key
    )]
    pub redeemable: AccountLoader<'info, Redeemable>,
    #[account(
        mut,
        constraint = redemption_record.load()?.redeemable == *redeemable.to_account_info().key
    )]
    pub redemption_record: AccountLoader<'info, RedemptionRecord>,
}

pub fn handler(
    ctx: Context<RedeemableShippingUpdate>,
    shipper: Vec<u8>,
    tracking_number: Vec<u8>,
) -> ProgramResult {
    let mut redemption_record = ctx.accounts.redemption_record.load_mut()?;

    let mut shipper_array = [0u8; 32];
    shipper_array[..shipper.len()].copy_from_slice(&shipper);
    redemption_record.shipper = shipper_array;

    let mut tracking_number_array = [0u8; 64];
    tracking_number_array[..tracking_number.len()].copy_from_slice(&tracking_number);
    redemption_record.tracking_number = tracking_number_array;

    Ok(())
}
