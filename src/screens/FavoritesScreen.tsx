import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROMPTS, PromptData } from '../data/prompts';
import PromptCard from '../components/PromptCard';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<PromptData[]>([]);

  // Load favorites every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const storedFavs = await AsyncStorage.getItem('@favorites');
          if (storedFavs) {
            const favIds: string[] = JSON.parse(storedFavs);
            const favPrompts = PROMPTS.filter(p => favIds.includes(p.id));
            setFavorites(favPrompts);
          } else {
            setFavorites([]);
          }
        } catch (error) {
          console.error('Failed to load favorites', error);
        }
      };
      loadFavorites();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-6 pt-4 flex-1">
        <Text className="text-3xl font-bold text-white mb-6">Favorites</Text>
        
        {favorites.length === 0 ? (
          <View className="flex-1 items-center justify-center -mt-20">
            <Heart color="#334155" size={64} className="mb-4" />
            <Text className="text-xl font-bold text-slate-400 mb-2">No favorites yet</Text>
            <Text className="text-slate-600 text-center">Tap the heart icon on any prompt to save it to your vault.</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => <PromptCard prompt={item} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}