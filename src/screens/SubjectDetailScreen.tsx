import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';

export default function SubjectDetailScreen({ route }: any) {
  const subjectName = route?.params?.subjectName || 'Select Subject';

  // Dynamic Attendance States (প্রাথমিক অবস্থায় ০ থাকবে)
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);

  // User Custom Input States
  const [inputTotal, setInputTotal] = useState('');
  const [inputAttended, setInputAttended] = useState('');

  // Weekday Routine States
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sunday', 'Tuesday']);
  const [classTime, setClassTime] = useState('10:00 AM');
  const [inputTime, setInputTime] = useState('');

  const currentPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
  const percentageIfSkip = totalClasses > 0 ? Math.round((attendedClasses / (totalClasses + 1)) * 100) : 0;

  // Safe Calculator Function to avoid Infinite Loop
  const calculateClassesToReachTarget = (targetPercent: number) => {
    if (totalClasses === 0) return 0;
    if ((attendedClasses / totalClasses) * 100 >= targetPercent) return 0;

    let addAttended = 0;
    while (
      ((attendedClasses + addAttended) / (totalClasses + addAttended)) * 100 < targetPercent &&
      addAttended < 100
    ) {
      addAttended++;
    }
    return addAttended;
  };

  const neededFor75 = calculateClassesToReachTarget(75);

  // User Dynamic Attendance Set Handler
  const handleSetAttendance = () => {
    const total = parseInt(inputTotal, 10);
    const attended = parseInt(inputAttended, 10);

    if (isNaN(total) || isNaN(attended)) {
      Alert.alert('Notice', 'অনুগ্রহ করে সঠিক সংখ্যা লিখুন');
      return;
    }

    if (attended > total) {
      Alert.alert('Error', 'Attended class, Total class-এর চেয়ে বেশি হতে পারে না!');
      return;
    }

    setTotalClasses(total);
    setAttendedClasses(attended);
    setInputTotal('');
    setInputAttended('');
    Alert.alert('Success', 'অ্যাটেনডেন্স সফলভাবে সেট করা হয়েছে!');
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSaveTime = () => {
    if (!inputTime.trim()) {
      Alert.alert('Notice', 'ক্লাসের সময় লিখুন');
      return;
    }
    setClassTime(inputTime.trim());
    setInputTime('');
    Alert.alert('Success', 'ক্লাসের সময় আপডেট করা হয়েছে!');
  };

  const handleSkipCheck = () => {
    Alert.alert(
      'Can I Skip Today?',
      `If you skip class today, your attendance will drop from ${currentPercentage}% to ${percentageIfSkip}%.`
    );
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Subject Card & Percentage */}
        <View style={styles.card}>
          <Text style={styles.subjectCode}>{subjectName}</Text>
          <Text style={styles.percentageText}>{currentPercentage}%</Text>
          <Text style={styles.subText}>Total: {totalClasses} | Attended: {attendedClasses}</Text>
        </View>

        {/* User Attendance Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Set Your Initial Attendance:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.numInput}
              placeholder="Total Classes"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={inputTotal}
              onChangeText={setInputTotal}
            />
            <TextInput
              style={styles.numInput}
              placeholder="Attended Classes"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={inputAttended}
              onChangeText={setInputAttended}
            />
            <TouchableOpacity style={styles.setBtn} onPress={handleSetAttendance}>
              <Text style={styles.setBtnText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Warning Box */}
        {totalClasses > 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Missing 1 class will drop your attendance to {percentageIfSkip}%!
            </Text>
          </View>
        )}

        {/* Dynamic Recovery Box */}
        {totalClasses > 0 && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              {neededFor75 > 0
                ? `✅ Attend ${neededFor75} more classes in a row to reach 75%!`
                : `🎉 Great! You are already at or above 75%!`}
            </Text>
          </View>
        )}

        {/* Weekly Routine Setup */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Set Weekly Routine:</Text>
          <Text style={styles.inputLabel}>Select Days:</Text>
          <View style={styles.dayContainer}>
            {weekDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Class Time (Current: {classTime}):</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.numInput}
              placeholder="e.g. 10:00 AM"
              placeholderTextColor="#94a3b8"
              value={inputTime}
              onChangeText={setInputTime}
            />
            <TouchableOpacity style={styles.setBtn} onPress={handleSaveTime}>
              <Text style={styles.setBtnText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Attendance Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.presentBtn}
            onPress={() => {
              setAttendedClasses((prev) => prev + 1);
              setTotalClasses((prev) => prev + 1);
            }}
          >
            <Text style={styles.btnText}>Mark Present (+1)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.absentBtn}
            onPress={() => setTotalClasses((prev) => prev + 1)}
          >
            <Text style={styles.btnText}>Mark Absent (+1)</Text>
          </TouchableOpacity>
        </View>

        {/* Skip Predictor Button */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkipCheck}>
          <Text style={styles.skipBtnText}>Can I skip today?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectCode: { color: '#94a3b8', fontSize: 18, fontWeight: '600' },
  percentageText: { color: '#ffffff', fontSize: 42, fontWeight: 'bold', marginVertical: 8 },
  subText: { color: '#64748b', fontSize: 14 },
  inputSection: { backgroundColor: '#1e293b', padding: 14, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  inputLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 8 },
  numInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  setBtn: {
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  setBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  warningBox: {
    backgroundColor: '#451a03',
    borderColor: '#78350f',
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  warningText: { color: '#fde047', fontSize: 14, fontWeight: '500' },
  successBox: {
    backgroundColor: '#064e3b',
    borderColor: '#065f46',
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  successText: { color: '#6ee7b7', fontSize: 14, fontWeight: '500' },
  dayContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayChipSelected: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  dayText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  dayTextSelected: { color: '#ffffff', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  presentBtn: { flex: 1, backgroundColor: '#16a34a', padding: 14, borderRadius: 8, marginRight: 6, alignItems: 'center' },
  absentBtn: { flex: 1, backgroundColor: '#dc2626', padding: 14, borderRadius: 8, marginLeft: 6, alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: 'bold' },
  skipBtn: {
    backgroundColor: '#0284c7',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  skipBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});