import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
  
  // Game-specific toasts
  pokemonCaptured: (pokemonName: string) => {
    sonnerToast.success('Pokémon Captured!', {
      description: `${pokemonName} has been added to your collection!`,
      duration: 5000,
    });
  },
  
  battleWon: (xpGained: number) => {
    sonnerToast.success('Victory!', {
      description: `You won the battle and gained ${xpGained} XP!`,
      duration: 5000,
    });
  },
  
  levelUp: (pokemonName: string, newLevel: number) => {
    sonnerToast.success('Level Up!', {
      description: `${pokemonName} reached level ${newLevel}!`,
      duration: 6000,
    });
  },
  
  eggHatched: (pokemonName: string) => {
    sonnerToast.success('Egg Hatched!', {
      description: `Your egg hatched into ${pokemonName}!`,
      duration: 6000,
    });
  },
  
  nftListed: (price: string) => {
    sonnerToast.success('NFT Listed!', {
      description: `Your NFT is now listed for ${price} SUI`,
      duration: 5000,
    });
  },
  
  nftPurchased: (nftName: string) => {
    sonnerToast.success('Purchase Complete!', {
      description: `You now own ${nftName}!`,
      duration: 5000,
    });
  },
  
  questCompleted: (questName: string) => {
    sonnerToast.success('Quest Completed!', {
      description: `You completed: ${questName}`,
      duration: 5000,
    });
  },
  
  transactionPending: () => {
    return sonnerToast.loading('Transaction pending...', {
      description: 'Please wait for blockchain confirmation',
    });
  },
};
