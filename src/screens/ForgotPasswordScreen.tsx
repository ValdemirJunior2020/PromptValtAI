import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleReset = async () => {
    if (!email) {
      return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your email' });
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({ type: 'success', text1: 'Email Sent', text2: 'Check your inbox for reset instructions.' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Reset Failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950 justify-center px-6"
    >
      <View className="mb-10">
        <Text className="text-3xl font-bold text-white text-center mb-2">Reset Password</Text>
        <Text className="text-slate-400 text-center text-base">We'll send you a link to reset it.</Text>
      </View>

      <View className="space-y-4">
        <TextInput
          className="bg-slate-900 text-white px-4 py-4 rounded-xl border border-slate-800"
          placeholder="Email address"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity 
          onPress={handleReset} 
          disabled={loading}
          className={`py-4 rounded-xl mt-6 ${loading ? 'bg-blue-500/50' : 'bg-blue-600'}`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8">
        <Text className="text-slate-400 text-center font-medium">Back to Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}