import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddSubjectScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('0'); // ১. ডাইনামিক স্টেট
  const [classTime, setClassTime] = useState('10:00 AM');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddSubject = async () => {
    if (!name || !code || !totalClasses) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const parsedTotal = Number(totalClasses) || 0;
    const parsedAttended = Number(attendedClasses) || 0;

    // Validation: Attended Class যেন Total Class এর চেয়ে বেশি না হয়
    if (parsedAttended > parsedTotal) {
      Alert.alert('Error', 'Attended classes cannot be greater than total classes!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://10.174.251.239:5000/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          code,
          totalClasses: parsedTotal,
          attendedClasses: parsedAttended, // ২. হ্যার্ডকোডেড 0 বাদ দিয়ে ডাইনামিক ভ্যালু পাস করা হয়েছে
          classTime,
          routineDays: selectedDays,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Subject added successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to add subject');
      }
    } catch (error) {
      console.log('Add Subject Error:', error);
      Alert.alert('Error', 'Network or Server error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Subject Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Computer Networks" placeholderTextColor="#64748B" value={name} onChangeText={setName} />

      <Text style={styles.label}>Subject Code</Text>
      <TextInput style={styles.input} placeholder="e.g. CSE510" placeholderTextColor="#64748B" value={code} onChangeText={setCode} />

      <Text style={styles.label}>Total Classes</Text>
      <TextInput style={styles.input} placeholder="e.g. 33" keyboardType="numeric" placeholderTextColor="#64748B" value={totalClasses} onChangeText={setTotalClasses} />

      {/* ৩. নতুন ইনপুট ফিল্ড যুক্ত করা হয়েছে */}
      <Text style={styles.label}>Attended Classes So Far</Text>
      <TextInput style={styles.input} placeholder="e.g. 0 or 15" keyboardType="numeric" placeholderTextColor="#64748B" value={attendedClasses} onChangeText={setAttendedClasses} />

      <Text style={styles.label}>Class Time</Text>
      <TextInput style={styles.input} placeholder="e.g. 10:00 AM" placeholderTextColor="#64748B" value={classTime} onChangeText={setClassTime} />

      <Text style={styles.label}>Select Class Days</Text>
      <View style={styles.daysContainer}>
        {daysList.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selectedDays.includes(day) && styles.selectedDayChip]}
            onPress={() => toggleDay(day)}
          >
            <Text style={[styles.dayText, selectedDays.includes(day) && styles.selectedDayText]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleAddSubject}>
        <Text style={styles.saveBtnText}>Save Subject</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0F172A', flexGrow: 1 },
  label: { color: '#F8FAFC', marginBottom: 6, fontWeight: 'bold' },
  input: { backgroundColor: '#1E293B', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dayChip: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  selectedDayChip: { backgroundColor: '#0284C7', borderColor: '#38BDF8' },
  dayText: { color: '#94A3B8', fontWeight: 'bold' },
  selectedDayText: { color: '#FFFFFF' },
  saveBtn: { backgroundColor: '#16A34A', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});