import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform, 
  Alert, 
  Animated 
} from 'react-native';
import { Text } from '@/components/Themed'; // Adjust as needed for your project structure
import { RefreshCcw, WifiOff, Wifi, Settings } from 'lucide-react-native';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { useRouter, Stack } from 'expo-router';

const DeviceDiscoveryScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied.');
        return;
      }
      setHasPermissions(true);
      startScan();
    } catch (err) {
      setError('Failed to request permissions');
      console.error('Permission error:', err);
    }
  };

  const startScan = async () => {
    if (!hasPermissions) {
      Alert.alert('Permission Required', 'Please grant location permissions to scan for devices.');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setDevices([]); // Clear previous results

      const netInfo = await NetInfo.fetch();
      const connectedDevices = [
        {
          id: netInfo.details.bssid || 'N/A',
          name: netInfo.details.ssid || 'Unknown Network',
          signalStrength: netInfo.details.strength || 'N/A',
        },
      ];

      setDevices(connectedDevices);
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan for devices. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceClick = (device) => {
    router.push('/configure-knob');
  };

  return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Add New Knob' }} />
      {/*}<Header />{*/}
      {error && <ErrorMessage error={error} />}

      {isScanning ? (
        <LoadingIndicator />
      ) : devices.length > 0 ? (
        <DeviceList devices={devices} onDeviceClick={handleDeviceClick} />
      ) : (
        <EmptyState />
      )}

      <ScanButton isScanning={isScanning} onPress={startScan} />
    </View>
  );
};

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Discover Devices</Text>
  </View>
);

const ErrorMessage = ({ error }) => (
  <View style={styles.errorContainer}>
    <WifiOff size={24} color="#F44336" />
    <Text style={styles.errorText}>{error}</Text>
  </View>
);

const ScanButton = ({ isScanning, onPress }) => (
  <TouchableOpacity
    style={styles.refreshButton}
    onPress={onPress}
    disabled={isScanning}
  >
    <RefreshCcw size={20} color="white" />
    <Text style={styles.refreshButtonText}>
      {isScanning ? 'Scanning...' : 'Scan for Devices'}
    </Text>
  </TouchableOpacity>
);

const LoadingIndicator = () => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.scanningText}>Scanning for devices...</Text>
  </View>
);

const DeviceList = ({ devices, onDeviceClick }) => (
  <View style={styles.deviceList}>
    <Text style={styles.sectionTitle}>Available Devices</Text>
    {devices.map((device) => (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceItem}
        onPress={() => onDeviceClick(device)}
      >
        <View style={styles.deviceIcon}>
          <Wifi size={32} color="#2196F3" />
        </View>
        <View>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceDetails}>BSSID: {device.id}</Text>
          <Text style={styles.deviceDetails}>Signal: {device.signalStrength}</Text>
        </View>
        <Settings size={24} color="#757575" style={styles.settingsIcon} />
      </TouchableOpacity>
    ))}
  </View>
);

const EmptyState = () => (
  <View style={styles.noDevicesContainer}>
    <WifiOff size={64} color="#BDBDBD" />
    <Text style={styles.noDevicesText}>No devices found nearby.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  deviceList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceIcon: {
    marginRight: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceDetails: {
    fontSize: 14,
    color: '#666',
  },
  settingsIcon: {
    marginLeft: 'auto',
  },
  noDevicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDevicesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DeviceDiscoveryScreen;