/// Unit tests for Pokémon NFT contract
#[test_only]
module pokemon_nft::pokemon_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use pokemon_nft::pokemon::{Self, Pokemon};
    use std::string;
    use std::vector;

    // Test addresses
    const PLAYER1: address = @0xA;
    const PLAYER2: address = @0xB;

    // Helper function to create a test clock
    fun create_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(ts::ctx(scenario))
    }

    #[test]
    fun test_mint_starter_bulbasaur() {
        let mut scenario = ts::begin(PLAYER1);
        
        // Create clock
        let clock = create_clock(&mut scenario);

        // Mint Bulbasaur (species_id = 1)
        let types = vector::empty<vector<u8>>();
        vector::push_back(&mut types, b"grass");
        vector::push_back(&mut types, b"poison");

        pokemon::mint_starter(
            1,
            b"Bulby",
            types,
            &clock,
            ts::ctx(&mut scenario)
        );

        // Verify NFT was created and transferred
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let pokemon = ts::take_from_sender<Pokemon>(&scenario);
            
            // Verify attributes
            assert!(pokemon::get_species_id(&pokemon) == 1, 0);
            assert!(pokemon::get_name(&pokemon) == string::utf8(b"Bulby"), 1);
            assert!(pokemon::get_level(&pokemon) == 1, 2);
            assert!(pokemon::get_experience(&pokemon) == 0, 3);
            assert!(pokemon::get_hp(&pokemon) == 45, 4);
            assert!(pokemon::get_attack(&pokemon) == 49, 5);
            assert!(pokemon::get_defense(&pokemon) == 49, 6);
            assert!(pokemon::get_speed(&pokemon) == 45, 7);
            assert!(pokemon::get_owner(&pokemon) == PLAYER1, 8);

            ts::return_to_sender(&scenario, pokemon);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_mint_starter_charmander() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Mint Charmander (species_id = 4)
        let types = vector::empty<vector<u8>>();
        vector::push_back(&mut types, b"fire");

        pokemon::mint_starter(
            4,
            b"Charmy",
            types,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let pokemon = ts::take_from_sender<Pokemon>(&scenario);
            
            assert!(pokemon::get_species_id(&pokemon) == 4, 0);
            assert!(pokemon::get_hp(&pokemon) == 39, 1);
            assert!(pokemon::get_attack(&pokemon) == 52, 2);
            assert!(pokemon::get_speed(&pokemon) == 65, 3);

            ts::return_to_sender(&scenario, pokemon);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_mint_captured_pokemon() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Mint a level 10 Pikachu
        let types = vector::empty<vector<u8>>();
        vector::push_back(&mut types, b"electric");

        pokemon::mint_captured(
            25,
            b"Pikachu",
            10,
            types,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let pokemon = ts::take_from_sender<Pokemon>(&scenario);
            
            assert!(pokemon::get_species_id(&pokemon) == 25, 0);
            assert!(pokemon::get_level(&pokemon) == 10, 1);
            assert!(pokemon::get_experience(&pokemon) == 1000, 2); // 10^3
            
            // Stats should be scaled by level
            // Base: hp=35, attack=55, defense=40, speed=90
            // Level 10: base + (base * 9 / 10)
            assert!(pokemon::get_hp(&pokemon) == 35 + (35 * 9 / 10), 3);
            assert!(pokemon::get_attack(&pokemon) == 55 + (55 * 9 / 10), 4);

            ts::return_to_sender(&scenario, pokemon);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_stats() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Mint a starter
        let types = vector::empty<vector<u8>>();
        vector::push_back(&mut types, b"water");

        pokemon::mint_starter(
            7,
            b"Squirtle",
            types,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut pokemon = ts::take_from_sender<Pokemon>(&scenario);
            
            // Level up to level 5
            pokemon::update_stats(
                &mut pokemon,
                125,  // 5^3 = 125 XP
                5,    // New level
                50,   // New HP
                55,   // New attack
                70,   // New defense
                50    // New speed
            );

            // Verify updates
            assert!(pokemon::get_level(&pokemon) == 5, 0);
            assert!(pokemon::get_experience(&pokemon) == 125, 1);
            assert!(pokemon::get_hp(&pokemon) == 50, 2);
            assert!(pokemon::get_attack(&pokemon) == 55, 3);

            ts::return_to_sender(&scenario, pokemon);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_multiple_starters() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Test all 9 starter options
        let starter_ids = vector[1u64, 4, 7, 25, 133, 152, 155, 158, 175];
        let i = 0;
        
        while (i < vector::length(&starter_ids)) {
            let species_id = *vector::borrow(&starter_ids, i);
            
            let types = vector::empty<vector<u8>>();
            vector::push_back(&mut types, b"normal");

            pokemon::mint_starter(
                species_id,
                b"Test",
                types,
                &clock,
                ts::ctx(&mut scenario)
            );

            i = i + 1;
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
