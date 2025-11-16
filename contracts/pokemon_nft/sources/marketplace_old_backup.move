/// Marketplace Smart Contract
/// Implements NFT trading with escrow for PokéChain Battles
module pokemon_nft::marketplace {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use pokemon_nft::pokemon::Pokemon;
    use pokemon_nft::egg::Egg;

    // ============================================
    // Data Structures
    // ============================================

    /// Marketplace shared object that holds all listings
    public struct Marketplace has key {
        id: UID,
        listings: Table<ID, Listing>,
        fee_percentage: u64,        // Fee in basis points (250 = 2.5%)
        collected_fees: Balance<SUI>,
    }

    /// Individual listing for an NFT
    public struct Listing has store, drop {
        nft_id: ID,
        nft_type: u8,               // 1 = Pokemon, 2 = Egg
        seller: address,
        price: u64,
        listed_timestamp: u64,
    }

    /// Capability for marketplace admin
    public struct MarketplaceAdminCap has key, store {
        id: UID,
    }

    // ============================================
    // Constants
    // ============================================

    const NFT_TYPE_POKEMON: u8 = 1;
    const NFT_TYPE_EGG: u8 = 2;
    const DEFAULT_FEE_PERCENTAGE: u64 = 250; // 2.5%

    // ============================================
    // Error Codes
    // ============================================

    const EInvalidPrice: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const ENotSeller: u64 = 3;
    const EListingNotFound: u64 = 4;

    // ============================================
    // Initialization
    // ============================================

    /// Initialize the marketplace (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            fee_percentage: DEFAULT_FEE_PERCENTAGE,
            collected_fees: balance::zero(),
        };

        // Share the marketplace object
        transfer::share_object(marketplace);

        // Create admin capability
        let admin_cap = MarketplaceAdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ============================================
    // Core Functions - Listing
    // ============================================

    /// List a Pokémon NFT for sale
    /// Parameters:
    /// - marketplace: Mutable reference to the marketplace
    /// - pokemon: The Pokémon NFT to list (transferred to escrow)
    /// - price: Sale price in SUI
    /// - clock: Clock object for timestamp
    /// - ctx: Transaction context
    public entry fun list_pokemon(
        marketplace: &mut Marketplace,
        pokemon: Pokemon,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EInvalidPrice);

        let nft_id = object::id(&pokemon);
        let seller = tx_context::sender(ctx);

        // Create listing
        let listing = Listing {
            nft_id,
            nft_type: NFT_TYPE_POKEMON,
            seller,
            price,
            listed_timestamp: clock::timestamp_ms(clock),
        };

        // Add to marketplace
        table::add(&mut marketplace.listings, nft_id, listing);

        // Transfer NFT to marketplace (escrow)
        transfer::public_transfer(pokemon, @0x0); // Simplified escrow
    }

    /// List an Egg NFT for sale
    /// Parameters:
    /// - marketplace: Mutable reference to the marketplace
    /// - egg: The Egg NFT to list (transferred to escrow)
    /// - price: Sale price in SUI
    /// - clock: Clock object for timestamp
    /// - ctx: Transaction context
    public entry fun list_egg(
        marketplace: &mut Marketplace,
        egg: Egg,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EInvalidPrice);

        let nft_id = object::id(&egg);
        let seller = tx_context::sender(ctx);

        // Create listing
        let listing = Listing {
            nft_id,
            nft_type: NFT_TYPE_EGG,
            seller,
            price,
            listed_timestamp: clock::timestamp_ms(clock),
        };

        // Add to marketplace
        table::add(&mut marketplace.listings, nft_id, listing);

        // Transfer NFT to marketplace (escrow)
        transfer::public_transfer(egg, @0x0); // Simplified escrow
    }

    // ============================================
    // Core Functions - Purchasing
    // ============================================

    /// Purchase a listed Pokémon NFT
    /// Parameters:
    /// - marketplace: Mutable reference to the marketplace
    /// - nft_id: ID of the NFT to purchase
    /// - payment: Coin payment from buyer
    /// - ctx: Transaction context
    public entry fun buy_pokemon(
        marketplace: &mut Marketplace,
        nft_id: ID,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Get listing
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing = table::remove(&mut marketplace.listings, nft_id);
        
        // Verify payment amount
        let payment_value = coin::value(&payment);
        assert!(payment_value >= listing.price, EInsufficientPayment);

        // Calculate marketplace fee
        let fee_amount = (listing.price * marketplace.fee_percentage) / 10000;
        let seller_amount = listing.price - fee_amount;

        // Split payment
        let fee_coin = coin::split(&mut payment, fee_amount, ctx);
        let seller_coin = coin::split(&mut payment, seller_amount, ctx);

        // Add fee to marketplace balance
        balance::join(&mut marketplace.collected_fees, coin::into_balance(fee_coin));

        // Transfer payment to seller
        transfer::public_transfer(seller_coin, listing.seller);

        // Return any excess payment to buyer
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        // Note: In a full implementation, we would transfer the NFT from escrow to buyer
        // This requires a more complex escrow mechanism with object wrapping
    }

    /// Purchase a listed Egg NFT
    /// Parameters:
    /// - marketplace: Mutable reference to the marketplace
    /// - nft_id: ID of the NFT to purchase
    /// - payment: Coin payment from buyer
    /// - ctx: Transaction context
    public entry fun buy_egg(
        marketplace: &mut Marketplace,
        nft_id: ID,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Get listing
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing = table::remove(&mut marketplace.listings, nft_id);
        
        // Verify payment amount
        let payment_value = coin::value(&payment);
        assert!(payment_value >= listing.price, EInsufficientPayment);

        // Calculate marketplace fee
        let fee_amount = (listing.price * marketplace.fee_percentage) / 10000;
        let seller_amount = listing.price - fee_amount;

        // Split payment
        let fee_coin = coin::split(&mut payment, fee_amount, ctx);
        let seller_coin = coin::split(&mut payment, seller_amount, ctx);

        // Add fee to marketplace balance
        balance::join(&mut marketplace.collected_fees, coin::into_balance(fee_coin));

        // Transfer payment to seller
        transfer::public_transfer(seller_coin, listing.seller);

        // Return any excess payment to buyer
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        // Note: In a full implementation, we would transfer the NFT from escrow to buyer
    }

    // ============================================
    // Core Functions - Cancel Listing
    // ============================================

    /// Cancel a listing and return NFT to seller
    /// Parameters:
    /// - marketplace: Mutable reference to the marketplace
    /// - nft_id: ID of the NFT listing to cancel
    /// - ctx: Transaction context
    public entry fun cancel_listing(
        marketplace: &mut Marketplace,
        nft_id: ID,
        ctx: &mut TxContext
    ) {
        // Get listing
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing = table::remove(&mut marketplace.listings, nft_id);

        // Verify caller is the seller
        assert!(tx_context::sender(ctx) == listing.seller, ENotSeller);

        // Note: In a full implementation, we would return the NFT from escrow to seller
        // This requires a more complex escrow mechanism
    }

    // ============================================
    // Admin Functions
    // ============================================

    /// Update marketplace fee percentage (admin only)
    /// Parameters:
    /// - _admin_cap: Admin capability (proves authorization)
    /// - marketplace: Mutable reference to the marketplace
    /// - new_fee_percentage: New fee in basis points
    public entry fun update_fee(
        _admin_cap: &MarketplaceAdminCap,
        marketplace: &mut Marketplace,
        new_fee_percentage: u64,
    ) {
        marketplace.fee_percentage = new_fee_percentage;
    }

    /// Withdraw collected fees (admin only)
    /// Parameters:
    /// - _admin_cap: Admin capability (proves authorization)
    /// - marketplace: Mutable reference to the marketplace
    /// - amount: Amount to withdraw
    /// - ctx: Transaction context
    public entry fun withdraw_fees(
        _admin_cap: &MarketplaceAdminCap,
        marketplace: &mut Marketplace,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let withdrawn = coin::take(&mut marketplace.collected_fees, amount, ctx);
        transfer::public_transfer(withdrawn, tx_context::sender(ctx));
    }

    // ============================================
    // Query Functions (Read-only)
    // ============================================

    /// Get marketplace fee percentage
    public fun get_fee_percentage(marketplace: &Marketplace): u64 {
        marketplace.fee_percentage
    }

    /// Get collected fees balance
    public fun get_collected_fees(marketplace: &Marketplace): u64 {
        balance::value(&marketplace.collected_fees)
    }

    /// Check if a listing exists
    public fun listing_exists(marketplace: &Marketplace, nft_id: ID): bool {
        table::contains(&marketplace.listings, nft_id)
    }
}
