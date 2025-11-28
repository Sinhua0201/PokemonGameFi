/// Pokemon NFT Smart Contract - OneChain Compatible Version
/// Uses OTW pattern and custom POKEMON token for OneChain deployment

module pokemon_nft::pokemon {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self as balance, Balance, Supply};
    use std::option;
    use std::string::{Self, String};
    use std::vector;

    // ============================================
    // One-Time Witness for Token Creation
    // ============================================
    
    /// One-time witness for POKEMON token creation
    public struct POKEMON has drop {}

    // ============================================
    // Error Constants
    // ============================================
    
    const ELevelTooLow: u64 = 0;
    const EAlreadyFullyEvolved: u64 = 1;
    const EInsufficientPayment: u64 = 2;

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
        id: UID,
        species_id: u64,
        name: String,
        level: u64,
        experience: u64,
        stats: Stats,
        types: vector<String>,
        owner: address,
        mint_timestamp: u64,
        evolution_stage: u64,
    }

    /// Token treasury for managing POKEMON token supply
    public struct TokenTreasury has key {
        id: UID,
        supply: Supply<POKEMON>,
    }

    /// Game state to hold collected fees
    public struct GameState has key {
        id: UID,
        treasury: Balance<POKEMON>,
        mint_price: u64,
    }

    // ============================================
    // Initialization - OTW Pattern
    // ============================================

    /// Initialize with One-Time Witness pattern
    fun init(witness: POKEMON, ctx: &mut TxContext) {
        // Create custom POKEMON currency
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"POKE",
            b"Pokemon Token",
            b"Token for Pokemon NFT Game",
            option::none(),
            ctx
        );
        
        // Create token treasury
        let treasury = TokenTreasury {
            id: object::new(ctx),
            supply: coin::treasury_into_supply(treasury_cap),
        };
        
        // Create game state
        let game_state = GameState {
            id: object::new(ctx),
            treasury: balance::zero<POKEMON>(),
            mint_price: 1000000000, // 1 POKE token
        };
        
        // Share objects
        transfer::share_object(treasury);
        transfer::share_object(game_state);
        transfer::public_freeze_object(metadata);
    }

    // ============================================
    // Core Functions - Minting
    // ============================================

    /// Mint a starter Pokémon (free)
    public entry fun mint_starter(
        species_id: u64,
        name: vector<u8>,
        types: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let base_stats = get_starter_stats(species_id);
        
        let mut type_strings = vector::empty<String>();
        let mut i = 0;
        let types_len = vector::length(&types);
        while (i < types_len) {
            let type_bytes = *vector::borrow(&types, i);
            vector::push_back(&mut type_strings, string::utf8(type_bytes));
            i = i + 1;
        };

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
            evolution_stage: 0,
        };

        transfer::public_transfer(pokemon, sender);
    }

    /// Mint a captured wild Pokémon (requires payment)
    public entry fun mint_captured(
        species_id: u64,
        name: vector<u8>,
        level: u64,
        types: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Captured Pokemon are free to mint (payment removed for better UX)
        
        // Get stats and scale by level
        let base_stats = get_starter_stats(species_id);
        let scaled_stats = scale_stats_by_level(base_stats, level);
        
        // Convert types
        let mut type_strings = vector::empty<String>();
        let mut i = 0;
        let types_len = vector::length(&types);
        while (i < types_len) {
            let type_bytes = *vector::borrow(&types, i);
            vector::push_back(&mut type_strings, string::utf8(type_bytes));
            i = i + 1;
        };

        let xp = level * level * level;
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
            evolution_stage: 0,
        };

        transfer::public_transfer(pokemon, sender);
    }

    // ============================================
    // Core Functions - Evolution
    // ============================================

    /// Evolve a Pokémon to its next stage
    public entry fun evolve_pokemon(
        pokemon: &mut Pokemon,
        new_species_id: u64,
        new_name: vector<u8>,
    ) {
        let required_level = if (pokemon.evolution_stage == 0) {
            12
        } else if (pokemon.evolution_stage == 1) {
            20
        } else {
            100
        };

        assert!(pokemon.level >= required_level, ELevelTooLow);
        assert!(pokemon.evolution_stage < 2, EAlreadyFullyEvolved);

        pokemon.evolution_stage = pokemon.evolution_stage + 1;
        pokemon.species_id = new_species_id;
        pokemon.name = string::utf8(new_name);
        
        // Boost stats by 20%
        let hp_boost = pokemon.stats.hp / 5;
        let attack_boost = pokemon.stats.attack / 5;
        let defense_boost = pokemon.stats.defense / 5;
        let speed_boost = pokemon.stats.speed / 5;
        
        pokemon.stats.hp = pokemon.stats.hp + hp_boost;
        pokemon.stats.attack = pokemon.stats.attack + attack_boost;
        pokemon.stats.defense = pokemon.stats.defense + defense_boost;
        pokemon.stats.speed = pokemon.stats.speed + speed_boost;
    }

    // ============================================
    // Core Functions - Stats Update
    // ============================================

    /// Add experience to a Pokémon after battle
    public entry fun add_experience(
        pokemon: &mut Pokemon,
        exp_gained: u64,
    ) {
        pokemon.experience = pokemon.experience + exp_gained;
        
        let exp_for_next_level = pokemon.level * 100;
        if (pokemon.experience >= exp_for_next_level && pokemon.level < 100) {
            pokemon.level = pokemon.level + 1;
            
            let base_stats = get_starter_stats(pokemon.species_id);
            let new_stats = scale_stats_by_level(base_stats, pokemon.level);
            pokemon.stats = new_stats;
        };
    }

    /// Update Pokémon stats
    public entry fun update_stats(
        pokemon: &mut Pokemon,
        new_experience: u64,
        new_level: u64,
        new_hp: u64,
        new_attack: u64,
        new_defense: u64,
        new_speed: u64,
    ) {
        pokemon.experience = new_experience;
        pokemon.level = new_level;
        pokemon.stats.hp = new_hp;
        pokemon.stats.attack = new_attack;
        pokemon.stats.defense = new_defense;
        pokemon.stats.speed = new_speed;
    }

    // ============================================
    // Helper Functions
    // ============================================

    fun get_starter_stats(species_id: u64): Stats {
        if (species_id == 1) {
            Stats { hp: 45, attack: 49, defense: 49, speed: 45 }
        } else if (species_id == 4) {
            Stats { hp: 39, attack: 52, defense: 43, speed: 65 }
        } else if (species_id == 7) {
            Stats { hp: 44, attack: 48, defense: 65, speed: 43 }
        } else if (species_id == 25) {
            Stats { hp: 35, attack: 55, defense: 40, speed: 90 }
        } else if (species_id == 133) {
            Stats { hp: 55, attack: 55, defense: 50, speed: 55 }
        } else if (species_id == 152) {
            Stats { hp: 45, attack: 49, defense: 65, speed: 45 }
        } else if (species_id == 155) {
            Stats { hp: 39, attack: 52, defense: 43, speed: 65 }
        } else if (species_id == 158) {
            Stats { hp: 50, attack: 65, defense: 64, speed: 43 }
        } else if (species_id == 175) {
            Stats { hp: 35, attack: 20, defense: 65, speed: 20 }
        } else {
            Stats { hp: 40, attack: 45, defense: 45, speed: 40 }
        }
    }

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
    // Query Functions
    // ============================================

    public fun get_species_id(pokemon: &Pokemon): u64 { pokemon.species_id }
    public fun get_name(pokemon: &Pokemon): String { pokemon.name }
    public fun get_level(pokemon: &Pokemon): u64 { pokemon.level }
    public fun get_experience(pokemon: &Pokemon): u64 { pokemon.experience }
    public fun get_stats(pokemon: &Pokemon): Stats { pokemon.stats }
    public fun get_hp(pokemon: &Pokemon): u64 { pokemon.stats.hp }
    public fun get_attack(pokemon: &Pokemon): u64 { pokemon.stats.attack }
    public fun get_defense(pokemon: &Pokemon): u64 { pokemon.stats.defense }
    public fun get_speed(pokemon: &Pokemon): u64 { pokemon.stats.speed }
    public fun get_types(pokemon: &Pokemon): vector<String> { pokemon.types }
    public fun get_owner(pokemon: &Pokemon): address { pokemon.owner }
    public fun get_mint_timestamp(pokemon: &Pokemon): u64 { pokemon.mint_timestamp }
    public fun get_evolution_stage(pokemon: &Pokemon): u64 { pokemon.evolution_stage }

    public fun can_evolve(pokemon: &Pokemon): bool {
        if (pokemon.evolution_stage >= 2) {
            return false
        };
        
        let required_level = if (pokemon.evolution_stage == 0) { 12 } else { 20 };
        pokemon.level >= required_level
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
            evolution_stage: 0,
        }
    }

    #[test_only]
    public fun destroy_test_pokemon(pokemon: Pokemon) {
        let Pokemon { 
            id, species_id: _, name: _, level: _, experience: _, 
            stats: _, types: _, owner: _, mint_timestamp: _, evolution_stage: _
        } = pokemon;
        object::delete(id);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(POKEMON {}, ctx);
    }
}
