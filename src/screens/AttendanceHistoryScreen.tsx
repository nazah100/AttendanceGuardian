import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface HistoryItem {
  _id: string;
  subjectId?: {
    name: string;
    code: string;
  };
  status: string;
  weight: number;
  date: string;
}

export default function AttendanceHistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://10.174.251.239:5000/api/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data);
      }
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const renderCard = ({ item }: { item: HistoryItem }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.subjectCode}>
            {item.subjectId?.code || 'CSE'} - {item.subjectId?.name || 'Subject'}
          </Text>
          <Text style={[styles.statusBadge, item.status === 'Present' ? styles.present : styles.absent]}>
            {item.status} (+{item.weight})
          </Text>
        </View>
        <Text style={styles.dateText}>📅 {formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Attendance History</Text>

      {loading ? (
        <ActivityIndicator color="#38BDF8" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
              tintColor="#38BDF8"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No attendance records found!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectCode: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  present: {
    backgroundColor: '#065F46',
    color: '#34D399',
  },
  absent: {
    backgroundColor: '#991B1B',
    color: '#F87171',
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 40,
  },
});