// Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  Settings2, 
  Wifi,
  WifiOff,
  Battery,
  Plus,
  RefreshCcw,
  MapPin,
  AlertTriangle,
  ThermometerSun,
  Clock,
  BellRing,
  AlertCircle,
  Bell,
  CheckCircle,
  Download,
  CircleX,
  ShieldAlert,
  CircleGauge,
} from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

const Badge = ({ icon: Icon, label, value, color }) => (
  <View style={[styles.badge, { backgroundColor: color + '20' }]}>
    <Icon size={14} color={color} strokeWidth={2} />
    <Text style={[styles.badgeText, { color }]}>{value}</Text>
  </View>
);

const KnobCard = ({ knob }) => {
  return (
    <Link href={`/knob/${knob.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{knob.name}</Text>
          <View style={styles.headerBadges}>
            {knob.needsAttention && (
              <AlertTriangle size={16} color="#FF9800" strokeWidth={2} />
            )}
            {knob.allSet && (
              <CheckCircle size={16} color="#4CAF50" strokeWidth={2} />
            )}
            {knob.hasSchedule && (
              <Clock size={16} color="#9C27B0" strokeWidth={2} />
            )}
            {knob.hasAlerts && (
              <BellRing size={16} color="#E91E63" strokeWidth={2} />
            )}
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.temperatureContainer}>
            <CircleGauge size={36} color="#2196F3" strokeWidth={2} />
            <Text style={styles.temperature}>{knob.temperature}</Text>
            <Text style={styles.subtitleText}>Current Temperature</Text>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          <Badge 
            icon={Battery} 
            value={`${knob.battery}%`} 
            color={knob.battery > 20 ? '#4CAF50' : '#F44336'} 
          />
          <Badge 
            icon={knob.status === 'connected' ? Wifi : WifiOff} 
            value={knob.status === 'connected' ? 'Connected' : 'Offline'} 
            color={knob.status === 'connected' ? '#2196F3' : '#F44336'} 
          />
          <Badge 
            icon={MapPin} 
            value={knob.location} 
            color="#607D8B" 
          />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Settings2 size={16} color="#666" strokeWidth={2} />
            <Text style={styles.footerText}>v{knob.firmwareVersion}</Text>
          </View>
          <Text style={styles.lastUsed}>Last used: {knob.lastUsed}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const NotificationModal = ({ visible, onClose, notifications = [] }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      error: CircleX,
      warning: AlertCircle,
      success: CheckCircle,
      battery: Battery,
      update: Download,
      critical: ShieldAlert
    };
    return icons[type] || AlertCircle;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {notifications.length > 0 ? (
            <ScrollView style={styles.notificationList}>
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <View key={index} style={styles.notificationItem}>
                    <Icon 
                      size={24} 
                      color={notification.color}
                      strokeWidth={2}
                    />
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyNotifications}>
              <Text style={styles.emptyText}>No new notifications</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const Dashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      type: 'success',
      message: 'Successfully configured knob',
      time: '2 mins ago',
      icon: CheckCircle,
      color: '#4CAF50'
    },
    {
      type: 'error',
      message: 'Knob configuration failed',
      time: '5 mins ago',
      icon: CircleX,
      color: '#F44336'
    },
    {
      type: 'warning',
      message: 'Kitchen New Knob offline',
      time: '8 mins ago',
      icon: AlertCircle,
      color: '#FF9800'
    },
    {
      type: 'battery',
      message: 'Kitchen Knob battery below 15%',
      time: '13 mins ago',
      icon: Battery,
      color: '#E91E63'
    },
    {
      type: 'critical',
      message: 'Gas leakage detected',
      time: '34 mins ago',
      icon: ShieldAlert,
      color: '#E91E63'
    },
    {
      type: 'update',
      message: 'New firmware available v2.1.1',
      time: '1h ago',
      icon: Download,
      color: '#2196F3'
    }
  ]);
  const [isConnected, setIsConnected] = useState(true);
  const [knobs, setKnobs] = useState([
    {
      id: '1',
      name: 'Kitchen Knob',
      temperature: 'OFF',
      status: 'connected',
      battery: 85,
      location: 'Kitchen',
      firmwareVersion: '2.1.0',
      lastUsed: '2h ago',
      allSet: true,
      needsAttention: false,
      hasSchedule: true,
      hasAlerts: false,
    },
    {
      id: '2',
      name: 'Kitchen New',
      temperature: 'SIM',
      status: 'offline',
      battery: 15,
      location: 'Kitchen',
      firmwareVersion: '2.0.9',
      lastUsed: '1d ago',
      needsAttention: false,
      hasSchedule: false,
      hasAlerts: true,
    },
  ]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          'Network Error',
          'Please check your WiFi connection to control the knobs.',
          [{ text: 'OK' }]
        );
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Innovatronix</Text>
          <TouchableOpacity 
            onPress={() => setShowNotifications(true)}
            style={styles.bellButton}
          >
            <Bell size={24} color="#FFF" strokeWidth={2} />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Smart Knobs</Text>
      </View>

      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />

      <View style={styles.statusBar}>
      <View style={styles.statusItem}>
      <Wifi size={20} color="#4CAF50" strokeWidth={2} />
      <Text style={styles.statusText}>
            1/2 Online
          </Text>
      </View>
        {/*}<View style={styles.statusItem}>
          {isConnected ? (
            <Wifi size={20} color="#4CAF50" strokeWidth={2} />
          ) : (
            <WifiOff size={20} color="#F44336" strokeWidth={2} />
          )}
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Offline'}
          </Text>
        </View>{*/}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => Alert.alert('Fetching...', 'Discovering nearby knobs')}
        >
          <RefreshCcw size={20} color="#2196F3" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
      >
        {knobs.map((knob) => (
          <KnobCard key={knob.id} knob={knob} />
        ))}
      </ScrollView>

      <Link href="device-discovery" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus size={24} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: -15,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  syncButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    marginTop: 15,
  },
  gridContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    marginBottom: 15,
  },
  temperatureContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  temperature: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  lastUsed: {
    color: '#666',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bellButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  notificationList: {
    maxHeight: '100%',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyNotifications: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  }
});

export default Dashboard;