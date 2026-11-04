import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.174.251.239:5000'; // আপনার লিনাক্স পিসির সঠিক লোকাল আইপি এখানে বসাবেন

export default function DocumentUploadScreen() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  // File Selector
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  // Upload Handler
  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Notice', 'Please select a document or image first.');
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      const formData = new FormData();
      formData.append('document', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'image/jpeg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/attendance/upload-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          // ⚠️ 'Content-Type': 'multipart/form-data' বাদ দেওয়া হয়েছে, fetch নিজে থেকে বাউন্ডারি হ্যান্ডেল করবে
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success 🎉', 'Medical Certificate / Document uploaded successfully!');
        setSelectedFile(null);
      } else {
        Alert.alert('Upload Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Upload Error Details:', error);
      Alert.alert('Error', 'Server connection error during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📄 Upload Leave & Absence Document</Text>
        <Text style={styles.subtitle}>Upload Medical Certificate, Application, or PDF</Text>

        <TouchableOpacity style={styles.pickBtn} onPress={handlePickDocument}>
          <Text style={styles.pickBtnText}>
            {selectedFile ? 'Change File' : 'Choose Document / Image'}
          </Text>
        </TouchableOpacity>

        {selectedFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>Selected: {selectedFile.name}</Text>
            {selectedFile.size && (
              <Text style={styles.fileSize}>
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.uploadBtn, (!selectedFile || uploading) && styles.disabledBtn]}
          onPress={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.uploadBtnText}>Upload Document</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  pickBtn: { backgroundColor: '#334155', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  pickBtnText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 14 },
  fileInfo: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, marginBottom: 16 },
  fileName: { color: '#f8fafc', fontSize: 13, fontWeight: '500' },
  fileSize: { color: '#64748b', fontSize: 12, marginTop: 4 },
  uploadBtn: { backgroundColor: '#0284c7', padding: 16, borderRadius: 10, alignItems: 'center' },
  disabledBtn: { opacity: 0.5 },
  uploadBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
});