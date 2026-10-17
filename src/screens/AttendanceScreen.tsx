import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.174.251.239:5000';

export default function AttendanceScreen({ navigation }: any) {
  const [courses, setCourses] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleAddCourse = () => {
    if (!newCourse.trim()) {
      Alert.alert('Notice', 'কোর্সের নাম লিখুন');
      return;
    }

    const formattedCourse = newCourse.trim();
    if (courses.includes(formattedCourse)) {
      Alert.alert('Notice', 'এই কোর্সটি আগেই যুক্ত করা হয়েছে');
      return;
    }

    setCourses((prevCourses) => [...prevCourses, formattedCourse]);
    setSelectedCourse(formattedCourse);
    setNewCourse('');
    Alert.alert('Success', 'নতুন কোর্স যুক্ত হয়েছে!');
  };

  const fetchAttendanceLogs = async (pageNum: number) => {
    if (loading || (!hasMore && pageNum !== 1)) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        navigation.replace('Auth');
        return;
      }

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
        // টোকেন ইনভ্যালিড বা মেয়াদ শেষ হলে অটোমেটিক লগইন স্ক্রিনে নিয়ে যাবে
        if (response.status === 401 || data.message?.includes('token')) {
          await AsyncStorage.removeItem('userToken');
          Alert.alert('Session Expired', 'Please login again.');
          navigation.replace('Auth');
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch logs');
        }
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
      {/* ১. নতুন কোর্স যুক্ত করার সেকশন */}
      <Text style={styles.label}>Add Custom Course:</Text>
      <View style={styles.addCourseContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Software Engineering"
          placeholderTextColor="#94a3b8"
          value={newCourse}
          onChangeText={setNewCourse}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddCourse}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* ২. ডাইনামিক ড্রপডাউন লিস্ট */}
      <Text style={styles.label}>Select Course (Dropdown):</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue) => setSelectedCourse(itemValue)}
          dropdownIconColor="#ffffff"
          style={styles.picker}
        >
          {courses.length === 0 ? (
            <Picker.Item label="-- No Course Added Yet --" value="" />
          ) : (
            courses.map((course, index) => (
              <Picker.Item key={index} label={course} value={course} />
            ))
          )}
        </Picker>
      </View>

      {/* ৩. Subject Details & Skip Predictor নেভিগেশন বাটন */}
      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => {
          if (!selectedCourse) {
            Alert.alert('Notice', 'অনুগ্রহ করে প্রথমে একটি কোর্স সিলেক্ট বা অ্যাড করুন');
            return;
          }
          navigation.navigate('SubjectDetail', { subjectName: selectedCourse });
        }}
      >
        <Text style={styles.detailBtnText}>
          View Subject Details & Skip Predictor
        </Text>
      </TouchableOpacity>

      {/* ৪. অটেনডেন্স হিস্ট্রি (Paginated) */}
      <Text style={styles.label}>Attendance History (Paginated):</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logText}>
              Subject: {item.subject || selectedCourse || 'N/A'}
            </Text>
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
  label: { color: '#94a3b8', fontSize: 15, marginBottom: 6, marginTop: 10 },
  addCourseContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  addBtnText: { color: '#ffffff', fontWeight: 'bold' },
  pickerContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  picker: { color: '#ffffff' },
  detailBtn: {
    backgroundColor: '#0369a1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  detailBtnText: { color: '#ffffff', fontWeight: 'bold' },
  logCard: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  logText: { color: '#ffffff', fontSize: 14, marginBottom: 2 },
  logStatus: { color: '#38bdf8', fontWeight: 'bold', marginTop: 4 },
});