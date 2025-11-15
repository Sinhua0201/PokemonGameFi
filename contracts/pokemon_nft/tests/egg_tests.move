/// Unit tests for Egg NFT contract
#[test_only]
module pokemon_nft::egg_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use pokemon_nft::egg::{Self, Egg};
    use std::vector;

    // Test addresses
    const PLAYER1: address = @0xA;

    // Helper function to create a test clock
    fun create_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(ts::ctx(scenario))
    }

    #[test]
    fun test_breed_pokemon() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Breed two Pokémon (Bulbasaur + Charmander)
        let genetics = vector::empty<u8>();
        vector::push_back(&mut genetics, 1); // Some genetic data

        egg::breed_pokemon(
            1,  // Bulbasaur
            4,  // Charmander
            genetics,
            &clock,
            ts::ctx(&mut scenario)
        );

        // Verify egg was created
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let egg = ts::take_from_sender<Egg>(&scenario);
            
            let (parent1, parent2) = egg::get_parent_species(&egg);
            assert!(parent1 == 1, 0);
            assert!(parent2 == 4, 1);
            
            let (current_steps, required_steps) = egg::get_incubation_progress(&egg);
            assert!(current_steps == 0, 2);
            assert!(required_steps == 1000, 3);
            assert!(!egg::is_ready_to_hatch(&egg), 4);
            assert!(egg::get_owner(&egg) == PLAYER1, 5);

            ts::return_to_sender(&scenario, egg);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_increment_incubation() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Create an egg
        let genetics = vector::empty<u8>();
        egg::breed_pokemon(7, 25, genetics, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut egg = ts::take_from_sender<Egg>(&scenario);
            
            // Add 100 steps
            egg::increment_incubation(&mut egg, 100);
            
            let (current_steps, _) = egg::get_incubation_progress(&egg);
            assert!(current_steps == 100, 0);
            assert!(!egg::is_ready_to_hatch(&egg), 1);

            ts::return_to_sender(&scenario, egg);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_add_battle_steps() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Create an egg
        let genetics = vector::empty<u8>();
        egg::breed_pokemon(1, 1, genetics, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut egg = ts::take_from_sender<Egg>(&scenario);
            
            // Simulate winning 5 battles (10 steps each)
            egg::add_battle_steps(&mut egg);
            egg::add_battle_steps(&mut egg);
            egg::add_battle_steps(&mut egg);
            egg::add_battle_steps(&mut egg);
            egg::add_battle_steps(&mut egg);
            
            let (current_steps, _) = egg::get_incubation_progress(&egg);
            assert!(current_steps == 50, 0); // 5 battles * 10 steps

            ts::return_to_sender(&scenario, egg);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_incubation_cap() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Create an egg
        let genetics = vector::empty<u8>();
        egg::breed_pokemon(4, 7, genetics, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut egg = ts::take_from_sender<Egg>(&scenario);
            
            // Add more than required steps
            egg::increment_incubation(&mut egg, 1500);
            
            let (current_steps, required_steps) = egg::get_incubation_progress(&egg);
            assert!(current_steps == required_steps, 0); // Should cap at 1000
            assert!(egg::is_ready_to_hatch(&egg), 1);

            ts::return_to_sender(&scenario, egg);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_hatch_egg() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Create an egg
        let genetics = vector::empty<u8>();
        egg::breed_pokemon(1, 4, genetics, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut egg = ts::take_from_sender<Egg>(&scenario);
            
            // Complete incubation
            egg::increment_incubation(&mut egg, 1000);
            assert!(egg::is_ready_to_hatch(&egg), 0);

            // Hatch the egg
            let types = vector::empty<vector<u8>>();
            vector::push_back(&mut types, b"grass");
            
            egg::hatch_egg(
                egg,
                1,  // Offspring is Bulbasaur
                b"Baby",
                types,
                &clock,
                ts::ctx(&mut scenario)
            );
        };

        // Verify Pokémon was created
        ts::next_tx(&mut scenario, PLAYER1);
        {
            use pokemon_nft::pokemon::{Self, Pokemon};
            let pokemon = ts::take_from_sender<Pokemon>(&scenario);
            
            assert!(pokemon::get_species_id(&pokemon) == 1, 0);
            assert!(pokemon::get_level(&pokemon) == 1, 1);

            ts::return_to_sender(&scenario, pokemon);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = egg::ENotEnoughSteps)]
    fun test_hatch_egg_not_ready() {
        let mut scenario = ts::begin(PLAYER1);
        
        let clock = create_clock(&mut scenario);

        // Create an egg
        let genetics = vector::empty<u8>();
        egg::breed_pokemon(1, 4, genetics, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, PLAYER1);
        {
            let egg = ts::take_from_sender<Egg>(&scenario);
            
            // Try to hatch without completing incubation (should fail)
            let types = vector::empty<vector<u8>>();
            vector::push_back(&mut types, b"grass");
            
            egg::hatch_egg(
                egg,
                1,
                b"Baby",
                types,
                &clock,
                ts::ctx(&mut scenario)
            );
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
