import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isWithinCampus } from '../utils/geofence';

interface Subject {
  _id: string;
  name: string;
  code: string;
  duration?: number;
}

export default function AttendanceScreen({ route, navigation }: any) {
  const params = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(params.subjectId || '');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchSubjects();
    getCurrentLocation();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://10.174.251.239:5000/api/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSubjects(data);
        if (data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(data[0]._id);
        }
      }
    } catch (error) {
      console.log('Error fetching subjects:', error);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const handleMarkAttendance = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Error', 'Please select a subject first!');
      return;
    }

    if (!userLocation) {
      Alert.alert('Error', 'Fetching live GPS location. Please try again.');
      getCurrentLocation();
      return;
    }

    // Geofencing Check
    const inCampus = isWithinCampus(userLocation.latitude, userLocation.longitude);
    if (!inCampus) {
      Alert.alert('Out of Range', 'You are outside the campus boundary!');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://10.174.251.239:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId: selectedSubjectId, // ID পাঠানো হচ্ছে
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          duration: params.duration || 45,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert('Success 🎉', data.message || 'Attendance marked successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('AttendanceHistory') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Server or Network Error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📍 Automatic GPS Attendance</Text>

      <Text style={styles.label}>Select Subject / Course:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSubjectId}
          onValueChange={(itemValue) => setSelectedSubjectId(itemValue)}
          dropdownIconColor="#38BDF8"
          style={{ color: '#FFFFFF' }}
        >
          {subjects.length > 0 ? (
            subjects.map((sub) => (
              <Picker.Item key={sub._id} label={`${sub.name} (${sub.code})`} value={sub._id} />
            ))
          ) : (
            <Picker.Item label="No Subjects Found" value="" />
          )}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleMarkAttendance}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Mark Attendance</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 25,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0284C7',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});