import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ আপনার ল্যাপটপের Local IP বসানো আছে নিশ্চিত করুন
const API_BASE_URL = 'http://192.168.10.168:5000/api/auth';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        Alert.alert('Session Expired', 'Please login again.');
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Auth');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    Alert.alert('Logged Out', 'You have been logged out successfully.');
    navigation.replace('Auth');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.username || 'User'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'Student'}</Text>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Alert.alert('Notice', 'Attendance module coming in Step 2!')}
          >
            <Text style={styles.primaryButtonText}>
              {user?.role === 'Teacher' ? 'Take Attendance' : 'Give Attendance'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  innerContainer: { flex: 1, padding: 24, justifyContent: 'space-between' },
  card: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 20,
  },
  welcomeText: { fontSize: 14, color: '#94A3B8' },
  nameText: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', marginVertical: 4 },
  emailText: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  actionContainer: { marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#CBD5E1', marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#0369A1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    height: 50,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});