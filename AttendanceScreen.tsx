import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.174.251.239:5000';

export default function AttendanceScreen() {
  const [selectedCourse, setSelectedCourse] = useState('CSE101');
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchAttendanceLogs = async (pageNum: number) => {
    if (loading || (!hasMore && pageNum !== 1)) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/history?page=${pageNum}&limit=10`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setLogs(data.logs || []);
        } else {
          setLogs((prev) => [...prev, ...(data.logs || [])]);
        }

        if (pageNum >= data.totalPages) {
          setHasMore(false);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch logs');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs(1);
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAttendanceLogs(nextPage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Select Course (Dropdown):</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue) => setSelectedCourse(itemValue)}
          dropdownIconColor="#ffffff"
          style={styles.picker}
        >
          <Picker.Item label="CSE 101 - Programming" value="CSE101" />
          <Picker.Item label="CSE 201 - Data Structures" value="CSE201" />
          <Picker.Item label="CSE 301 - Algorithms" value="CSE301" />
        </Picker>
      </View>

      <Text style={styles.label}>Attendance History (Paginated):</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logText}>Subject: {item.subject || selectedCourse}</Text>
            <Text style={styles.logText}>
              Student: {item.student?.username || item.student?.email || 'Student'}
            </Text>
            <Text style={styles.logText}>Date: {item.date}</Text>
            <Text style={styles.logStatus}>Status: {item.status || 'Present'}</Text>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#38bdf8" /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  label: { color: '#94a3b8', fontSize: 16, marginBottom: 8, marginTop: 12 },
  pickerContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  picker: { color: '#ffffff' },
  logCard: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  logText: { color: '#ffffff', fontSize: 14, marginBottom: 2 },
  logStatus: { color: '#38bdf8', fontWeight: 'bold', marginTop: 4 },
});