'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

interface SimpleEgg {
  id: string;
  parent1Species: number;
  parent2Species: number;
  parent1Name: string;
  parent2Name: string;
  incubationSteps: number;
  requiredSteps: number;
  owner: string;
  createdAt: any;
}

/**
 * 简化的繁殖系统 - 使用 Firebase 而不是区块链
 * 这样可以立即孵化，不需要等待区块链交易
 */
export function useSimpleBreeding(walletAddress?: string) {
  const [isLoading, setIsLoading] = useState(false);

  // 创建蛋
  const createEgg = async (
    parent1Species: number,
    parent2Species: number,
    parent1Name: string,
    parent2Name: string
  ) => {
    if (!walletAddress) {
      throw new Error('钱包未连接');
    }

    setIsLoading(true);
    try {
      const eggData = {
        parent1Species,
        parent2Species,
        parent1Name,
        parent2Name,
        incubationSteps: 0,
        requiredSteps: 100, // 简化为 100 步
        owner: walletAddress,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'eggs'), eggData);
      console.log('✅ 蛋创建成功:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ 创建蛋失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 增加孵化进度
  const addIncubationSteps = async (eggId: string, steps: number) => {
    setIsLoading(true);
    try {
      const eggRef = doc(db, 'eggs', eggId);
      await updateDoc(eggRef, {
        incubationSteps: steps,
      });
      console.log('✅ 孵化进度更新:', steps);
    } catch (error) {
      console.error('❌ 更新孵化进度失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 孵化蛋
  const hatchEgg = async (
    eggId: string,
    offspringSpecies: number,
    offspringName: string,
    offspringTypes: string[]
  ) => {
    if (!walletAddress) {
      throw new Error('钱包未连接');
    }

    setIsLoading(true);
    try {
      // 创建新的宝可梦
      const pokemonData = {
        owner: walletAddress,
        speciesId: offspringSpecies,
        name: offspringName,
        level: 1,
        experience: 0,
        stats: {
          hp: 30 + 3, // Level 1
          attack: 40 + 2,
          defense: 40 + 2,
          speed: 40 + 2,
        },
        types: offspringTypes,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${offspringSpecies}.png`,
        createdAt: serverTimestamp(),
        isCaptured: true,
        isHatched: true,
      };

      await addDoc(collection(db, 'pokemon'), pokemonData);
      console.log('✅ 宝可梦孵化成功');

      // 删除蛋
      await deleteDoc(doc(db, 'eggs', eggId));
      console.log('✅ 蛋已删除');

      return true;
    } catch (error) {
      console.error('❌ 孵化失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 获取玩家的蛋
  const getPlayerEggs = async (): Promise<SimpleEgg[]> => {
    if (!walletAddress) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'eggs'),
        where('owner', '==', walletAddress)
      );
      const querySnapshot = await getDocs(q);
      
      const eggs: SimpleEgg[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eggs.push({
          id: doc.id,
          parent1Species: data.parent1Species,
          parent2Species: data.parent2Species,
          parent1Name: data.parent1Name,
          parent2Name: data.parent2Name,
          incubationSteps: data.incubationSteps,
          requiredSteps: data.requiredSteps,
          owner: data.owner,
          createdAt: data.createdAt,
        });
      });

      return eggs;
    } catch (error) {
      console.error('❌ 获取蛋列表失败:', error);
      return [];
    }
  };

  return {
    createEgg,
    addIncubationSteps,
    hatchEgg,
    getPlayerEggs,
    isLoading,
  };
}
