/// Egg NFT Smart Contract
/// Implements breeding and incubation system for PokéChain Battles
module pokemon_nft::egg {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;
    use pokemon_nft::pokemon::{Self, Pokemon};

    // ============================================
    // Data Structures
    // ============================================

    /// Egg NFT structure for breeding system
    public struct Egg has key, store {
        id: UID,                        // Unique NFT ID
        parent1_species: u64,           // First parent's species ID
        parent2_species: u64,           // Second parent's species ID
        incubation_steps: u64,          // Current incubation progress
        required_steps: u64,            // Steps needed to hatch (always 1000)
        genetics: vector<u8>,           // Hidden genetics data (determines offspring)
        owner: address,                 // Current owner address
        created_timestamp: u64,         // When the egg was created
    }

    // ============================================
    // Constants
    // ============================================

    const REQUIRED_INCUBATION_STEPS: u64 = 10; // Need 10 battles to hatch
    const STEPS_PER_BATTLE_WIN: u64 = 1; // +1 step per battle win

    // ============================================
    // Error Codes
    // ============================================

    const EIncompatibleParents: u64 = 1;
    const ENotEnoughSteps: u64 = 2;
    const EMaxIncubationReached: u64 = 3;

    // ============================================
    // Core Functions - Breeding
    // ============================================

    /// Breed two Pokémon to create an Egg NFT
    /// Parameters:
    /// - parent1_species: First parent's species ID
    /// - parent2_species: Second parent's species ID
    /// - genetics_data: Hidden genetics (determines offspring traits)
    /// - clock: Clock object for timestamp
    /// - ctx: Transaction context
    public entry fun breed_pokemon(
        parent1_species: u64,
        parent2_species: u64,
        genetics_data: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // In a full implementation, we would verify parent compatibility
        // For now, we allow any two Pokémon to breed
        
        let sender = tx_context::sender(ctx);
        let egg = Egg {
            id: object::new(ctx),
            parent1_species,
            parent2_species,
            incubation_steps: 0,
            required_steps: REQUIRED_INCUBATION_STEPS,
            genetics: genetics_data,
            owner: sender,
            created_timestamp: clock::timestamp_ms(clock),
        };

        // Transfer egg to the player
        transfer::public_transfer(egg, sender);
    }

    // ============================================
    // Core Functions - Incubation
    // ============================================

    /// Increment incubation progress
    /// Parameters:
    /// - egg: Mutable reference to the Egg NFT
    /// - steps: Number of steps to add
    public entry fun increment_incubation(
        egg: &mut Egg,
        steps: u64,
    ) {
        let new_steps = egg.incubation_steps + steps;
        
        // Cap at required steps
        if (new_steps > egg.required_steps) {
            egg.incubation_steps = egg.required_steps;
        } else {
            egg.incubation_steps = new_steps;
        }
    }

    /// Add steps after winning a battle
    /// Parameters:
    /// - egg: Mutable reference to the Egg NFT
    public entry fun add_battle_steps(egg: &mut Egg) {
        increment_incubation(egg, STEPS_PER_BATTLE_WIN);
    }

    // ============================================
    // Core Functions - Hatching
    // ============================================

    /// Hatch an egg into a Pokémon NFT
    /// Parameters:
    /// - egg: The Egg NFT to hatch (consumed)
    /// - offspring_species: Species ID of the hatched Pokémon
    /// - offspring_name: Name for the new Pokémon
    /// - offspring_types: Types of the new Pokémon
    /// - clock: Clock object for timestamp
    /// - ctx: Transaction context
    public entry fun hatch_egg(
        egg: Egg,
        offspring_species: u64,
        offspring_name: vector<u8>,
        offspring_types: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify incubation is complete
        assert!(egg.incubation_steps >= egg.required_steps, ENotEnoughSteps);

        // Destroy the egg
        let Egg {
            id,
            parent1_species: _,
            parent2_species: _,
            incubation_steps: _,
            required_steps: _,
            genetics: _,
            owner: _,
            created_timestamp: _,
        } = egg;
        object::delete(id);

        // Mint the new Pokémon at level 1
        pokemon::mint_captured(
            offspring_species,
            offspring_name,
            1, // Start at level 1
            offspring_types,
            clock,
            ctx
        );
    }

    // ============================================
    // Query Functions (Read-only)
    // ============================================

    /// Get parent species IDs
    public fun get_parent_species(egg: &Egg): (u64, u64) {
        (egg.parent1_species, egg.parent2_species)
    }

    /// Get incubation progress
    public fun get_incubation_progress(egg: &Egg): (u64, u64) {
        (egg.incubation_steps, egg.required_steps)
    }

    /// Check if egg is ready to hatch
    public fun is_ready_to_hatch(egg: &Egg): bool {
        egg.incubation_steps >= egg.required_steps
    }

    /// Get genetics data
    public fun get_genetics(egg: &Egg): vector<u8> {
        egg.genetics
    }

    /// Get owner
    public fun get_owner(egg: &Egg): address {
        egg.owner
    }

    /// Get creation timestamp
    public fun get_created_timestamp(egg: &Egg): u64 {
        egg.created_timestamp
    }

    // ============================================
    // Test Functions
    // ============================================

    #[test_only]
    public fun create_test_egg(
        parent1_species: u64,
        parent2_species: u64,
        incubation_steps: u64,
        ctx: &mut TxContext
    ): Egg {
        Egg {
            id: object::new(ctx),
            parent1_species,
            parent2_species,
            incubation_steps,
            required_steps: REQUIRED_INCUBATION_STEPS,
            genetics: vector::empty<u8>(),
            owner: tx_context::sender(ctx),
            created_timestamp: 0,
        }
    }

    #[test_only]
    public fun destroy_test_egg(egg: Egg) {
        let Egg {
            id,
            parent1_species: _,
            parent2_species: _,
            incubation_steps: _,
            required_steps: _,
            genetics: _,
            owner: _,
            created_timestamp: _,
        } = egg;
        object::delete(id);
    }
}
