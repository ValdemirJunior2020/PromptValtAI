// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";

import { auth } from "../lib/firebase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter email and password.");
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Logged in successfully.");
    } catch (error: any) {
      Alert.alert("Sign In Failed", error?.message || "Could not sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter email and password.");
    }

    if (password.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters.");
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Account created successfully.");
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error?.message || "Could not create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.glowWrapper}>
          <Image source={require("../../logo.jpg")} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>PromptVault AI</Text>
        <Text style={styles.tagline}>The Ultimate Prompt Engineer</Text>
      </View>

      <View style={styles.glassCard}>
        <Text style={styles.cardHeader}>Access Your Vault</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#888899"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888899"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isLoading ? (
          <ActivityIndicator color="#9333EA" size="large" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.buttonStack}>
            <TouchableOpacity style={styles.primaryButtonShadow} onPress={handleSignIn}>
              <LinearGradient
                colors={["#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryGradient}
              >
                <Text style={styles.primaryBtnText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp}>
              <Text style={styles.secondaryBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F14", padding: 20, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  glowWrapper: {
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 15,
  },
  logoImage: { width: 80, height: 80, borderRadius: 20, borderWidth: 1.5, borderColor: "#9333EA" },
  title: { color: "#ffffff", fontSize: 32, fontWeight: "800", letterSpacing: 0.5 },
  tagline: { color: "#A78BFA", fontSize: 15, marginTop: 4, fontWeight: "500" },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  cardHeader: { color: "#ffffff", fontSize: 20, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#1A1A24",
    color: "#ffffff",
    fontSize: 16,
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  buttonStack: { marginTop: 10, gap: 15 },
  primaryButtonShadow: {
    borderRadius: 50,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  primaryGradient: { paddingVertical: 18, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#ffffff", fontWeight: "800", fontSize: 18, letterSpacing: 0.5 },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#7C3AED",
    backgroundColor: "transparent",
  },
  secondaryBtnText: { color: "#A78BFA", fontWeight: "700", fontSize: 16, letterSpacing: 0.5 },
});