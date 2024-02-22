use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};

#[account(zero_copy)]
#[repr(packed)]
#[repr(C)]
pub struct Redeemable {
    pub authority: Pubkey,
    pub release: Pubkey,
    pub redeemable_signer: Pubkey,
    pub redeemable_mint: Pubkey,
    pub redeemed_mint: Pubkey,
    pub encryption_public_key: [u8; 120],
    pub redeemed_count: u64,
    pub redeemed_max: u64,
    pub description: [u8; 280],
    pub bumps: RedeemableBumps,
}

#[account(zero_copy)]
#[repr(packed)]
#[repr(C)]
pub struct RedemptionRecord {
    pub redeemer: Pubkey,
    pub redeemable: Pubkey,
    pub release: Pubkey,
    pub encryption_public_key: [u8; 120],
    pub iv: [u8; 16],
    pub address: [u8; 272],
    pub shipper: [u8; 32],
    pub tracking_number: [u8; 64],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy, Pod, Zeroable)]
#[repr(packed)]
#[repr(C)]
pub struct RedeemableBumps {
    pub redeemable: u8,
    pub signer: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RedeemableConfig {
    pub encryption_public_key: Vec<u8>,
    pub description: String,
    pub redeemed_max: u64,
}
