use anchor_lang::prelude::*;

declare_id!("77BKtqWTbTRxj5eZPuFbeXjx3qz4TTHoXRnpCejYWiQH");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod utils;

use state::*;
use instructions::*;

#[program]
pub mod nina {
    use super::*;

    pub fn release_init(
        ctx: Context<ReleaseInitialize>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
        metadata_data: ReleaseMetadataData
    ) -> Result<()> {
        instructions::release_init::handler(ctx, config, bumps, metadata_data)
    }

    pub fn release_init_via_hub(
        ctx: Context<ReleaseInitializeViaHub>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
        metadata_data: ReleaseMetadataData,
        hub_handle: String,
    ) -> Result<()> {
        instructions::release_init_via_hub::handler(ctx, config, bumps, metadata_data, hub_handle)
    }

    pub fn release_init_via_hub_v0(
        ctx: Context<ReleaseInitializeViaHubV0>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
        metadata_data: ReleaseMetadataData,
    ) -> Result<()> {
        instructions::release_init_via_hub_v0::handler(ctx, config, bumps, metadata_data)
    }

    pub fn release_purchase(
        ctx: Context<ReleasePurchase>,
        amount: u64,
    ) -> Result<()> {
        instructions::release_purchase::handler(ctx, amount)
    }

    pub fn release_purchase_via_hub(
        ctx: Context<ReleasePurchaseViaHub>,
        amount: u64,
        hub_name: String,
    ) -> Result<()> {
        instructions::release_purchase_via_hub::handler(ctx, amount, hub_name)
    }

    pub fn release_revenue_share_collect(
        ctx: Context<ReleaseRevenueShareCollect>,
    ) -> Result<()> {
        instructions::release_revenue_share_collect::handler(ctx)
    }

    pub fn release_revenue_share_collect_via_hub(
        ctx: Context<ReleaseRevenueShareCollectViaHub>,
        hub_handle: String,
    ) -> Result<()> {
        instructions::release_revenue_share_collect_via_hub::handler(ctx, hub_handle)
    }

    pub fn release_revenue_share_transfer(
        ctx: Context<ReleaseRevenueShareTransfer>,
        transfer_share: u64,
    ) -> Result<()> {
        instructions::release_revenue_share_transfer::handler(ctx, transfer_share)
    }

    pub fn release_update_metadata(
        ctx: Context<ReleaseUpdateMetadata>,
        bumps: ReleaseBumps,
        metadata_data:ReleaseMetadataData,
    ) -> Result <()> {
        instructions::release_update_metadata::handler(ctx, bumps, metadata_data)
    }

    pub fn release_close_edition(
        ctx: Context<ReleaseCloseEdition>,
    ) -> Result<()> {
        instructions::release_close_edition::handler(ctx)
    }

    pub fn release_claim(
        ctx:Context<ReleaseClaim>,
    ) -> Result<()> {
        instructions::release_claim::handler(ctx)
    }

    pub fn redeemable_init(
        ctx: Context<RedeemableInitialize>,
        config: RedeemableConfig,
        bumps: RedeemableBumps,
    ) -> Result<()> {
        instructions::redeemable_init::handler(ctx, config, bumps)
    }

    pub fn redeemable_update_config(
        ctx: Context<RedeemableUpdateConfig>,
        config: RedeemableConfig,
    ) -> Result<()> {
        instructions::redeemable_update_config::handler(ctx, config)
    }

    pub fn redeemable_redeem(
        ctx: Context<RedeemableRedeem>,
        encryption_public_key: Vec<u8>,
        address: Vec<u8>,
        iv: Vec<u8>,
    ) -> Result<()> {
        instructions::redeemable_redeem::handler(ctx, encryption_public_key, address, iv)
    }

    pub fn redeemable_shipping_update(
        ctx: Context<RedeemableShippingUpdate>,
        shipper: Vec<u8>,
        tracking_number: Vec<u8>,
    ) -> Result<()> {
        instructions::redeemable_shipping_update::handler(ctx, shipper, tracking_number)
    }

    pub fn exchange_init(
        ctx: Context<ExchangeInitialize>,
        config: ExchangeConfig,
        bump: u8,
    ) -> Result<()> {
        instructions::exchange_init::handler(ctx, config, bump)
    }

    pub fn exchange_cancel(
        ctx: Context<ExchangeCancel>,
        amount: u64,
    ) -> Result<()> {
        instructions::exchange_cancel::handler(ctx, amount)
    }

    pub fn exchange_cancel_sol(
        ctx: Context<ExchangeCancelSol>,
        amount: u64,
    ) -> Result<()> {
        instructions::exchange_cancel_sol::handler(ctx, amount)
    }

    pub fn exchange_accept(
        ctx: Context<ExchangeAccept>,
        params: ExchangeAcceptParams,
    ) -> Result<()> {
        instructions::exchange_accept::handler(ctx, params)
    }

    pub fn vault_init(
        ctx: Context<VaultInitialize>,
        bumps: VaultBumps,
    ) -> Result<()> {
        instructions::vault_init::handler(ctx, bumps)
    }

    pub fn vault_withdraw(
        ctx: Context<VaultWithdraw>,
        amount: u64,
    ) -> Result<()> {
        instructions::vault_withdraw::handler(ctx, amount)
    }

    pub fn hub_init(
        ctx: Context<HubInit>,
        params: HubInitParams,
    ) -> Result<()> {
        instructions::hub_init::handler(ctx, params)
    }

    pub fn hub_add_collaborator(
        ctx: Context<HubAddCollaborator>,
        can_add_content: bool,
        can_add_collaborator: bool,
        allowance: i8,
        hub_handle: String
    ) -> Result<()> {
        instructions::hub_add_collaborator::handler(ctx, can_add_content, can_add_collaborator, allowance, hub_handle)
    }

    pub fn hub_update_collaborator_permissions(
        ctx: Context<HubUpdateCollaboratorPermissions>,
        can_add_content: bool,
        can_add_collaborator: bool,
        allowance: i8,
        hub_handle: String
    ) -> Result<()> {
        instructions::hub_update_collaborator_permissions::handler(ctx, can_add_content, can_add_collaborator, allowance, hub_handle)
    }

    pub fn hub_add_release(
        ctx: Context<HubAddRelease>,
        hub_handle: String
    ) -> Result<()> {
        instructions::hub_add_release::handler(ctx, hub_handle)
    }

    pub fn hub_remove_collaborator(
        ctx: Context<HubRemoveCollaborator>,
        hub_handle: String
    ) -> Result<()> {
        instructions::hub_remove_collaborator::handler(ctx, hub_handle)
    }

    pub fn hub_content_toggle_visibility(
        ctx: Context<HubContentToggleVisibility>,
        hub_handle: String
    ) -> Result<()> {
        instructions::hub_content_toggle_visibility::handler(ctx, hub_handle)
    }

    pub fn hub_update_config(
        ctx: Context<HubUpdateConfig>,
        uri: String,
        hub_handle: String,
        publish_fee: u64,
        referral_fee: u64,    
    ) -> Result<()> {
        instructions::hub_update_config::handler(ctx, uri, hub_handle, publish_fee, referral_fee)
    }

    pub fn hub_withdraw(
        ctx: Context<HubWithdraw>,
        amount: u64,
        hub_handle: String
    ) -> Result<()> {
        instructions::hub_withdraw::handler(ctx, amount, hub_handle)
    }

    pub fn post_init_via_hub(
        ctx: Context<PostInitViaHub>,
        hub_handle: String,
        slug: String,
        uri: String,
    ) -> Result<()> {
        instructions::post_init_via_hub::handler(ctx, hub_handle, slug, uri)
    }

    pub fn post_init_via_hub_with_reference_release(
        ctx: Context<PostInitViaHubWithReferenceRelease>,
        hub_handle: String,
        slug: String,
        uri: String,
    ) -> Result<()> {
        instructions::post_init_via_hub_with_reference_release::handler(ctx, hub_handle, slug, uri)
    }

    pub fn post_update_via_hub_post(
        ctx: Context<PostUpdateViaHubPost>,
        hub_handle: String,
        slug: String,
        uri: String,
    ) -> Result<()> {
        instructions::post_update_via_hub_post::handler(ctx, hub_handle, slug, uri)
    }

    pub fn subscription_subscribe_account(
        ctx: Context<SubscriptionSubscribeAccount>
    ) -> Result <()> {
        instructions::subscription_subscribe_account::handler(ctx)
    }

    pub fn subscription_subscribe_hub(
        ctx: Context<SubscriptionSubscribeHub>,
        hub_handle: String,
    ) -> Result <()> {
        instructions::subscription_subscribe_hub::handler(ctx, hub_handle)

    }

    pub fn subscription_unsubscribe(
        ctx: Context<SubscriptionUnsubscribe>
    ) -> Result <()> {
        instructions::subscription_unsubscribe::handler(ctx)
    }
}
