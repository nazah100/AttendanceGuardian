import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// ১. AsyncStorage ইম্পোর্ট করা হয়েছে
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.174.251.239:5000';

export default function AuthScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'সবগুলো ফিল্ড পূরণ করুন');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    const formattedRole = role === 'teacher' ? 'Teacher' : 'Student';

    const payload = isLogin
      ? { email, password }
      : { username: name, email, password, role: formattedRole };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // ২. লগইন সফল হলে টোকেনটি AsyncStorage-এ 'userToken' নামে সেভ করা হচ্ছে
          if (data.token) {
            await AsyncStorage.setItem('userToken', data.token);
          }
          
          navigation.replace('MainTabs', { user: data.user, token: data.token });
        } else {
          Alert.alert('Success', 'রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।');
          setIsLogin(true);
        }
      } else {
        const errorMessage = data.message || data.error || data.msg || JSON.stringify(data);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'সার্ভারে কানেক্ট করা যাচ্ছে না। IP ও Wi-Fi চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {!isLogin && (
          <>
            <Text style={styles.label}>Select Role:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'student' && styles.activeRoleBtn]}
                onPress={() => setRole('student')}
              >
                <Text style={[styles.roleText, role === 'student' && styles.activeRoleText]}>
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, role === 'teacher' && styles.activeRoleBtn]}
                onPress={() => setRole('teacher')}
              >
                <Text style={[styles.roleText, role === 'teacher' && styles.activeRoleText]}>
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.linkText}>
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#1e293b', color: '#ffffff', padding: 14, borderRadius: 8, marginBottom: 12 },
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 8, marginTop: 4 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
  activeRoleBtn: { backgroundColor: '#0284c7' },
  roleText: { color: '#cbd5e1', fontWeight: 'bold' },
  activeRoleText: { color: '#ffffff' },
  button: { backgroundColor: '#0284c7', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#38bdf8', marginTop: 16, textAlign: 'center' }
});