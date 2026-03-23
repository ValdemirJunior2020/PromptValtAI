import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { Zap, Star, ShieldCheck, X } from 'lucide-react-native';

const PACKAGES = [
  {
    id: 'pack_5_credits',
    title: 'Starter Pack',
    credits: 5,
    price: '$1.00',
    icon: Zap,
    bestValue: false,
  },
  {
    id: 'pack_30_credits',
    title: 'Pro Pack',
    credits: 30,
    price: '$3.00',
    icon: Star,
    bestValue: true,
  },
];

export default function PurchaseScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Authentication Required', text2: 'Please log in to purchase credits.' });
      return;
    }

    setLoadingId(pkg.id);

    try {
      // STUB: In the future, call react-native-iap requestPurchase(pkg.id) here.
      console.log(`Simulating purchase for ${pkg.id} via App Store...`);
      
      // Simulate network/Apple delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 1. Give the user their credits in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: increment(pkg.credits)
      });

      console.log(`Successfully added ${pkg.credits} credits to user ${user.uid}`);
      Toast.show({ type: 'success', text1: 'Purchase Successful!', text2: `Added ${pkg.credits} credits to your vault.` });
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Purchase failed:', error);
      Toast.show({ type: 'error', text1: 'Purchase Failed', text2: error.message || 'Could not complete transaction.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-6 pt-4 pb-8 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-bold text-white">Get Credits</Text>
            <Text className="text-slate-400 mt-1">Unlock more AI generations</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-900 rounded-full">
            <X color="#94a3b8" size={24} />
          </TouchableOpacity>
        </View>

        {/* Packages */}
        <View className="space-y-6 flex-1 justify-center pb-12">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isLoading = loadingId === pkg.id;

            return (
              <TouchableOpacity
                key={pkg.id}
                disabled={loadingId !== null}
                onPress={() => handlePurchase(pkg)}
                className={`relative p-6 rounded-2xl border-2 ${
                  pkg.bestValue ? 'border-blue-500 bg-slate-900' : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                {pkg.bestValue && (
                  <View className="absolute -top-3.5 self-center bg-blue-500 px-4 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">Best Value</Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-4">
                    <View className={`p-3 rounded-full ${pkg.bestValue ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                      <Icon color={pkg.bestValue ? '#3b82f6' : '#94a3b8'} size={28} />
                    </View>
                    <View>
                      <Text className="text-xl font-bold text-white">{pkg.title}</Text>
                      <Text className="text-slate-400 mt-1">+{pkg.credits} Requests</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    {isLoading ? (
                      <ActivityIndicator color={pkg.bestValue ? '#3b82f6' : '#ffffff'} />
                    ) : (
                      <Text className="text-2xl font-bold text-white">{pkg.price}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer Guarantee */}
        <View className="flex-row items-center justify-center space-x-2 mt-auto">
          <ShieldCheck color="#64748b" size={16} />
          <Text className="text-slate-500 text-sm">Secure one-time purchase. Credits never expire.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}