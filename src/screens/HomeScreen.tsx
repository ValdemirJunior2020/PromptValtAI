import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Terminal, PenTool, Image as ImageIcon, Briefcase } from 'lucide-react-native';
import { PROMPTS } from '../data/prompts';

const CATEGORIES = [
  { name: 'Coding', icon: Terminal, color: '#10b981' }, // emerald-500
  { name: 'Marketing', icon: Briefcase, color: '#f59e0b' }, // amber-500
  { name: 'Writing', icon: PenTool, color: '#6366f1' }, // indigo-500
  { name: 'Image Gen', icon: ImageIcon, color: '#ec4899' }, // pink-500
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const featuredPrompt = PROMPTS[0]; // Just grabbing the first one for the showcase

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-white mb-1">Vault</Text>
          <Text className="text-slate-400 text-base">Your premium AI prompt library.</Text>
        </View>

        {/* Categories Grid */}
        <Text className="text-xl font-bold text-white mb-4">Categories</Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <TouchableOpacity 
                key={index} 
                onPress={() => navigation.navigate('Discover', { category: cat.name })}
                className="w-[48%] bg-slate-900 p-4 rounded-2xl mb-4 border border-slate-800 items-center"
              >
                <View className="p-3 rounded-full mb-3" style={{ backgroundColor: `${cat.color}20` }}>
                  <Icon color={cat.color} size={28} />
                </View>
                <Text className="text-white font-bold">{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Featured / Daily Prompt */}
        <Text className="text-xl font-bold text-white mb-4">Prompt of the Day</Text>
        <TouchableOpacity 
          className="bg-blue-900/20 border border-blue-900/50 p-6 rounded-3xl mb-10 relative overflow-hidden"
          onPress={() => navigation.navigate('Discover')}
        >
          <View className="absolute -right-4 -top-4 opacity-10">
            <Sparkles color="#3b82f6" size={100} />
          </View>
          <View className="bg-blue-500/20 self-start px-3 py-1 rounded-full mb-3">
            <Text className="text-blue-400 text-xs font-bold uppercase">{featuredPrompt.category}</Text>
          </View>
          <Text className="text-2xl font-bold text-white mb-2">{featuredPrompt.title}</Text>
          <Text className="text-blue-200/70 leading-relaxed mb-4">{featuredPrompt.description}</Text>
          <Text className="text-blue-400 font-medium">Explore Prompt →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}