/// Pokémon NFT Smart Contract
/// Implements core NFT functionality for PokéChain Battles game
module pokemon_nft::pokemon {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;

    // ============================================
    // Data Structures
    // ============================================

    /// Stats struct for Pokémon attributes
    public struct Stats has store, copy, drop {
        hp: u64,
        attack: u64,
        defense: u64,
        speed: u64,
    }

    /// Pokémon NFT structure with all game attributes
    public struct Pokemon has key, store {
        id: UID,                    // Unique NFT ID
        species_id: u64,            // Pokémon species number (1-151 for Gen 1)
        name: String,               // Pokémon nickname
        level: u64,                 // Current level (starts at 1)
        experience: u64,            // Total experience points
        stats: Stats,               // Combat stats
        types: vector<String>,      // Pokémon types (e.g., ["fire"], ["water", "flying"])
        owner: address,             // Current owner address
        mint_timestamp: u64,        // When the NFT was minted
    }

    // ============================================
    // Core Functions - Minting
    // ============================================

    /// Mint a starter Pokémon for new players
    /// Parameters:
    /// - species_id: Pokémon species number (1-151)
    /// - name: Nickname for the Pokémon
    /// - types: Vector of type strings (e.g., ["fire"], ["water", "flying"])
    /// - clock: Clock object for timestamp
    /// - ctx: Transaction context
    public entry fun mint_starter(
        species_id: u64,
        name: vector<u8>,
        types: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Get base stats for the species
        let base_stats = get_starter_stats(species_id);
        
        // Convert type bytes to strings
        let mut type_strings = vector::empty<String>();
        let mut i = 0;
        let types_len = vector::length(&types);
        while (i < types_len) {
            let type_bytes = *vector::borrow(&types, i);
            vector::push_back(&mut type_strings, string::utf8(type_bytes));
            i = i + 1;
        };

        // Create the Pokémon NFT
        let sender = tx_context::sender(ctx);
        let pokemon = Pokemon {
            id: object::new(ctx),
            species_id,
            name: string::utf8(name),
            level: 1,
            experience: 0,
            stats: base_stats,
            types: type_strings,
            owner: sender,
            mint_timestamp: clock::timestamp_ms(clock),
        };

        // Transfer to the player
        transfer::public_transfer(pokemon, sender);
    }

    /// Mint a captured wild Pokémon
    /// Parameters:
    /// - species_id: Pokémon species number
    /// - name: Pokémon name
    /// - level: Level of the captured Pokémon
    /// - types: Vector of type strings
    /// - clock: Clock object for timestamp
    /// - ctx: Transaction context
    public entry fun mint_captured(
        species_id: u64,
        name: vector<u8>,
        level: u64,
        types: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Get base stats and scale by level
        let base_stats = get_starter_stats(species_id);
        let scaled_stats = scale_stats_by_level(base_stats, level);
        
        // Convert type bytes to strings
        let mut type_strings = vector::empty<String>();
        let mut i = 0;
        let types_len = vector::length(&types);
        while (i < types_len) {
            let type_bytes = *vector::borrow(&types, i);
            vector::push_back(&mut type_strings, string::utf8(type_bytes));
            i = i + 1;
        };

        // Calculate experience for the level (XP = Level^3)
        let xp = level * level * level;

        // Create the Pokémon NFT
        let sender = tx_context::sender(ctx);
        let pokemon = Pokemon {
            id: object::new(ctx),
            species_id,
            name: string::utf8(name),
            level,
            experience: xp,
            stats: scaled_stats,
            types: type_strings,
            owner: sender,
            mint_timestamp: clock::timestamp_ms(clock),
        };

        // Transfer to the player
        transfer::public_transfer(pokemon, sender);
    }

    // ============================================
    // Core Functions - Stats Update
    // ============================================

    /// Add experience to a Pokémon after battle
    /// Parameters:
    /// - pokemon: Mutable reference to the Pokémon NFT
    /// - exp_gained: Amount of experience to add
    public entry fun add_experience(
        pokemon: &mut Pokemon,
        exp_gained: u64,
    ) {
        pokemon.experience = pokemon.experience + exp_gained;
        
        // Auto level up if enough experience (simple formula: 100 exp per level)
        let exp_for_next_level = pokemon.level * 100;
        if (pokemon.experience >= exp_for_next_level && pokemon.level < 100) {
            pokemon.level = pokemon.level + 1;
            
            // Scale stats with new level
            let base_stats = get_starter_stats(pokemon.species_id);
            let new_stats = scale_stats_by_level(base_stats, pokemon.level);
            pokemon.stats = new_stats;
        };
    }

    /// Update Pokémon stats after leveling up
    /// Parameters:
    /// - pokemon: Mutable reference to the Pokémon NFT
    /// - new_experience: New total experience points
    /// - new_level: New level
    /// - new_stats: Updated stats
    public entry fun update_stats(
        pokemon: &mut Pokemon,
        new_experience: u64,
        new_level: u64,
        new_hp: u64,
        new_attack: u64,
        new_defense: u64,
        new_speed: u64,
    ) {
        // Update experience and level
        pokemon.experience = new_experience;
        pokemon.level = new_level;
        
        // Update stats
        pokemon.stats.hp = new_hp;
        pokemon.stats.attack = new_attack;
        pokemon.stats.defense = new_defense;
        pokemon.stats.speed = new_speed;
    }

    // ============================================
    // Helper Functions
    // ============================================

    /// Get base stats for starter Pokémon species
    /// Returns Stats struct with base values
    fun get_starter_stats(species_id: u64): Stats {
        // Starter Pokémon base stats (9 options)
        if (species_id == 1) {
            // Bulbasaur: Balanced
            Stats { hp: 45, attack: 49, defense: 49, speed: 45 }
        } else if (species_id == 4) {
            // Charmander: Attack-focused
            Stats { hp: 39, attack: 52, defense: 43, speed: 65 }
        } else if (species_id == 7) {
            // Squirtle: Defense-focused
            Stats { hp: 44, attack: 48, defense: 65, speed: 43 }
        } else if (species_id == 25) {
            // Pikachu: Speed-focused
            Stats { hp: 35, attack: 55, defense: 40, speed: 90 }
        } else if (species_id == 133) {
            // Eevee: Balanced
            Stats { hp: 55, attack: 55, defense: 50, speed: 55 }
        } else if (species_id == 152) {
            // Chikorita: Defense-focused
            Stats { hp: 45, attack: 49, defense: 65, speed: 45 }
        } else if (species_id == 155) {
            // Cyndaquil: Attack-focused
            Stats { hp: 39, attack: 52, defense: 43, speed: 65 }
        } else if (species_id == 158) {
            // Totodile: Attack-focused
            Stats { hp: 50, attack: 65, defense: 64, speed: 43 }
        } else if (species_id == 175) {
            // Togepi: Balanced
            Stats { hp: 35, attack: 20, defense: 65, speed: 20 }
        } else {
            // Default stats for any other species
            Stats { hp: 40, attack: 45, defense: 45, speed: 40 }
        }
    }

    /// Scale stats based on level
    /// Formula: base_stat + (base_stat * (level - 1) / 10)
    fun scale_stats_by_level(base_stats: Stats, level: u64): Stats {
        let level_bonus = if (level > 1) { level - 1 } else { 0 };
        
        Stats {
            hp: base_stats.hp + (base_stats.hp * level_bonus / 10),
            attack: base_stats.attack + (base_stats.attack * level_bonus / 10),
            defense: base_stats.defense + (base_stats.defense * level_bonus / 10),
            speed: base_stats.speed + (base_stats.speed * level_bonus / 10),
        }
    }

    // ============================================
    // Query Functions (Read-only)
    // ============================================

    /// Get Pokémon species ID
    public fun get_species_id(pokemon: &Pokemon): u64 {
        pokemon.species_id
    }

    /// Get Pokémon name
    public fun get_name(pokemon: &Pokemon): String {
        pokemon.name
    }

    /// Get Pokémon level
    public fun get_level(pokemon: &Pokemon): u64 {
        pokemon.level
    }

    /// Get Pokémon experience
    public fun get_experience(pokemon: &Pokemon): u64 {
        pokemon.experience
    }

    /// Get Pokémon stats
    public fun get_stats(pokemon: &Pokemon): Stats {
        pokemon.stats
    }

    /// Get Pokémon HP
    public fun get_hp(pokemon: &Pokemon): u64 {
        pokemon.stats.hp
    }

    /// Get Pokémon attack
    public fun get_attack(pokemon: &Pokemon): u64 {
        pokemon.stats.attack
    }

    /// Get Pokémon defense
    public fun get_defense(pokemon: &Pokemon): u64 {
        pokemon.stats.defense
    }

    /// Get Pokémon speed
    public fun get_speed(pokemon: &Pokemon): u64 {
        pokemon.stats.speed
    }

    /// Get Pokémon types
    public fun get_types(pokemon: &Pokemon): vector<String> {
        pokemon.types
    }

    /// Get Pokémon owner
    public fun get_owner(pokemon: &Pokemon): address {
        pokemon.owner
    }

    /// Get mint timestamp
    public fun get_mint_timestamp(pokemon: &Pokemon): u64 {
        pokemon.mint_timestamp
    }

    // ============================================
    // Test Functions
    // ============================================

    #[test_only]
    public fun create_test_pokemon(
        species_id: u64,
        name: vector<u8>,
        level: u64,
        ctx: &mut TxContext
    ): Pokemon {
        let base_stats = get_starter_stats(species_id);
        let scaled_stats = scale_stats_by_level(base_stats, level);
        
        Pokemon {
            id: object::new(ctx),
            species_id,
            name: string::utf8(name),
            level,
            experience: level * level * level,
            stats: scaled_stats,
            types: vector::empty<String>(),
            owner: tx_context::sender(ctx),
            mint_timestamp: 0,
        }
    }

    #[test_only]
    public fun destroy_test_pokemon(pokemon: Pokemon) {
        let Pokemon { 
            id, 
            species_id: _, 
            name: _, 
            level: _, 
            experience: _, 
            stats: _, 
            types: _, 
            owner: _, 
            mint_timestamp: _ 
        } = pokemon;
        object::delete(id);
    }
}
