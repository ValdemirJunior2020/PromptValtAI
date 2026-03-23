import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Copy, Heart, ChevronDown, ChevronUp } from 'lucide-react-native';
import { PromptData } from '../data/prompts';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PromptCardProps {
  prompt: PromptData;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this prompt is already favorited on mount
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const storedFavs = await AsyncStorage.getItem('@favorites');
        if (storedFavs) {
          const favIds: string[] = JSON.parse(storedFavs);
          setIsFavorite(favIds.includes(prompt.id));
        }
      } catch (error) {
        console.error('Error reading favorites', error);
      }
    };
    checkFavorite();
  }, [prompt.id]);

  const toggleFavorite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const storedFavs = await AsyncStorage.getItem('@favorites');
      let favIds: string[] = storedFavs ? JSON.parse(storedFavs) : [];

      if (isFavorite) {
        favIds = favIds.filter(id => id !== prompt.id);
        Toast.show({ type: 'info', text1: 'Removed', text2: 'Prompt removed from favorites.' });
      } else {
        favIds.push(prompt.id);
        Toast.show({ type: 'success', text1: 'Saved!', text2: 'Prompt added to your vault.' });
      }

      await AsyncStorage.setItem('@favorites', JSON.stringify(favIds));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error saving favorite', error);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(prompt.promptText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Copied!', text2: 'Ready to paste into your AI.' });
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl mb-4 overflow-hidden">
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8} className="p-5">
        
        {/* Header: Badges and Favorite Button */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row space-x-2">
            <View className="bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
              <Text className="text-blue-400 text-xs font-bold">{prompt.platform}</Text>
            </View>
            <View className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
              <Text className="text-slate-300 text-xs font-bold">{prompt.difficulty}</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={toggleFavorite} className="p-2 -mt-2 -mr-2">
            <Heart 
              color={isFavorite ? '#ef4444' : '#64748b'} 
              fill={isFavorite ? '#ef4444' : 'transparent'} 
              size={22} 
            />
          </TouchableOpacity>
        </View>

        {/* Title and Description */}
        <Text className="text-xl font-bold text-white mb-2">{prompt.title}</Text>
        <Text className="text-slate-400 leading-snug">{prompt.description}</Text>

        {/* Expand Icon */}
        <View className="items-center mt-3 pt-2 border-t border-slate-800/50">
          {isExpanded ? <ChevronUp color="#475569" size={20} /> : <ChevronDown color="#475569" size={20} />}
        </View>
      </TouchableOpacity>

      {/* Expanded Content: The Actual Prompt and Copy Button */}
      {isExpanded && (
        <View className="px-5 pb-5 pt-2 bg-slate-900/50">
          <View className="bg-black/20 p-4 rounded-xl border border-slate-800 mb-4">
            <Text className="text-slate-300 text-sm leading-relaxed">{prompt.promptText}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={copyToClipboard}
            className="flex-row items-center justify-center bg-blue-600 py-3 rounded-xl"
          >
            <Copy color="#ffffff" size={18} />
            <Text className="text-white font-bold ml-2">Copy Prompt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}