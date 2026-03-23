import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { PROMPTS } from '../data/prompts';
import SearchBar from '../components/SearchBar';
import PromptCard from '../components/PromptCard';

const CATEGORIES = ['All', 'Coding', 'Marketing', 'Writing', 'Image Gen', 'Productivity'];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter logic
  const filteredPrompts = PROMPTS.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || prompt.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-6 pt-4 flex-1">
        <Text className="text-3xl font-bold text-white mb-6">Discover</Text>
        
        {/* We will build SearchBar in Step 10 */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Filter Pills */}
        <View className="my-6">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveCategory(item)}
                className={`px-5 py-2 rounded-full mr-3 border ${
                  activeCategory === item 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <Text className={`font-medium ${activeCategory === item ? 'text-white' : 'text-slate-400'}`}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Prompts List - We will build PromptCard in Step 10 */}
        <FlatList
          data={filteredPrompts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => <PromptCard prompt={item} />}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-10">No prompts found matching your criteria.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}