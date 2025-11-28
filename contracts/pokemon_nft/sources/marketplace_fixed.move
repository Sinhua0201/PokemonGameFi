/// OneChain Compatible Marketplace - Uses native gas coin for payments
/// Simplified version without custom token requirements
module pokemon_nft::marketplace {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::table::{Self, Table};
    use sui::dynamic_object_field as dof;
    use pokemon_nft::pokemon::Pokemon;
    use pokemon_nft::egg::Egg;

    // ============================================
    // Data Structures
    // ============================================

    /// Marketplace shared object
    public struct Marketplace has key {
        id: UID,
        listings: Table<ID, ListingInfo>,
        fee_percentage: u64,
    }

    /// Listing information
    public struct ListingInfo has store, drop {
        nft_type: u8,
        seller: address,
        price: u64,
    }

    /// Wrapper for escrowed Pokemon
    public struct PokemonListing has key, store {
        id: UID,
        pokemon: Pokemon,
    }

    /// Wrapper for escrowed Egg
    public struct EggListing has key, store {
        id: UID,
        egg: Egg,
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

    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            fee_percentage: DEFAULT_FEE_PERCENTAGE,
        };
        transfer::share_object(marketplace);
    }

    // ============================================
    // Core Functions - Listing
    // ============================================

    /// List a Pokémon NFT for sale
    public entry fun list_pokemon(
        marketplace: &mut Marketplace,
        pokemon: Pokemon,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EInvalidPrice);

        let nft_id = object::id(&pokemon);
        let seller = tx_context::sender(ctx);

        let listing_info = ListingInfo {
            nft_type: NFT_TYPE_POKEMON,
            seller,
            price,
        };

        table::add(&mut marketplace.listings, nft_id, listing_info);

        let wrapped = PokemonListing {
            id: object::new(ctx),
            pokemon,
        };
        dof::add(&mut marketplace.id, nft_id, wrapped);
    }

    /// List an Egg NFT for sale
    public entry fun list_egg(
        marketplace: &mut Marketplace,
        egg: Egg,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EInvalidPrice);

        let nft_id = object::id(&egg);
        let seller = tx_context::sender(ctx);

        let listing_info = ListingInfo {
            nft_type: NFT_TYPE_EGG,
            seller,
            price,
        };

        table::add(&mut marketplace.listings, nft_id, listing_info);

        let wrapped = EggListing {
            id: object::new(ctx),
            egg,
        };
        dof::add(&mut marketplace.id, nft_id, wrapped);
    }

    // ============================================
    // Core Functions - Purchasing
    // ============================================

    /// Purchase a listed Pokémon NFT with any coin type
    public entry fun buy_pokemon<T>(
        marketplace: &mut Marketplace,
        nft_id: ID,
        mut payment: Coin<T>,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing_info = table::remove(&mut marketplace.listings, nft_id);
        
        let payment_value = coin::value(&payment);
        assert!(payment_value >= listing_info.price, EInsufficientPayment);

        // Calculate fees
        let fee_amount = (listing_info.price * marketplace.fee_percentage) / 10000;
        let seller_amount = listing_info.price - fee_amount;

        // Split and transfer payments
        let fee_coin = coin::split(&mut payment, fee_amount, ctx);
        let seller_coin = coin::split(&mut payment, seller_amount, ctx);

        transfer::public_transfer(fee_coin, @pokemon_nft);
        transfer::public_transfer(seller_coin, listing_info.seller);

        // Return excess
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        // Transfer NFT
        let PokemonListing { id, pokemon } = dof::remove(&mut marketplace.id, nft_id);
        object::delete(id);
        transfer::public_transfer(pokemon, tx_context::sender(ctx));
    }

    /// Purchase a listed Egg NFT with any coin type
    public entry fun buy_egg<T>(
        marketplace: &mut Marketplace,
        nft_id: ID,
        mut payment: Coin<T>,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing_info = table::remove(&mut marketplace.listings, nft_id);
        
        let payment_value = coin::value(&payment);
        assert!(payment_value >= listing_info.price, EInsufficientPayment);

        // Calculate fees
        let fee_amount = (listing_info.price * marketplace.fee_percentage) / 10000;
        let seller_amount = listing_info.price - fee_amount;

        // Split and transfer payments
        let fee_coin = coin::split(&mut payment, fee_amount, ctx);
        let seller_coin = coin::split(&mut payment, seller_amount, ctx);

        transfer::public_transfer(fee_coin, @pokemon_nft);
        transfer::public_transfer(seller_coin, listing_info.seller);

        // Return excess
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        // Transfer NFT
        let EggListing { id, egg } = dof::remove(&mut marketplace.id, nft_id);
        object::delete(id);
        transfer::public_transfer(egg, tx_context::sender(ctx));
    }

    // ============================================
    // Core Functions - Cancel Listing
    // ============================================

    /// Cancel a Pokemon listing
    public entry fun cancel_listing_pokemon(
        marketplace: &mut Marketplace,
        nft_id: ID,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing_info = table::remove(&mut marketplace.listings, nft_id);
        assert!(tx_context::sender(ctx) == listing_info.seller, ENotSeller);

        let PokemonListing { id, pokemon } = dof::remove(&mut marketplace.id, nft_id);
        object::delete(id);
        transfer::public_transfer(pokemon, listing_info.seller);
    }

    /// Cancel an Egg listing
    public entry fun cancel_listing_egg(
        marketplace: &mut Marketplace,
        nft_id: ID,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&marketplace.listings, nft_id), EListingNotFound);
        let listing_info = table::remove(&mut marketplace.listings, nft_id);
        assert!(tx_context::sender(ctx) == listing_info.seller, ENotSeller);

        let EggListing { id, egg } = dof::remove(&mut marketplace.id, nft_id);
        object::delete(id);
        transfer::public_transfer(egg, listing_info.seller);
    }
}
