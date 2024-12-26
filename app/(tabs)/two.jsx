import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import {
  Plus,
  Wifi,
  ChevronRight,
  CircleGauge,
  Bell,
  HelpCircle,
  Info,
  ChefHat,
  ChartPie,
  AlarmClock,
  Globe,
} from 'lucide-react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Device Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Knob Management</Text>
          <Link href="/device-discovery" asChild>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Plus size={24} color="#2196F3" />
                <Text style={styles.settingItemText}>Add New Knob</Text>
              </View>
              <ChevronRight size={24} color="#666" />
            </TouchableOpacity>
          </Link>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <CircleGauge size={24} color="#2196F3" />
                <Text style={styles.settingItemText}>Manage knobs</Text>
              </View>
              <ChevronRight size={24} color="#666" />
            </TouchableOpacity>
          </Link>
          <Link href="/cooking-modes" asChild>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <ChefHat size={24} color="#2196F3" />
                <Text style={styles.settingItemText}>Cooking modes</Text>
              </View>
              <ChevronRight size={24} color="#666" />
            </TouchableOpacity>
          </Link>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <ChartPie size={24} color="#2196F3" />
                <Text style={styles.settingItemText}>Statistics</Text>
              </View>
              <ChevronRight size={24} color="#666" />
            </TouchableOpacity>
          </Link>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <AlarmClock size={24} color="#2196F3" />
                <Text style={styles.settingItemText}>Reminders</Text>
              </View>
              <ChevronRight size={24} color="#666" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* General Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Bell size={24} color="#2196F3" />
              <Text style={styles.settingItemText}>Notifications</Text>
            </View>
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Globe size={24} color="#2196F3" />
              <Text style={styles.settingItemText}>Language</Text>
            </View>
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Wifi size={24} color="#2196F3" />
              <Text style={styles.settingItemText}>Network Settings</Text>
            </View>
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <HelpCircle size={24} color="#2196F3" />
              <Text style={styles.settingItemText}>Help & Support</Text>
            </View>
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Info size={24} color="#2196F3" />
              <Text style={styles.settingItemText}>About</Text>
            </View>
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 80, // Extra padding to prevent content from being hidden behind the tabs
  },
  header: {
    marginTop: 20,
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
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;