import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 mb-6">
      <Search color="#64748b" size={20} />
      <TextInput
        className="flex-1 text-white ml-3 text-base"
        placeholder="Search prompts..."
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
    </View>
  );
}