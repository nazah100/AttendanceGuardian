import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

export default function SubjectDetailScreen({ route }: any) {
const subjectName = route?.params?.subjectName || 'Select Subject';

  // Dynamic Attendance Calculation States
  const [totalClasses, setTotalClasses] = useState(25);
  const [attendedClasses, setAttendedClasses] = useState(18);

  // Weekday Routine State (Selected days for classes)
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sunday', 'Tuesday', 'Thursday']);

  const currentPercentage = Math.round((attendedClasses / totalClasses) * 100);

  // Predictor Calculations
  const percentageIfSkip = Math.round((attendedClasses / (totalClasses + 1)) * 100);

  // Calculate how many consecutive classes needed to reach 75%
  const calculateClassesToReachTarget = (targetPercent: number) => {
    let addAttended = 0;
    while (((attendedClasses + addAttended) / (totalClasses + addAttended)) * 100 < targetPercent) {
      addAttended++;
    }
    return addAttended;
  };

  const neededFor75 = calculateClassesToReachTarget(75);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSkipCheck = () => {
    Alert.alert(
      'Can I Skip Today?',
      `If you skip class today, your attendance will drop from  ${currentPercentage}% to ${percentageIfSkip}% .`
    );
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Subject Card & Percentage */}
        <View style={styles.card}>
          <Text style={styles.subjectCode}>{subjectName}</Text>
          <Text style={styles.percentageText}>{currentPercentage}%</Text>
          <Text style={styles.subText}>Total: {totalClasses} | Attended: {attendedClasses}</Text>
        </View>

        {/* Dynamic Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Missing 1 class will drop your attendance to {percentageIfSkip}%!
          </Text>
        </View>

        {/* Dynamic Positive/Recovery Box */}
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✅ Attend {neededFor75} more classes in a row to reach 75%!
          </Text>
        </View>

        {/* Weekday Routine Tracker Section */}
        <View style={styles.routineSection}>
          <Text style={styles.sectionTitle}>Class Days (Weekly Routine):</Text>
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
        </View>

        {/* This Week's Schedule Log */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>This Week's Classes:</Text>
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>Sun, Class 1</Text>
            <Text style={[styles.badge, styles.badgePresent]}>Present</Text>
          </View>
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>Tue, Class 2</Text>
            <Text style={[styles.badge, styles.badgeAbsent]}>Absent</Text>
          </View>
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>Thu, Class 3</Text>
            <Text style={[styles.badge, styles.badgeUpcoming]}>Upcoming</Text>
          </View>
        </View>

        {/* Interactive Attendance Buttons */}
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

        {/* "Can I Skip Today?" Button */}
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
  routineSection: { marginBottom: 16 },
  sectionTitle: { color: '#cbd5e1', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  dayContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayChipSelected: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  dayText: { color: '#94a3b8', fontWeight: '500' },
  dayTextSelected: { color: '#ffffff', fontWeight: 'bold' },
  scheduleSection: { marginBottom: 16 },
  scheduleCard: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleDay: { color: '#f8fafc', fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  badgePresent: { backgroundColor: '#166534', color: '#4ade80' },
  badgeAbsent: { backgroundColor: '#991b1b', color: '#fca5a5' },
  badgeUpcoming: { backgroundColor: '#1e3a8a', color: '#93c5fd' },
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