use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, SetAuthority};

use crate::errors::*;

#[account(zero_copy)]
#[derive(Default)]
pub struct Release {
    pub payer: Pubkey,
    pub authority: Pubkey,
    pub authority_token_account: Pubkey,
    pub release_signer: Pubkey,
    pub release_mint: Pubkey,
    pub release_datetime: i64,
    pub royalty_token_account: Pubkey,
    pub payment_mint: Pubkey,
    pub total_supply: u64,
    pub remaining_supply: u64,
    pub price: u64,
    pub resale_percentage: u64,
    pub total_collected: u64,
    pub sale_counter: u64,
    pub exchange_sale_counter: u64,
    pub sale_total: u64,
    pub exchange_sale_total: u64,
    pub bumps: ReleaseBumps,
    pub head: u64,
    pub tail: u64,
    pub royalty_recipients: [RoyaltyRecipient; 10],
}

impl Release {
    pub fn release_revenue_share_transfer_handler<'info> (
        release_loader: &AccountLoader<'info, Release>,
        release_signer: AccountInfo<'info>,
        royalty_token_account: AccountInfo<'info>,
        authority: Pubkey,
        new_royalty_recipient: Pubkey,
        new_royalty_recipient_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        transfer_share: u64,
        is_init: bool,
    ) -> ProgramResult {

        let mut release;
        if is_init {
            release = release_loader.load_init()?;
        } else {
            release = release_loader.load_mut()?;
        }

        let seeds = &[
            release_loader.to_account_info().key.as_ref(),
            &[release.bumps.signer],
        ];
        let signer = &[&seeds[..]];

        let mut royalty_recipient = match release.find_royalty_recipient(authority) {
            Some(royalty_recipient) => royalty_recipient,
            None => return Err(ErrorCode::InvalidRoyaltyRecipientAuthority.into())
        };

        // Add New Royalty Recipient
        if transfer_share > royalty_recipient.percent_share {
            return Err(ErrorCode::RoyaltyTransferTooLarge.into())
        };

        // Take share from current user
        royalty_recipient.percent_share -= transfer_share;
        let existing_royalty_recipient = release.find_royalty_recipient(new_royalty_recipient);
        // If new_royalty_recipient doesn't already have a share, add them as a new recipient
        if existing_royalty_recipient.is_none() {
            release.append_royalty_recipient({
                RoyaltyRecipient {
                    recipient_authority: new_royalty_recipient,
                    recipient_token_account: new_royalty_recipient_token_account.key(),
                    percent_share: transfer_share,
                    owed: 0 as u64,
                    collected: 0 as u64,
                }
            })?;
        } else {
            // new_royalty_recipient already has a share of the release, so collect royalties and append share
            let existing_royalty_recipient_unwrapped = existing_royalty_recipient.unwrap();
            if existing_royalty_recipient_unwrapped.owed > 0 {
                // Transfer Royalties from the existing royalty account to the existing user receiving more royalty share
                let cpi_accounts = Transfer {
                    from: royalty_token_account,
                    to: new_royalty_recipient_token_account,
                    authority: release_signer,
                };
                let cpi_program = token_program;
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, existing_royalty_recipient_unwrapped.owed as u64)?;
            }
            existing_royalty_recipient_unwrapped.percent_share += transfer_share;
        }

        // Make sure royalty shares of all recipients does not exceed 1000000
        if release.royalty_equals_1000000() {
            emit!(RoyaltyRecipientAdded {
                authority: new_royalty_recipient,
                public_key: release_loader.key(),
            });
            Ok(())
        } else {
            return Err(ErrorCode::RoyaltyExceeds100Percent.into())
        }
    }

    pub fn release_revenue_share_collect_handler<'info> (
        release_loader: &AccountLoader<'info, Release>,
        release_signer: AccountInfo<'info>,
        royalty_token_account: AccountInfo<'info>,
        authority: Pubkey,
        authority_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
    ) -> ProgramResult {
        let mut release = release_loader.load_mut()?;

        let seeds = &[
            release_loader.to_account_info().key.as_ref(),
            &[release.bumps.signer],
        ];
        let signer = &[&seeds[..]];

        let mut royalty_recipient = match release.find_royalty_recipient(authority) {
            Some(royalty_recipient) => royalty_recipient,
            None => return Err(ErrorCode::InvalidRoyaltyRecipientAuthority.into())
        };

        // Transfer Royalties from the royalty account to the user collecting
        let cpi_accounts = Transfer {
            from: royalty_token_account,
            to: authority_token_account,
            authority: release_signer,
        };
        let cpi_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, royalty_recipient.owed as u64)?;

        // Update Royalty Recipient's Counters
        royalty_recipient.collected += royalty_recipient.owed;
        royalty_recipient.owed = 0;

        Ok(())
    }

    pub fn release_init_handler<'info>(
        release_loader: &AccountLoader<'info, Release>,
        release_signer: AccountInfo<'info>,
        release_mint: AccountInfo<'info>,
        payment_mint: AccountInfo<'info>,
        payer: AccountInfo<'info>,
        authority: AccountInfo<'info>,
        authority_token_account: AccountInfo<'info>,
        royalty_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
    ) -> ProgramResult {
        // Hard code fee that publishers pay in their release to the NinaVault
        let vault_fee_percentage = 0;

        // Expand math to calculate vault fee avoiding floats
        let mut vault_fee = ((config.amount_total_supply * 1000000) * vault_fee_percentage) / 1000000;

        // Releases are not fractional and the fee rounds up all fractions to ensure at least 1 release is paid as fee
        if vault_fee % 1000000 > 0 {
            vault_fee += 1000000
        }

        // Unexpand math
        vault_fee = vault_fee / 1000000;
        
        if vault_fee != config.amount_to_vault_token_account {
            return Err(ErrorCode::InvalidVaultFee.into());
        }

        if config.amount_to_artist_token_account + 
           config.amount_to_vault_token_account > 
           config.amount_total_supply {
            return Err(ErrorCode::InvalidAmountMintToArtist.into())
        }

        let mut release = release_loader.load_init()?;
        release.authority = *authority.to_account_info().key;
        release.payer = *payer.to_account_info().key;
        release.release_signer = *release_signer.to_account_info().key;
        release.release_mint = *release_mint.to_account_info().key;
        release.authority_token_account = *authority_token_account.to_account_info().key;
        release.royalty_token_account = *royalty_token_account.to_account_info().key;
        release.payment_mint = *payment_mint.to_account_info().key;

        release.price = config.price;
        release.total_supply = config.amount_total_supply;
        release.remaining_supply = config.amount_total_supply - config.amount_to_artist_token_account - config.amount_to_vault_token_account;
        release.resale_percentage = config.resale_percentage;
        release.release_datetime = config.release_datetime as i64;

        release.total_collected = 0 as u64;
        release.sale_counter = 0 as u64;
        release.sale_total = 0 as u64;
        release.exchange_sale_counter = 0 as u64;
        release.exchange_sale_total = 0 as u64;
        release.bumps = bumps;

        release.append_royalty_recipient({
            RoyaltyRecipient {
                recipient_authority: *authority.to_account_info().key,
                recipient_token_account: *authority_token_account.to_account_info().key,
                percent_share: 1000000 as u64,
                owed: 0 as u64,
                collected: 0 as u64,
            }
        })?;

        //Transfer Mint Authority To release_signer PDA
        // Need to do this for Metaplex
        let cpi_accounts = SetAuthority {
            current_authority: payer.to_account_info(),
            account_or_mint: release_mint.to_account_info()
        };
        let cpi_program = token_program.to_account_info().clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::set_authority(cpi_ctx, AuthorityType::MintTokens.into(), Some(release.release_signer))?;
        
        emit!(ReleaseCreated {
            public_key: *release_loader.to_account_info().key,
            mint: *release_mint.to_account_info().key,
            authority: *authority.to_account_info().key,
            date: config.release_datetime,
        });

        Ok(())
    }

    pub fn update_royalty_recipients_owed(&mut self, amount: u64) {
        for royalty_recipient in self.royalty_recipients.iter_mut() {
            if royalty_recipient.percent_share > 0 {
                royalty_recipient.owed += (amount * royalty_recipient.percent_share) / 1000000;
            }
        }
    }

    pub fn find_royalty_recipient(&mut self, pubkey: Pubkey) -> Option<&mut RoyaltyRecipient> {
        for royalty_recipient in self.royalty_recipients.iter_mut() {
            if royalty_recipient.recipient_authority == pubkey {
                return Some(royalty_recipient);
            };
        }
        return None
    }

    pub fn royalty_equals_1000000(&mut self) -> bool {
        let mut royalty_counter = 0;
        for royalty_recipient in self.royalty_recipients.iter_mut() {
            royalty_counter += royalty_recipient.percent_share;
        }

        if royalty_counter == 1000000 {
            return true
        } else {
            return false
        };

    }

    pub fn append_royalty_recipient(
        &mut self,
        royalty_recipient: RoyaltyRecipient
    ) -> ProgramResult{
        self.royalty_recipients[Release::index_of(self.head)] = royalty_recipient;
        if Release::index_of(self.head + 1) == Release::index_of(self.tail) {
            self.tail += 1;
        }
        self.head += 1;

        // Don't allow more than 10 revenue shares
        if self.head <= 10 {
            Ok(())
        } else {
            return Err(ErrorCode::MaximumAmountOfRevenueShares.into())

        }
    }

    pub fn index_of(counter: u64) -> usize {
        std::convert::TryInto::try_into(counter % 10).unwrap()
    }

    pub fn is_exchange_valid(
        release: Release,
        initializer_sending_mint:Pubkey,
        initializer_expected_mint: Pubkey,
        is_selling: bool,
    ) -> ProgramResult {

        if is_selling && initializer_expected_mint != release.payment_mint {
            return Err(ErrorCode::WrongMintForExchange.into());
        }

        if !is_selling && initializer_sending_mint != release.payment_mint {
            return Err(ErrorCode::WrongMintForExchange.into());
        }

        Ok(())
    } 
}

#[zero_copy]
#[derive(Default)]
pub struct RoyaltyRecipient {
    pub recipient_authority: Pubkey,
    pub recipient_token_account: Pubkey,
    pub percent_share: u64,
    pub owed: u64,
    pub collected: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct ReleaseBumps {
    pub release: u8,
    pub signer: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct ReleaseConfig {
    pub amount_total_supply: u64,
    pub amount_to_artist_token_account: u64,
    pub amount_to_vault_token_account: u64,
    pub resale_percentage: u64,
    pub price: u64,
    pub release_datetime: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ReleaseMetadataData {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum AuthorityType {
    /// Authority to mint new tokens
    MintTokens,
    /// Authority to freeze any account associated with the Mint
    FreezeAccount,
    /// Owner of a given token account
    AccountOwner,
    /// Authority to close a token account
    CloseAccount,
}

impl From<AuthorityType> for spl_token::instruction::AuthorityType {
    fn from(authority_ty: AuthorityType) -> spl_token::instruction::AuthorityType {
        match authority_ty {
            AuthorityType::MintTokens => spl_token::instruction::AuthorityType::MintTokens,
            AuthorityType::FreezeAccount => spl_token::instruction::AuthorityType::FreezeAccount,
            AuthorityType::AccountOwner => spl_token::instruction::AuthorityType::AccountOwner,
            AuthorityType::CloseAccount => spl_token::instruction::AuthorityType::CloseAccount,
        }
    }
}

#[event]
pub struct ReleaseCreated {
    pub authority: Pubkey,
    pub date: i64,
    pub mint: Pubkey,
    #[index]
    pub public_key: Pubkey,
}

#[event]
pub struct RoyaltyRecipientAdded {
    pub authority: Pubkey,
    pub public_key: Pubkey,
}

#[event]
pub struct ReleaseSold {
    pub public_key: Pubkey,
    #[index]
    pub date: i64,
}

#[event]
pub struct ReleaseMetadataUpdated {
    pub public_key: Pubkey,
    pub metadata_public_key: Pubkey,
    pub uri: String,
}


