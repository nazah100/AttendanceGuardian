import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const API_BASE_URL = 'http://192.168.10.168:5000';

const TeacherDashboard = ({ user, token }) => {
  const [selectedCourse, setSelectedCourse] = useState('CSE101');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseCode: selectedCourse })
      });

      const data = await response.json();

      if (response.ok) {
        // QR Code-এর জন্য জেনারেট করা payload সেট
        setQrData(JSON.stringify(data.qrPayload));
      } else {
        Alert.alert('Error', data.message || 'Failed to generate QR Code');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        `Cannot connect to server at ${API_BASE_URL}. Ensure your mobile and PC are on the same Wi-Fi network.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, Prof. {user?.name || 'Teacher'}</Text>
        <Text style={styles.subText}>Role: Teacher</Text>
      </View>

      {/* Course Selection Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select Course for Attendance</Text>
        
        <View style={styles.courseRow}>
          {['CSE101', 'CSE102', 'CSE201'].map((course) => (
            <TouchableOpacity
              key={course}
              style={[
                styles.courseBtn,
                selectedCourse === course && styles.activeCourseBtn
              ]}
              onPress={() => {
                setSelectedCourse(course);
                setQrData(null); // Course চেঞ্জ করলে আগের QR ক্লিয়ার হবে
              }}
            >
              <Text
                style={[
                  styles.courseBtnText,
                  selectedCourse === course && styles.activeCourseBtnText
                ]}
              >
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate QR Button */}
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={generateQRCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.generateBtnText}>
              Generate QR Code ({selectedCourse})
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Display Generated QR Code */}
      {qrData && (
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Scan for {selectedCourse} Attendance</Text>
          <View style={styles.qrWrapper}>
            <QRCode value={qrData} size={220} />
          </View>
          <Text style={styles.timerText}>⏱️️ Valid for 5 minutes</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f172a'
  },
  header: {
    marginBottom: 20
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  subText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 14
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  courseBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center'
  },
  activeCourseBtn: {
    backgroundColor: '#0284c7'
  },
  courseBtnText: {
    color: '#cbd5e1',
    fontWeight: 'bold'
  },
  activeCourseBtnText: {
    color: '#ffffff'
  },
  generateBtn: {
    backgroundColor: '#0284c7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  generateBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15
  },
  qrCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  qrTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16
  },
  qrWrapper: {
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12
  },
  timerText: {
    color: '#f59e0b',
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600'
  }
});

export default TeacherDashboard;