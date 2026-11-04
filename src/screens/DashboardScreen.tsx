import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface Subject {
  _id: string;
  id?: string;
  name: string;
  code: string;
  totalClasses: number;
  attendedClasses?: number;
}

export default function DashboardScreen({ navigation }: any) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
const response = await fetch('http://10.174.251.239:5000/api/subjects',
   {
          headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        if (Array.isArray(data)) {
          setSubjects(data);
        } else if (data.subjects && Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
        }
      }
    } catch (error) {
      console.log('Error fetching subjects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Screen-e back ashlei Auto-Refresh hbe
  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

  // Overall Stat Calculation
  const totalClassesSum = subjects.reduce((acc, curr) => acc + (curr.totalClasses || 0), 0);
  const attendedClassesSum = subjects.reduce((acc, curr) => acc + (curr.attendedClasses || 0), 0);
  const overallPercentage = totalClassesSum > 0 ? Math.round((attendedClassesSum / totalClassesSum) * 100) : 0;

  const renderSubjectCard = ({ item }: { item: Subject }) => {
    const attended = item.attendedClasses || 0;
    const total = item.totalClasses || 0;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.subjectCode}>{item.code}</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.statText}>Total: {total} | Attended: {attended}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Upper Overall Percentage & Stats Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Overall Attendance</Text>
        <Text style={styles.bannerPercentage}>{overallPercentage}%</Text>
        <Text style={styles.bannerSubtext}>
          Total Classes: {totalClassesSum} | Attended: {attendedClassesSum}
        </Text>
      </View>

      {/* Header and Add Subject Button */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Courses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSubject')}
        >
          <Text style={styles.addButtonText}>+ Add Subject</Text>
        </TouchableOpacity>
      </View>

      {/* Subject List */}
      {loading ? (
        <ActivityIndicator color="#38BDF8" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          renderItem={renderSubjectCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchSubjects(); }} 
              tintColor="#38BDF8"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No subjects added yet. Click + Add Subject above!</Text>
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
  banner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bannerTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerPercentage: {
    color: '#F8FAFC',
    fontSize: 42,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  bannerSubtext: {
    color: '#64748B',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
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
    marginBottom: 6,
  },
  subjectCode: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  percentageText: {
    color: '#34D399',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 14,
    marginBottom: 8,
  },
  statText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 30,
  },
});