/**
 * Complete Pokemon Evolution Data for Gen 1 (1-151)
 * Format: speciesId: [evolution1, evolution2, ...]
 */

export interface EvolutionData {
  id: number;
  name: string;
}

export const EVOLUTION_MAP: Record<number, EvolutionData[]> = {
  // Kanto Starters
  1: [{ id: 2, name: 'Ivysaur' }, { id: 3, name: 'Venusaur' }],
  4: [{ id: 5, name: 'Charmeleon' }, { id: 6, name: 'Charizard' }],
  7: [{ id: 8, name: 'Wartortle' }, { id: 9, name: 'Blastoise' }],
  
  // Caterpie line
  10: [{ id: 11, name: 'Metapod' }, { id: 12, name: 'Butterfree' }],
  
  // Weedle line
  13: [{ id: 14, name: 'Kakuna' }, { id: 15, name: 'Beedrill' }],
  
  // Pidgey line
  16: [{ id: 17, name: 'Pidgeotto' }, { id: 18, name: 'Pidgeot' }],
  
  // Rattata line
  19: [{ id: 20, name: 'Raticate' }],
  
  // Spearow line
  21: [{ id: 22, name: 'Fearow' }],
  
  // Ekans line
  23: [{ id: 24, name: 'Arbok' }],
  
  // Pikachu line
  25: [{ id: 26, name: 'Raichu' }],
  
  // Sandshrew line
  27: [{ id: 28, name: 'Sandslash' }],
  
  // Nidoran♀ line
  29: [{ id: 30, name: 'Nidorina' }, { id: 31, name: 'Nidoqueen' }],
  
  // Nidoran♂ line
  32: [{ id: 33, name: 'Nidorino' }, { id: 34, name: 'Nidoking' }],
  
  // Clefairy line
  35: [{ id: 36, name: 'Clefable' }],
  
  // Vulpix line
  37: [{ id: 38, name: 'Ninetales' }],
  
  // Jigglypuff line
  39: [{ id: 40, name: 'Wigglytuff' }],
  
  // Zubat line
  41: [{ id: 42, name: 'Golbat' }],
  
  // Oddish line
  43: [{ id: 44, name: 'Gloom' }, { id: 45, name: 'Vileplume' }],
  
  // Paras line
  46: [{ id: 47, name: 'Parasect' }],
  
  // Venonat line
  48: [{ id: 49, name: 'Venomoth' }],
  
  // Diglett line
  50: [{ id: 51, name: 'Dugtrio' }],
  
  // Meowth line
  52: [{ id: 53, name: 'Persian' }],
  
  // Psyduck line
  54: [{ id: 55, name: 'Golduck' }],
  
  // Mankey line
  56: [{ id: 57, name: 'Primeape' }],
  
  // Growlithe line
  58: [{ id: 59, name: 'Arcanine' }],
  
  // Poliwag line
  60: [{ id: 61, name: 'Poliwhirl' }, { id: 62, name: 'Poliwrath' }],
  
  // Abra line
  63: [{ id: 64, name: 'Kadabra' }, { id: 65, name: 'Alakazam' }],
  
  // Machop line
  66: [{ id: 67, name: 'Machoke' }, { id: 68, name: 'Machamp' }],
  
  // Bellsprout line
  69: [{ id: 70, name: 'Weepinbell' }, { id: 71, name: 'Victreebel' }],
  
  // Tentacool line
  72: [{ id: 73, name: 'Tentacruel' }],
  
  // Geodude line
  74: [{ id: 75, name: 'Graveler' }, { id: 76, name: 'Golem' }],
  
  // Ponyta line
  77: [{ id: 78, name: 'Rapidash' }],
  
  // Slowpoke line
  79: [{ id: 80, name: 'Slowbro' }],
  
  // Magnemite line
  81: [{ id: 82, name: 'Magneton' }],
  
  // Doduo line
  84: [{ id: 85, name: 'Dodrio' }],
  
  // Seel line
  86: [{ id: 87, name: 'Dewgong' }],
  
  // Grimer line
  88: [{ id: 89, name: 'Muk' }],
  
  // Shellder line
  90: [{ id: 91, name: 'Cloyster' }],
  
  // Gastly line
  92: [{ id: 93, name: 'Haunter' }, { id: 94, name: 'Gengar' }],
  
  // Onix line (no evolution in Gen 1)
  
  // Drowzee line
  96: [{ id: 97, name: 'Hypno' }],
  
  // Krabby line
  98: [{ id: 99, name: 'Kingler' }],
  
  // Voltorb line
  100: [{ id: 101, name: 'Electrode' }],
  
  // Exeggcute line
  102: [{ id: 103, name: 'Exeggutor' }],
  
  // Cubone line
  104: [{ id: 105, name: 'Marowak' }],
  
  // Koffing line
  109: [{ id: 110, name: 'Weezing' }],
  
  // Rhyhorn line
  111: [{ id: 112, name: 'Rhydon' }],
  
  // Horsea line
  116: [{ id: 117, name: 'Seadra' }],
  
  // Goldeen line
  118: [{ id: 119, name: 'Seaking' }],
  
  // Staryu line
  120: [{ id: 121, name: 'Starmie' }],
  
  // Magikarp line
  129: [{ id: 130, name: 'Gyarados' }],
  
  // Eevee line (multiple evolutions, simplified to one)
  133: [{ id: 134, name: 'Vaporeon' }],
  
  // Omanyte line
  138: [{ id: 139, name: 'Omastar' }],
  
  // Kabuto line
  140: [{ id: 141, name: 'Kabutops' }],
  
  // Dratini line
  147: [{ id: 148, name: 'Dragonair' }, { id: 149, name: 'Dragonite' }],
  
  // Johto Starters (Gen 2)
  152: [{ id: 153, name: 'Bayleef' }, { id: 154, name: 'Meganium' }],
  155: [{ id: 156, name: 'Quilava' }, { id: 157, name: 'Typhlosion' }],
  158: [{ id: 159, name: 'Croconaw' }, { id: 160, name: 'Feraligatr' }],
  
  // Togepi line
  175: [{ id: 176, name: 'Togetic' }],
  
  // Mareep line
  179: [{ id: 180, name: 'Flaaffy' }, { id: 181, name: 'Ampharos' }],
  
  // Hoppip line
  187: [{ id: 188, name: 'Skiploom' }, { id: 189, name: 'Jumpluff' }],
  
  // Wooper line
  194: [{ id: 195, name: 'Quagsire' }],
  
  // Sunkern line
  191: [{ id: 192, name: 'Sunflora' }],
  
  // Yanma line (no evolution in Gen 2)
  
  // Pineco line
  204: [{ id: 205, name: 'Forretress' }],
  
  // Snubbull line
  209: [{ id: 210, name: 'Granbull' }],
  
  // Teddiursa line
  216: [{ id: 217, name: 'Ursaring' }],
  
  // Slugma line
  218: [{ id: 219, name: 'Magcargo' }],
  
  // Swinub line
  220: [{ id: 221, name: 'Piloswine' }],
  
  // Remoraid line
  223: [{ id: 224, name: 'Octillery' }],
  
  // Houndour line
  228: [{ id: 229, name: 'Houndoom' }],
  
  // Phanpy line
  231: [{ id: 232, name: 'Donphan' }],
  
  // Larvitar line
  246: [{ id: 247, name: 'Pupitar' }, { id: 248, name: 'Tyranitar' }],
  
  // Hoenn Starters (Gen 3)
  252: [{ id: 253, name: 'Grovyle' }, { id: 254, name: 'Sceptile' }],
  255: [{ id: 256, name: 'Combusken' }, { id: 257, name: 'Blaziken' }],
  258: [{ id: 259, name: 'Marshtomp' }, { id: 260, name: 'Swampert' }],
  
  // Poochyena line
  261: [{ id: 262, name: 'Mightyena' }],
  
  // Zigzagoon line
  263: [{ id: 264, name: 'Linoone' }],
  
  // Wurmple line (branches)
  265: [{ id: 266, name: 'Silcoon' }, { id: 267, name: 'Beautifly' }],
  
  // Lotad line
  270: [{ id: 271, name: 'Lombre' }, { id: 272, name: 'Ludicolo' }],
  
  // Seedot line
  273: [{ id: 274, name: 'Nuzleaf' }, { id: 275, name: 'Shiftry' }],
  
  // Taillow line
  276: [{ id: 277, name: 'Swellow' }],
  
  // Wingull line
  278: [{ id: 279, name: 'Pelipper' }],
  
  // Ralts line
  280: [{ id: 281, name: 'Kirlia' }, { id: 282, name: 'Gardevoir' }],
  
  // Surskit line
  283: [{ id: 284, name: 'Masquerain' }],
  
  // Shroomish line
  285: [{ id: 286, name: 'Breloom' }],
  
  // Slakoth line
  287: [{ id: 288, name: 'Vigoroth' }, { id: 289, name: 'Slaking' }],
  
  // Nincada line
  290: [{ id: 291, name: 'Ninjask' }],
  
  // Whismur line
  293: [{ id: 294, name: 'Loudred' }, { id: 295, name: 'Exploud' }],
  
  // Makuhita line
  296: [{ id: 297, name: 'Hariyama' }],
  
  // Azurill line
  298: [{ id: 183, name: 'Marill' }, { id: 184, name: 'Azumarill' }],
  
  // Nosepass line (no evolution in Gen 3)
  
  // Skitty line
  300: [{ id: 301, name: 'Delcatty' }],
  
  // Aron line
  304: [{ id: 305, name: 'Lairon' }, { id: 306, name: 'Aggron' }],
  
  // Meditite line
  307: [{ id: 308, name: 'Medicham' }],
  
  // Electrike line
  309: [{ id: 310, name: 'Manectric' }],
  
  // Gulpin line
  316: [{ id: 317, name: 'Swalot' }],
  
  // Carvanha line
  318: [{ id: 319, name: 'Sharpedo' }],
  
  // Wailmer line
  320: [{ id: 321, name: 'Wailord' }],
  
  // Numel line
  322: [{ id: 323, name: 'Camerupt' }],
  
  // Spoink line
  325: [{ id: 326, name: 'Grumpig' }],
  
  // Trapinch line
  328: [{ id: 329, name: 'Vibrava' }, { id: 330, name: 'Flygon' }],
  
  // Cacnea line
  331: [{ id: 332, name: 'Cacturne' }],
  
  // Swablu line
  333: [{ id: 334, name: 'Altaria' }],
  
  // Barboach line
  339: [{ id: 340, name: 'Whiscash' }],
  
  // Corphish line
  341: [{ id: 342, name: 'Crawdaunt' }],
  
  // Baltoy line
  343: [{ id: 344, name: 'Claydol' }],
  
  // Lileep line
  345: [{ id: 346, name: 'Cradily' }],
  
  // Anorith line
  347: [{ id: 348, name: 'Armaldo' }],
  
  // Feebas line
  349: [{ id: 350, name: 'Milotic' }],
  
  // Shuppet line
  353: [{ id: 354, name: 'Banette' }],
  
  // Duskull line
  355: [{ id: 356, name: 'Dusclops' }],
  
  // Snorunt line
  361: [{ id: 362, name: 'Glalie' }],
  
  // Spheal line
  363: [{ id: 364, name: 'Sealeo' }, { id: 365, name: 'Walrein' }],
  
  // Clamperl line (branches)
  366: [{ id: 367, name: 'Huntail' }],
  
  // Bagon line
  371: [{ id: 372, name: 'Shelgon' }, { id: 373, name: 'Salamence' }],
  
  // Beldum line
  374: [{ id: 375, name: 'Metang' }, { id: 376, name: 'Metagross' }],
  
  // Note: Pokemon that don't evolve are not included in this map
  // Legendaries and special Pokemon without evolutions are excluded
};

/**
 * Get evolution data for a Pokemon at a specific evolution stage
 * This function handles both base forms and already-evolved forms
 * 
 * @param speciesId - The current Pokemon's species ID
 * @param evolutionStage - How many times this Pokemon has already evolved (0 = base, 1 = first evolution, 2 = second evolution)
 * @returns The next evolution data, or null if fully evolved
 */
export function getEvolutionData(speciesId: number, evolutionStage: number): EvolutionData | null {
  // First, try direct lookup (for base forms where speciesId matches the map key)
  let evolutions = EVOLUTION_MAP[speciesId];
  
  if (evolutions) {
    // This is a base form, use evolutionStage as index
    if (evolutionStage < evolutions.length) {
      return evolutions[evolutionStage];
    }
    return null; // Already fully evolved
  }
  
  // If not found, this might be an evolved form (e.g., Marshtomp #259)
  // Search through all evolution chains to find where this Pokemon appears
  for (const [baseId, evolutionChain] of Object.entries(EVOLUTION_MAP)) {
    for (let i = 0; i < evolutionChain.length; i++) {
      if (evolutionChain[i].id === speciesId) {
        // Found it! This Pokemon appears at position i in the chain
        // But we need to account for how many times it has ALREADY evolved (evolutionStage)
        // The next evolution is at position: i + 1 + evolutionStage
        const nextIndex = i + 1;
        if (nextIndex < evolutionChain.length) {
          return evolutionChain[nextIndex];
        }
        return null; // No more evolutions
      }
    }
  }
  
  return null;
}

/**
 * Check if a Pokemon has any evolutions available
 */
export function hasEvolution(speciesId: number): boolean {
  return speciesId in EVOLUTION_MAP;
}

/**
 * Get the total number of evolutions for a Pokemon
 */
export function getEvolutionCount(speciesId: number): number {
  return EVOLUTION_MAP[speciesId]?.length || 0;
}

/**
 * Infer the correct evolution stage based on species ID
 * This is needed for Pokemon that were minted directly as evolved forms
 * or minted with old contracts that didn't have evolution_stage field
 */
export function inferEvolutionStage(speciesId: number, reportedStage: number): number {
  // If reported stage seems correct, use it
  if (reportedStage > 0) {
    return reportedStage;
  }
  
  // Search through all evolution chains to find this Pokemon
  for (const [baseId, evolutionChain] of Object.entries(EVOLUTION_MAP)) {
    // Check if this is the base form
    if (Number(baseId) === speciesId) {
      return 0; // Base form
    }
    
    // Check if this Pokemon appears in the evolution chain
    for (let i = 0; i < evolutionChain.length; i++) {
      if (evolutionChain[i].id === speciesId) {
        // Found it at position i, so it has evolved i+1 times
        return i + 1;
      }
    }
  }
  
  // Not found in any chain, assume it's a base form or doesn't evolve
  return reportedStage;
}
