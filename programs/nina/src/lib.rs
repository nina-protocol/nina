use anchor_lang::prelude::*;

declare_id!("ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod utils;

use state::*;
use instructions::*;

#[program]
pub mod nina {
    use super::*;

    pub fn release_init_protected(
        ctx: Context<ReleaseInitializeProtected>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
    ) -> ProgramResult {
        instructions::release_init_protected::handler(ctx, config, bumps)
    }

    pub fn release_init_with_credit(
        ctx: Context<ReleaseInitializeWithCredit>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
    ) -> ProgramResult {
        instructions::release_init_with_credit::handler(ctx, config, bumps)
    }

    pub fn release_init_via_hub(
        ctx: Context<ReleaseInitializeViaHub>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
    ) -> ProgramResult {
        instructions::release_init_via_hub::handler(ctx, config, bumps)
    }


    pub fn release_purchase(
        ctx: Context<ReleasePurchase>,
        amount: u64,
    ) -> ProgramResult {
        instructions::release_purchase::handler(ctx, amount)
    }

    pub fn release_revenue_share_collect(
        ctx: Context<ReleaseRevenueShareCollect>,
    ) -> ProgramResult {
        instructions::release_revenue_share_collect::handler(ctx)
    }

    pub fn release_revenue_share_transfer(
        ctx: Context<ReleaseRevenueShareTransfer>,
        transfer_share: u64,
    ) -> ProgramResult {
        instructions::release_revenue_share_transfer::handler(ctx, transfer_share)
    }

    pub fn release_airdrop(
        ctx: Context<ReleaseAirdrop>,
    ) -> ProgramResult {
        instructions::release_airdrop::handler(ctx)
    }

    pub fn release_update_metadata(
        ctx: Context<ReleaseUpdateMetadata>,
        metadata_data: ReleaseMetadataData
    ) -> ProgramResult {
        instructions::release_update_metadata::handler(ctx, metadata_data)
    }

    pub fn redeemable_init(
        ctx: Context<RedeemableInitialize>,
        config: RedeemableConfig,
        bumps: RedeemableBumps,
    ) -> ProgramResult {
        instructions::redeemable_init::handler(ctx, config, bumps)
    }

    pub fn redeemable_update_config(
        ctx: Context<RedeemableUpdateConfig>,
        config: RedeemableConfig,
    ) -> ProgramResult {
        instructions::redeemable_update_config::handler(ctx, config)
    }

    pub fn redeemable_redeem(
        ctx: Context<RedeemableRedeem>,
        encryption_public_key: Vec<u8>,
        address: Vec<u8>,
        iv: Vec<u8>,
    ) -> ProgramResult {
        instructions::redeemable_redeem::handler(ctx, encryption_public_key, address, iv)
    }

    pub fn redeemable_shipping_update(
        ctx: Context<RedeemableShippingUpdate>,
        shipper: Vec<u8>,
        tracking_number: Vec<u8>,
    ) -> ProgramResult {
        instructions::redeemable_shipping_update::handler(ctx, shipper, tracking_number)
    }

    pub fn exchange_init(
        ctx: Context<ExchangeInitialize>,
        config: ExchangeConfig,
        bump: u8,
    ) -> ProgramResult {
        instructions::exchange_init::handler(ctx, config, bump)
    }

    pub fn exchange_cancel(
        ctx: Context<ExchangeCancel>,
        amount: u64,
    ) -> ProgramResult {
        instructions::exchange_cancel::handler(ctx, amount)
    }

    pub fn exchange_cancel_sol(
        ctx: Context<ExchangeCancelSol>,
        amount: u64,
    ) -> ProgramResult {
        instructions::exchange_cancel_sol::handler(ctx, amount)
    }

    pub fn exchange_accept(
        ctx: Context<ExchangeAccept>,
        params: ExchangeAcceptParams,
    ) -> ProgramResult {
        instructions::exchange_accept::handler(ctx, params)
    }

    pub fn vault_init(
        ctx: Context<VaultInitialize>,
        bumps: VaultBumps,
    ) -> ProgramResult {
        instructions::vault_init::handler(ctx, bumps)
    }

    pub fn vault_withdraw(
        ctx: Context<VaultWithdraw>,
        amount: u64,
    ) -> ProgramResult {
        instructions::vault_withdraw::handler(ctx, amount)
    }

    pub fn hub_init(
        ctx: Context<HubInit>,
        params: HubInitParams,
    ) -> ProgramResult {
        instructions::hub_init::handler(ctx, params)
    }

    pub fn hub_add_artist(
        ctx: Context<HubAddArtist>,
    ) -> ProgramResult {
        instructions::hub_add_artist::handler(ctx)
    }

    pub fn hub_add_release(
        ctx: Context<HubAddRelease>,
    ) -> ProgramResult {
        instructions::hub_add_release::handler(ctx)
    }

    pub fn hub_remove_artist(
        ctx: Context<HubRemoveArtist>,
    ) -> ProgramResult {
        instructions::hub_remove_artist::handler(ctx)
    }

    pub fn hub_remove_release(
        ctx: Context<HubRemoveRelease>,
    ) -> ProgramResult {
        instructions::hub_remove_release::handler(ctx)
    }

}
