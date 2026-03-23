// src/screens/GeneratorScreen.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
import {
  Copy,
  Image as ImageIcon,
  LogOut,
  MessageSquare,
  Paintbrush,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../lib/firebase";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://promptvaltai.onrender.com";

const buildUserId = () => {
  const user = auth.currentUser;
  return user?.uid || user?.email || "guest";
};

export default function GeneratorScreen() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCredits, setIsFetchingCredits] = useState(true);
  const [targetAI, setTargetAI] = useState("Midjourney");
  const [activeStyle, setActiveStyle] = useState("");
  const [credits, setCredits] = useState<number | string>("?");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showReauth, setShowReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");

  const quickStyles = [
    "Cinematic",
    "Cyberpunk",
    "Photorealistic",
    "Anime",
    "Minimalist",
    "3D Render",
  ];

  useEffect(() => {
    fetchInitialCredits();
  }, []);

  const persistCreditsLocally = async (value: number) => {
    try {
      await AsyncStorage.setItem(
        `promptvault_credits_${buildUserId()}`,
        String(value)
      );
    } catch (error) {
      console.log("local credit save failed:", error);
    }
  };

  const getLocalCredits = async () => {
    try {
      const raw = await AsyncStorage.getItem(
        `promptvault_credits_${buildUserId()}`
      );
      if (raw == null) return null;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    } catch (error) {
      console.log("local credit load failed:", error);
      return null;
    }
  };

  const fetchJson = async (url: string, options: RequestInit) => {
    const response = await fetch(url, options);
    const raw = await response.text();

    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    return { response, data };
  };

  const fetchInitialCredits = async () => {
    try {
      setIsFetchingCredits(true);

      const userId = buildUserId();
      const { response, data } = await fetchJson(
        `${API_BASE_URL}/api/credits?userId=${encodeURIComponent(userId)}`,
        {
          method: "GET",
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (response.ok) {
        const nextCredits = Number(data.credits ?? 0);
        setCredits(nextCredits);
        await persistCreditsLocally(nextCredits);
      } else {
        const localCredits = await getLocalCredits();
        setCredits(localCredits ?? "?");
        console.log("credits fetch failed:", data);
      }
    } catch (error: any) {
      const localCredits = await getLocalCredits();
      setCredits(localCredits ?? "?");
      console.log("credits fetch crash:", error?.message || error);
    } finally {
      setIsFetchingCredits(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result);
    Alert.alert("Copied!", "Master prompt copied to clipboard.");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    Keyboard.dismiss();

    if (credits === 0) {
      setShowPaywall(true);
      return;
    }

    try {
      setIsLoading(true);
      setResult("");

      const userId = buildUserId();
      const finalPromptIdea = `Create a ${targetAI} prompt for: ${prompt}. ${
        activeStyle ? `Make the style: ${activeStyle}.` : ""
      }`;

      const { response, data } = await fetchJson(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          userId,
          prompt: finalPromptIdea,
        }),
      });

      if (response.ok) {
        const nextCredits = Number(data.creditsRemaining ?? credits);
        setResult(data.data || "");
        setCredits(nextCredits);
        await persistCreditsLocally(nextCredits);
      } else if (response.status === 403) {
        setCredits(0);
        await persistCreditsLocally(0);
        setShowPaywall(true);
        setResult(data?.error || "Out of credits.");
      } else {
        setResult(data?.error || "Something went wrong.");
      }
    } catch (error: any) {
      console.log("generate crash:", error?.message || error);
      setResult(error?.message || "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  const runAccountDeletion = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsDeletingAccount(true);

    try {
      await deleteUser(user);
      Alert.alert("Account Deleted", "Your account has been permanently deleted.");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/requires-recent-login") {
        setShowReauth(true);
      } else {
        Alert.alert("Delete Failed", err?.message || "Could not delete your account.");
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const confirmDeleteAccount = () => {
    setShowAccountMenu(false);
    Alert.alert(
      "Delete your account?",
      "This permanently deletes your account. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: runAccountDeletion },
      ]
    );
  };

  const reauthAndDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!user.email) {
      Alert.alert("Re-auth required", "Please sign out and sign back in, then try again.");
      setShowReauth(false);
      setReauthPassword("");
      return;
    }

    if (!reauthPassword) {
      Alert.alert("Password required", "Enter your password to confirm account deletion.");
      return;
    }

    setIsDeletingAccount(true);

    try {
      const cred = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, cred);
      setShowReauth(false);
      setReauthPassword("");
      await runAccountDeletion();
    } catch (err: any) {
      Alert.alert("Re-auth Failed", err?.message || "Could not verify your password.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require("../../logo.jpg")} style={styles.logoImage} />
          <View>
            <Text style={styles.title}>PromptVault AI</Text>
            <Text style={styles.tagline}>The Ultimate Prompt Engineer</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={fetchInitialCredits} style={styles.creditPill}>
            {isFetchingCredits ? (
              <ActivityIndicator size="small" color="#C084FC" />
            ) : (
              <Text style={styles.creditText}>⚡ {credits}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowAccountMenu(true)} style={styles.avatarButton}>
            <User color="#A78BFA" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.aiSelectorRow}>
          <TouchableOpacity
            style={[styles.aiTargetBtn, targetAI === "Midjourney" && styles.aiTargetBtnActive]}
            onPress={() => setTargetAI("Midjourney")}
          >
            <ImageIcon color={targetAI === "Midjourney" ? "#fff" : "#888899"} size={16} />
            <Text style={[styles.aiTargetText, targetAI === "Midjourney" && styles.aiTargetTextActive]}>
              Midjourney
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aiTargetBtn, targetAI === "ChatGPT" && styles.aiTargetBtnActive]}
            onPress={() => setTargetAI("ChatGPT")}
          >
            <MessageSquare color={targetAI === "ChatGPT" ? "#fff" : "#888899"} size={16} />
            <Text style={[styles.aiTargetText, targetAI === "ChatGPT" && styles.aiTargetTextActive]}>
              ChatGPT
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.promptInput}
          placeholder="Describe your idea..."
          placeholderTextColor="#888899"
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {quickStyles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[styles.quickStyleBtn, activeStyle === style && styles.quickStyleBtnActive]}
              onPress={() => setActiveStyle(style)}
            >
              <Paintbrush size={14} color={activeStyle === style ? "#fff" : "#A78BFA"} />
              <Text style={[styles.quickStyleText, activeStyle === style && styles.quickStyleTextActive]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={isLoading}>
          <LinearGradient colors={["#7C3AED", "#9333EA"]} style={styles.generateGradient}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>Generate Prompt</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {!!result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Your Result</Text>
            <Text style={styles.resultText}>{result}</Text>

            <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
              <Copy size={16} color="#fff" />
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showAccountMenu} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalAction} onPress={handleSignOut}>
              <LogOut size={18} color="#fff" />
              <Text style={styles.modalActionText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalAction} onPress={confirmDeleteAccount}>
              <Trash2 size={18} color="#ff6b6b" />
              <Text style={[styles.modalActionText, { color: "#ff6b6b" }]}>Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAccountMenu(false)}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showReauth} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.resultLabel}>Confirm Password</Text>
            <TextInput
              style={styles.promptInput}
              placeholder="Enter password"
              placeholderTextColor="#888899"
              value={reauthPassword}
              onChangeText={setReauthPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.generateBtn} onPress={reauthAndDelete} disabled={isDeletingAccount}>
              <LinearGradient colors={["#7C3AED", "#9333EA"]} style={styles.generateGradient}>
                {isDeletingAccount ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>Confirm Delete</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPaywall} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Sparkles size={28} color="#C084FC" />
            <Text style={styles.resultLabel}>Out of Credits</Text>
            <Text style={styles.resultText}>You need more credits to continue.</Text>
            <TouchableOpacity style={styles.closeSimpleBtn} onPress={() => setShowPaywall(false)}>
              <Text style={styles.closeSimpleBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F14", padding: 20, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImage: { width: 44, height: 44, borderRadius: 12 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  tagline: { color: "#A78BFA", fontSize: 12, marginTop: 2 },
  creditPill: {
    minWidth: 64,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  creditText: { color: "#C084FC", fontWeight: "800" },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  aiSelectorRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  aiTargetBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  aiTargetBtnActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  aiTargetText: { color: "#888899", fontWeight: "700" },
  aiTargetTextActive: { color: "#fff" },
  promptInput: {
    backgroundColor: "#1A1A24",
    color: "#fff",
    minHeight: 140,
    borderRadius: 18,
    padding: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#2A2A35",
    marginBottom: 16,
  },
  quickRow: { marginBottom: 16 },
  quickStyleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  quickStyleBtnActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  quickStyleText: { color: "#A78BFA", fontWeight: "700" },
  quickStyleTextActive: { color: "#fff" },
  generateBtn: { borderRadius: 18, overflow: "hidden", marginBottom: 18 },
  generateGradient: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  generateText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  resultCard: {
    backgroundColor: "#13131A",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  resultLabel: { color: "#fff", fontWeight: "800", fontSize: 18, marginBottom: 10 },
  resultText: { color: "#D1D5DB", lineHeight: 22 },
  copyBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    borderRadius: 12,
  },
  copyBtnText: { color: "#fff", fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#13131A", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#2A2A35" },
  modalAction: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14 },
  modalActionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  closeBtn: { marginTop: 10, alignSelf: "flex-end" },
  closeSimpleBtn: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#7C3AED",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeSimpleBtnText: { color: "#fff", fontWeight: "800" },
});