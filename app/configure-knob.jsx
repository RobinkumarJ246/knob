import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ConfigureKnobScreen = () => {
  const { deviceId, macAddress } = useLocalSearchParams();
  const [knobName, setKnobName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = async () => {
    if (!knobName.trim()) {
      Alert.alert('Error', 'Please enter a name for the knob');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert('Success', 'Knob configured successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]);
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to configure knob. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add a New Knob' }} />

      {/* Device Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Details</Text>
        <View style={styles.deviceDetails}>
          <MaterialIcons name="devices" size={32} color="#2196F3" />
          <View style={styles.deviceInfo}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={styles.deviceText}>{deviceId || 'INX_KNOB2401'}</Text>
            <Text style={styles.label}>MAC Address</Text>
            <Text style={styles.deviceText}>{macAddress || '00:1b:63:84:45:e6'}</Text>
          </View>
        </View>
      </View>

      {/* Knob Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Knob Configuration</Text>
        <TextInput
          style={styles.input}
          value={knobName}
          onChangeText={setKnobName}
          placeholder="Enter a name for this knob"
          placeholderTextColor="#999"
          autoFocus
          maxLength={30}
        />
        <Text style={styles.helperText}>
          This name will be displayed on your dashboard.
        </Text>
        <Text style={styles.helperSubText}>
          You can always change this in the app settings.
        </Text>
        <TextInput
          style={styles.input}
          value={knobName}
          onChangeText={setKnobName}
          placeholder="Where is this knob fixed?"
          placeholderTextColor="#999"
          autoFocus
          maxLength={30}
        />
      </View>

      {/* Action Buttons Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!knobName || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveConfig}
          disabled={!knobName || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {
    marginLeft: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  deviceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  helperText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  helperSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfigureKnobScreen;