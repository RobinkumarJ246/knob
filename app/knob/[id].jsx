import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Leaf,
  ChefHat,
  Bell,
  Clock,
  Settings2,
  Battery,
  Wifi,
  WifiOff,
  MapPin,
  MoreHorizontal,
  Power,
  Flame
} from 'lucide-react-native';

// Mock data store with updated temperature controls
const MOCK_KNOBS = {
  '1': {
    id: '1',
    name: 'Kitchen Knob',
    location: 'Kitchen',
    currentStep: 'OFF',
    temperature: 0,
    targetStep: 'OFF',
    battery: 85,
    status: 'connected',
    signalStrength: -42,
    firmwareVersion: '2.1.0',
    lastUpdated: 'Just now',
    deviceId: 'INX_KB2401_2D86',
    cookingModes: ['SIM', 'MEDIUM', 'HIGH'],
    schedules: [
      { time: '07:00', step: 'MEDIUM' },
      { time: '18:00', step: 'HIGH' }
    ],
    ecoMode: true,
    requireConfirmation: true
  },
  '2': {
    id: '2',
    name: 'Kitchen New',
    location: 'Kitchen',
    currentStep: 'OFF',
    temperature: 0,
    targetStep: 'OFF',
    battery: 65,
    status: 'offline',
    signalStrength: -68,
    firmwareVersion: '2.0.9',
    lastUpdated: '5 hours ago',
    deviceId: 'INX_KB4173_A6G1',
    cookingModes: [],
    schedules: [],
    ecoMode: false,
    requireConfirmation: false
  },
  '3': {
    id: '3',
    name: 'Bedroom Knob',
    location: 'Master Bedroom',
    currentStep: 'MEDIUM',
    temperature: 120,
    targetStep: 'MEDIUM',
    battery: 92,
    status: 'connected',
    signalStrength: -55,
    firmwareVersion: '2.1.0',
    lastUpdated: '1 hour ago',
    deviceId: 'KNB-003-2024',
    cookingModes: ['SIM', 'MEDIUM'],
    schedules: [
      { time: '22:00', step: 'SIM' },
      { time: '06:00', step: 'MEDIUM' }
    ],
    ecoMode: true,
    requireConfirmation: true
  }
};

// Mock data fetching function
const getMockKnobData = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const knobData = MOCK_KNOBS[id];
      if (knobData) {
        resolve(knobData);
      } else {
        reject(new Error('Knob not found'));
      }
    }, 1000);
  });
};

// Update the KNOB_STEPS constant
const KNOB_STEPS = {
  OFF: { angle: 0, label: 'OFF', color: '#666', temperature: 0 },
  SIM: { angle: 60, label: 'SIM', color: '#FFA726', temperature: 60 },
  MEDIUM: { angle: 120, label: 'MEDIUM', color: '#FB8C00', temperature: 120 },
  HIGH: { angle: 180, label: 'HIGH', color: '#F4511E', temperature: 200 }
};

// Updated KnobControl Component
const KnobControl = ({ 
  value,
  onChange,
  isOn,
  requireConfirmation
}) => {
  const { width } = Dimensions.get('window');
  const knobSize = width * 0.8;
  const center = { x: knobSize / 2, y: knobSize / 2 };
  
  const [currentStep, setCurrentStep] = useState(value);
  const [pendingStep, setPendingStep] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const rotateValue = useRef(new Animated.Value(KNOB_STEPS[value].angle)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const lastRotation = useRef(KNOB_STEPS[value].angle);
  const startRotation = useRef(0);

  useEffect(() => {
    setCurrentStep(value);
    Animated.spring(rotateValue, {
      toValue: KNOB_STEPS[value].angle,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const getNearestStep = (angle) => {
    return Object.entries(KNOB_STEPS).reduce((nearest, [step, config]) => {
      const diff = Math.abs(angle - config.angle);
      return diff < Math.abs(angle - KNOB_STEPS[nearest].angle) ? step : nearest;
    }, 'OFF');
  };

  const snapToStep = (step) => {
    Animated.spring(rotateValue, {
      toValue: KNOB_STEPS[step].angle,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start(() => {
      if (requireConfirmation) {
        setPendingStep(step);
        setShowConfirm(true);
      } else {
        setCurrentStep(step);
        onChange(step);
      }
    });
  };

  const handleConfirm = () => {
    if (pendingStep) {
      setCurrentStep(pendingStep);
      onChange(pendingStep);
      setShowConfirm(false);
      setPendingStep(null);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isOn,
      onPanResponderGrant: () => {
        startRotation.current = rotateValue._value;
        Animated.spring(scaleValue, {
          toValue: 1.1,
          tension: 40,
          friction: 3,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (event, gestureState) => {
        if (!isOn) return;
        
        const { moveX, moveY } = gestureState;
        const deltaX = moveX - center.x;
        const deltaY = moveY - center.y;
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        angle = angle < -90 ? -90 : angle > 90 ? 90 : angle;
        angle = angle + 90;
        
        rotateValue.setValue(angle);
      },
      onPanResponderRelease: () => {
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 60,
          friction: 50,
          useNativeDriver: true,
        }).start();
        
        const nearestStep = getNearestStep(rotateValue._value);
        snapToStep(nearestStep);
      },
    })
  ).current;

  const rotate = rotateValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  // Separate position calculations for ticks and labels
  const getTickPosition = (angle) => {
    const radius = (knobSize * 0.36); // Keeps ticks close to knob
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      left: center.x + radius * Math.cos(radian),
      top: center.y + radius * Math.sin(radian)
    };
  };

  const getLabelPosition = (angle) => {
    const radius = (knobSize * 0.45) + 25; // Moves labels further out
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      left: center.x + radius * Math.cos(radian),
      top: center.y + radius * Math.sin(radian)
    };
  };

  return (
    <View style={[styles.knobContainer, { width: knobSize, height: knobSize }]}>
      {/* Tick marks - closer to knob */}
      {Object.entries(KNOB_STEPS).map(([step, config]) => {
        const position = getTickPosition(config.angle);
        return (
          <View key={`tick-${step}`} style={[
            styles.tickMark,
            {
              left: position.left,
              top: position.top,
              backgroundColor: config.color,
              transform: [{ rotate: `${config.angle}deg` }]
            }
          ]} />
        );
      })}

      {/* Labels - further away */}
      {Object.entries(KNOB_STEPS).map(([step, config]) => {
        const position = getLabelPosition(config.angle);
        return (
          <View
            key={step}
            style={[
              styles.stepLabel,
              {
                left: position.left - 25,
                top: position.top - 10,
              }
            ]}
          >
            <Text style={[styles.stepText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        );
      })}

      {/* Main knob */}
      <Animated.View
        style={[
          styles.knob,
          {
            width: knobSize * 0.6,
            height: knobSize * 0.6,
            transform: [
              { rotate },
              { scale: scaleValue }
            ],
            opacity: isOn ? 1 : 0.5,
          },
        ]}
        {...(isOn ? panResponder.panHandlers : {})}
      >
        <View style={[styles.knobGrip, { height: knobSize * 0.3 }]} />
      </Animated.View>

      {/* Confirmation button */}
      {showConfirm && requireConfirmation && isOn && (
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: KNOB_STEPS[pendingStep].color }
          ]}
          onPress={handleConfirm}
        >
          <Flame size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Power Button Component
const PowerButton = ({ isOn, onToggle, size = 40 }) => {
  const fadeAnim = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOn ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOn]);

  return (
    <TouchableOpacity 
      onPress={onToggle}
      style={[
        styles.powerButton,
        { width: size, height: size, borderRadius: size / 2 },
        { backgroundColor: isOn ? '#4CAF50' : '#F44336' }
      ]}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Power size={size * 0.6} color="#FFF" strokeWidth={2} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ icon: Icon, title, subtitle, color, onPress, disabled }) => (
  <TouchableOpacity 
    style={[
      styles.actionCard, 
      { borderLeftColor: color },
      disabled && styles.actionCardDisabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Icon size={24} color={disabled ? '#ccc' : color} strokeWidth={2} />
    <Text style={[styles.actionTitle, disabled && styles.actionTitleDisabled]}>{title}</Text>
    <Text style={[styles.actionSubtitle, disabled && styles.actionSubtitleDisabled]}>{subtitle}</Text>
  </TouchableOpacity>
);

// Status Card Component
const StatusCard = ({ battery, isOn, location, onPowerToggle }) => (
  <View style={styles.statusCard}>
    <View style={styles.statusRow}>
      <View style={styles.statusGroup}>
        <View style={styles.statusItem}>
          <Battery 
            size={20} 
            color={battery > 20 ? '#4CAF50' : '#F44336'} 
            strokeWidth={2} 
          />
          <Text style={styles.statusText}>{battery}% Battery</Text>
        </View>
        
        <View style={styles.statusItem}>
          {isOn ? (
            <Wifi size={20} color="#2196F3" strokeWidth={2} />
          ) : (
            <WifiOff size={20} color="#F44336" strokeWidth={2} />
          )}
          <Text style={styles.statusText}>{isOn ? 'Connected' : 'Offline'}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <MapPin size={20} color="#607D8B" strokeWidth={2} />
          <Text style={styles.statusText}>{location}</Text>
        </View>
      </View>

      <View style={styles.powerWrapper}>
        <PowerButton 
          isOn={isOn} 
          onToggle={onPowerToggle} 
          size={36}
        />
        <Text style={styles.powerText}>{isOn ? 'ON' : 'OFF'}</Text>
      </View>
    </View>
  </View>
);

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.loadingText}>Loading knob data...</Text>
  </View>
);

// Main KnobDetail Component
const KnobDetail = () => {
  const { id } = useLocalSearchParams();
  const [knobData, setKnobData] = useState(null);
  const [currentStep, setCurrentStep] = useState('OFF');
  const [showAllActions, setShowAllActions] = useState(false);
  const [isOn, setIsOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMockKnobData(id);
        setKnobData(data);
        setCurrentStep(data.currentStep);
        setIsOn(data.status === 'connected');
      } catch (error) {
        console.error('Error loading knob data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handlePowerToggle = () => {
    setIsOn(!isOn);
    if (knobData) {
      setKnobData({
        ...knobData,
        status: !isOn ? 'connected' : 'offline'
      });
    }
  };

  const handleStepChange = (newStep) => {
    if (isOn) {
      setCurrentStep(newStep);
      if (knobData) {
        setKnobData({
          ...knobData,
          currentStep: newStep,
          temperature: KNOB_STEPS[newStep].temperature
        });
      }
    }
  };

  const quickActions = knobData ? [
    {
      icon: Leaf,
      title: 'Eco Mode',
      subtitle: knobData.ecoMode ? 'Active' : 'Inactive',
      color: '#4CAF50',
      disabled: !isOn,
    },
    {
      icon: ChefHat,
      title: 'Cooking Modes',
      subtitle: `${knobData.cookingModes.length} modes`,
      color: '#FF9800',
      disabled: !isOn || knobData.cookingModes.length === 0,
    },
    {
      icon: Bell,
      title: 'Ping Knob',
      subtitle: isOn ? 'Available' : 'Offline',
      color: '#2196F3',
      disabled: !isOn,
    },
    {
      icon: Clock,
      title: 'Schedule',
      subtitle: `${knobData.schedules.length} active`,
      color: '#9C27B0',
      disabled: !isOn,
    },
  ] : [];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!knobData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Knob not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayedActions = showAllActions 
    ? quickActions 
    : quickActions.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{knobData.name}</Text>
          <Text style={styles.headerSubtitle}>{knobData.location}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <MoreHorizontal size={24} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} bounces={false}>
        <StatusCard
          battery={knobData.battery}
          isOn={isOn}
          location={knobData.location}
          onPowerToggle={handlePowerToggle}
        />

        <View style={styles.knobSection}>
          <Text style={styles.sectionTitle}>Knob Control</Text>
          <KnobControl 
            value={currentStep}
            onChange={handleStepChange}
            isOn={isOn}
            requireConfirmation={knobData.requireConfirmation}
          />
          <View style={styles.temperatureInfo}>
            {/*}<Text style={styles.currentTemp}>{*/}
              {/*}{KNOB_STEPS[currentStep].temperature}°{*/}
            <Text style={[styles.currentStep, { color: isOn ? KNOB_STEPS[currentStep].color : '#999' }]}>
              {KNOB_STEPS[currentStep].label}
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {quickActions.length > 4 && (
              <TouchableOpacity onPress={() => setShowAllActions(!showAllActions)}>
                <Text style={styles.showMoreText}>
                  {showAllActions ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.actionGrid}>
            {displayedActions.map((action, index) => (
              <QuickActionCard
                key={index}
                icon={action.icon}
                title={action.title}
                subtitle={action.subtitle}
                color={action.color}
                disabled={action.disabled}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Device Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Device ID</Text>
              <Text style={styles.detailValue}>{knobData.deviceId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Firmware Version</Text>
              <Text style={styles.detailValue}>v{knobData.firmwareVersion}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>{knobData.lastUpdated}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Signal Strength</Text>
              <Text style={styles.detailValue}>{knobData.signalStrength} dBm</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confirm Changes</Text>
              <Text style={styles.detailValue}>
                {knobData.requireConfirmation ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
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
  header: {
    backgroundColor: '#1976D2',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusGroup: {
    flex: 1,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  knobSection: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },

  stepMarkers: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  stepMark: {
    position: 'absolute',
    width: 40,
    height: 2,
    left: '50%',
    top: '50%',
    marginTop: -1,
  },

  temperatureInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  currentTemp: {
    fontSize: 16,
    color: '#666',
  },
  currentStep: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsSection: {
    margin: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  showMoreText: {
    color: '#2196F3',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    borderLeftWidth: 3,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionTitleDisabled: {
    color: '#999',
  },
  actionSubtitleDisabled: {
    color: '#999',
  },
  detailsSection: {
    margin: 15,
  },
  detailCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  powerWrapper: {
    alignItems: 'center',
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  powerText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  powerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  knobContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  knob: {
    backgroundColor: '#E0E0E0',
    borderRadius: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5.84,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 12,
    borderColor: '#BDBDBD',
  },
  knobGrip: {
    width: 6,
    backgroundColor: '#424242',
    borderRadius: 3,
    transform: [{ translateY: -20 }],
  },
  tickMark: {
    position: 'absolute',
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  stepLabel: {
    position: 'absolute',
    width: 50,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    position: 'absolute',
    bottom: -85,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4511E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

export default KnobDetail;