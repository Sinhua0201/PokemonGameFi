/// Unit tests for Marketplace contract
#[test_only]
module pokemon_nft::marketplace_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_utils;
    use pokemon_nft::marketplace::{Self, Marketplace, MarketplaceAdminCap};
    use pokemon_nft::pokemon::{Self, Pokemon};
    use pokemon_nft::egg::{Self, Egg};
    use std::vector;

    // Test addresses
    const ADMIN: address = @0xAD;
    const SELLER: address = @0xA;
    const BUYER: address = @0xB;

    // Helper function to create a test clock
    fun create_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(ts::ctx(scenario))
    }

    // Helper to create test coins
    fun create_coin(amount: u64, scenario: &mut Scenario): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ts::ctx(scenario))
    }

    #[test]
    fun test_marketplace_initialization() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize marketplace
        {
            marketplace::init_for_testing(ts::ctx(&mut scenario));
        };

        // Verify marketplace was created
        ts::next_tx(&mut scenario, ADMIN);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            
            assert!(marketplace::get_fee_percentage(&marketplace) == 250, 0); // 2.5%
            assert!(marketplace::get_collected_fees(&marketplace) == 0, 1);

            ts::return_shared(marketplace);
        };

        // Verify admin cap was created
        {
            let admin_cap = ts::take_from_sender<MarketplaceAdminCap>(&scenario);
            ts::return_to_sender(&scenario, admin_cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_list_pokemon() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize marketplace
        marketplace::init_for_testing(ts::ctx(&mut scenario));
        
        let clock = create_clock(&mut scenario);

        // Create a Pokémon for seller
        ts::next_tx(&mut scenario, SELLER);
        {
            let types = vector::empty<vector<u8>>();
            vector::push_back(&mut types, b"fire");

            pokemon::mint_starter(
                4,
                b"Charmander",
                types,
                &clock,
                ts::ctx(&mut scenario)
            );
        };

        // List the Pokémon
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let pokemon = ts::take_from_sender<Pokemon>(&scenario);
            let nft_id = sui::object::id(&pokemon);

            marketplace::list_pokemon(
                &mut marketplace,
                pokemon,
                1000, // Price: 1000 SUI
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify listing exists
            assert!(marketplace::listing_exists(&marketplace, nft_id), 0);

            ts::return_shared(marketplace);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_list_egg() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize marketplace
        marketplace::init_for_testing(ts::ctx(&mut scenario));
        
        let clock = create_clock(&mut scenario);

        // Create an egg for seller
        ts::next_tx(&mut scenario, SELLER);
        {
            let genetics = vector::empty<u8>();
            egg::breed_pokemon(1, 4, genetics, &clock, ts::ctx(&mut scenario));
        };

        // List the egg
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let egg = ts::take_from_sender<Egg>(&scenario);
            let nft_id = sui::object::id(&egg);

            marketplace::list_egg(
                &mut marketplace,
                egg,
                500, // Price: 500 SUI
                &clock,
                ts::ctx(&mut scenario)
            );

            // Verify listing exists
            assert!(marketplace::listing_exists(&marketplace, nft_id), 0);

            ts::return_shared(marketplace);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::EInvalidPrice)]
    fun test_list_with_zero_price() {
        let mut scenario = ts::begin(ADMIN);
        
        marketplace::init_for_testing(ts::ctx(&mut scenario));
        let clock = create_clock(&mut scenario);

        // Create a Pokémon
        ts::next_tx(&mut scenario, SELLER);
        {
            let types = vector::empty<vector<u8>>();
            vector::push_back(&mut types, b"water");

            pokemon::mint_starter(7, b"Squirtle", types, &clock, ts::ctx(&mut scenario));
        };

        // Try to list with price 0 (should fail)
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let pokemon = ts::take_from_sender<Pokemon>(&scenario);

            marketplace::list_pokemon(
                &mut marketplace,
                pokemon,
                0, // Invalid price
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(marketplace);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_fee() {
        let mut scenario = ts::begin(ADMIN);
        
        marketplace::init_for_testing(ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<MarketplaceAdminCap>(&scenario);
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);

            // Update fee to 5%
            marketplace::update_fee(&admin_cap, &mut marketplace, 500);

            assert!(marketplace::get_fee_percentage(&marketplace) == 500, 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(marketplace);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_fee_calculation() {
        // Test that 2.5% fee is calculated correctly
        let price = 1000u64;
        let fee_percentage = 250u64; // 2.5%
        let fee = (price * fee_percentage) / 10000;
        let seller_amount = price - fee;

        assert!(fee == 25, 0); // 2.5% of 1000 = 25
        assert!(seller_amount == 975, 1);
    }

    #[test]
    fun test_multiple_listings() {
        let mut scenario = ts::begin(ADMIN);
        
        marketplace::init_for_testing(ts::ctx(&mut scenario));
        let clock = create_clock(&mut scenario);

        // Create and list multiple Pokémon
        let i = 0;
        while (i < 3) {
            ts::next_tx(&mut scenario, SELLER);
            {
                let types = vector::empty<vector<u8>>();
                vector::push_back(&mut types, b"normal");

                pokemon::mint_starter(
                    1,
                    b"Pokemon",
                    types,
                    &clock,
                    ts::ctx(&mut scenario)
                );
            };

            ts::next_tx(&mut scenario, SELLER);
            {
                let mut marketplace = ts::take_shared<Marketplace>(&scenario);
                let pokemon = ts::take_from_sender<Pokemon>(&scenario);

                marketplace::list_pokemon(
                    &mut marketplace,
                    pokemon,
                    1000 + (i * 100),
                    &clock,
                    ts::ctx(&mut scenario)
                );

                ts::return_shared(marketplace);
            };

            i = i + 1;
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
