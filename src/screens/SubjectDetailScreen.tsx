import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SubjectDetailScreen({ route, navigation }: any) {
  const { subject } = route.params || {};

  const subjectId = subject?._id;
  const subjectCode = subject?.code || 'CSE510';
  const MIN_ATTENDANCE_TARGET = 75;

  // Dynamic States
  const [totalClasses, setTotalClasses] = useState<number>(subject?.totalClasses || 0);
  const [attendedClasses, setAttendedClasses] = useState<number>(subject?.attendedClasses || 0);

  // Editable Input States
  const [totalInput, setTotalInput] = useState<string>(String(subject?.totalClasses || 0));
  const [attendedInput, setAttendedInput] = useState<string>(String(subject?.attendedClasses || 0));

  const [durationMinutes, setDurationMinutes] = useState<string>(
    subject?.duration ? String(subject.duration) : '45'
  );

  const [selectedDays, setSelectedDays] = useState<string[]>(
    subject?.routineDays || ['Sun', 'Tue']
  );
  const [classTime, setClassTime] = useState<string>(subject?.classTime || '12:20 PM - 1:05 PM');
  const [loading, setLoading] = useState<boolean>(false);

  const daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate Attendance Weight
  const durationNum = parseInt(durationMinutes) || 45;
  const incrementValue = Math.round(durationNum / 45) || 1;

  // Day Toggle Handler
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Present Handler
  const handleMarkPresent = () => {
    navigation.navigate('Attendance', {
      subject: subjectCode,
      subjectId: subjectId,
      incrementValue: incrementValue,
      duration: durationNum,
    });
  };

  // Absent Handler
  const handleMarkAbsent = async () => {
    const newTotal = totalClasses + incrementValue;
    setTotalClasses(newTotal);
    setTotalInput(String(newTotal));

    if (subjectId) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        await fetch(`http://10.174.251.239:5000/api/subjects/update/${subjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            totalClasses: newTotal,
          }),
        });
      } catch (error) {
        console.log('Error updating absent count:', error);
      }
    }

    Alert.alert(
      'Marked Absent',
      `Class marked as Absent. Total classes increased by +${incrementValue} (${durationNum} mins period).`
    );
  };

  // Save Settings & Auto Back Handler
  const handleSaveRoutine = async () => {
    const parsedTotal = parseInt(totalInput) || 0;
    const parsedAttended = parseInt(attendedInput) || 0;

    if (parsedAttended > parsedTotal) {
      Alert.alert('Error', 'Attended classes cannot be greater than Total classes!');
      return;
    }

    setTotalClasses(parsedTotal);
    setAttendedClasses(parsedAttended);

    if (!subjectId) {
      Alert.alert('Success', 'Settings updated locally!');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch('http://10.174.251.239:5000/api/subjects/update/${subjectId}', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          totalClasses: parsedTotal,
          attendedClasses: parsedAttended,
          routineDays: selectedDays,
          classTime: classTime,
          duration: durationNum,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Settings updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update settings on server');
      }
    } catch (error) {
      console.log('Update Settings Error:', error);
      Alert.alert('Error', 'Network or server error');
    } finally {
      setLoading(false);
    }
  };

  // Attendance Calculations
  const currentPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  let neededClassesFor75 = 0;
  if (currentPercentage < MIN_ATTENDANCE_TARGET && totalClasses > 0) {
    neededClassesFor75 = Math.ceil(
      (MIN_ATTENDANCE_TARGET * totalClasses - 100 * attendedClasses) / (100 - MIN_ATTENDANCE_TARGET)
    );
    if (neededClassesFor75 < 0) neededClassesFor75 = 0;
  }

  const percentageIfSkipped = Math.round((attendedClasses / (totalClasses + incrementValue)) * 100);

  const handleCanISkipToday = () => {
    if (currentPercentage < MIN_ATTENDANCE_TARGET) {
      Alert.alert(
        '⚠️ Cannot Skip!',
        `Your current attendance is ${currentPercentage}%, which is below ${MIN_ATTENDANCE_TARGET}%.\n\nIf you skip today (${durationNum} mins), it will drop to ${percentageIfSkipped}%!`
      );
    } else {
      Alert.alert(
        '✅ Safe to Skip!',
        `Your attendance is ${currentPercentage}%. Skipping today will drop it to ${percentageIfSkipped}%, which is still fine.`
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Stat Banner */}
      <View style={styles.headerCard}>
        <Text style={styles.subjectCode}>{subjectCode}</Text>
        <Text style={styles.percentageText}>{currentPercentage}%</Text>
        <Text style={styles.subtext}>
          Total: {totalClasses} | Attended: {attendedClasses}
        </Text>
      </View>

      {/* Warnings & Targets */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ Missing 1 class period will drop your attendance to {percentageIfSkipped}%!
        </Text>
      </View>

      {neededClassesFor75 > 0 && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            🎯 Attend {neededClassesFor75} more classes in a row to reach {MIN_ATTENDANCE_TARGET}%!
          </Text>
        </View>
      )}

      {/* Edit Stats & Routine */}
      <View style={styles.routineSection}>
        <Text style={styles.sectionTitle}>Edit Stats & Routine Settings:</Text>

        <Text style={styles.inputLabel}>Total Classes:</Text>
        <TextInput
          style={styles.timeInput}
          keyboardType="numeric"
          value={totalInput}
          onChangeText={setTotalInput}
        />

        <Text style={styles.inputLabel}>Attended Classes:</Text>
        <TextInput
          style={styles.timeInput}
          keyboardType="numeric"
          value={attendedInput}
          onChangeText={setAttendedInput}
        />

        <Text style={styles.inputLabel}>Select Class Days:</Text>
        <View style={styles.daysRow}>
          {daysList.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, isSelected && styles.selectedDayChip]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Class Time (Text):</Text>
        <TextInput
          style={styles.timeInput}
          placeholder="e.g. 12:20 PM - 1:05 PM"
          placeholderTextColor="#64748B"
          value={classTime}
          onChangeText={setClassTime}
        />

        <Text style={styles.inputLabel}>Class Duration (in Minutes):</Text>
        <TextInput
          style={styles.timeInput}
          placeholder="e.g. 45 or 90"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
        />

        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>
            Attendance Count Weight: <Text style={styles.weightHighlight}>+{incrementValue}</Text> period(s)
          </Text>
        </View>

        <TouchableOpacity style={styles.setTimeBtn} onPress={handleSaveRoutine} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.setTimeBtnText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.presentBtn} onPress={handleMarkPresent}>
          <Text style={styles.btnText}>
            Mark Present (GPS Attendance) [+{incrementValue}]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.absentBtn} onPress={handleMarkAbsent}>
          <Text style={styles.btnText}>Mark Absent (+{incrementValue})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleCanISkipToday}>
          <Text style={styles.skipBtnText}>Can I skip today?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectCode: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageText: {
    color: '#F8FAFC',
    fontSize: 52,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  subtext: {
    color: '#64748B',
    fontSize: 13,
  },
  warningBox: {
    backgroundColor: '#451A03',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#78350F',
  },
  warningText: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#064E3B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#065F46',
  },
  successText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
  },
  routineSection: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 6,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  dayChip: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedDayChip: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  dayText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  timeInput: {
    backgroundColor: '#0F172A',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  weightBadge: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  weightText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  weightHighlight: {
    color: '#38BDF8',
    fontSize: 15,
  },
  setTimeBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  setTimeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  presentBtn: {
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  absentBtn: {
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  skipBtn: {
    backgroundColor: '#0284C7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  skipBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});