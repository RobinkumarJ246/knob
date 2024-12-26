import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, PanResponder } from 'react-native';
import { Text } from '@/components/Themed';
import Svg, { Circle, Path } from 'react-native-svg';

const TemperatureKnob = ({
  value,
  onChange,
  min = 10,
  max = 30,
  size = 150,
  activeColor = "#2196F3",
  inactiveColor = "#E0E0E0"
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const lastAngle = useRef(0);
  const lastValue = useRef(value);

  const radius = (size / 2) - 16;
  const centerX = size / 2;
  const centerY = size / 2;

  const tempToAngle = (temp) => {
    return ((temp - min) / (max - min)) * 300 + 30;
  };

  const angleToTemp = (angle) => {
    const normalizedAngle = angle < 30 ? 30 : angle > 330 ? 330 : angle;
    return Math.round(((normalizedAngle - 30) / 300) * (max - min) + min);
  };

  const calculateKnobPosition = (angle) => {
    const a = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(a)),
      y: centerY + (radius * Math.sin(a))
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastAngle.current = tempToAngle(value);
      },
      onPanResponderMove: (_, gestureState) => {
        const { moveX, moveY } = gestureState;
        const dx = moveX - centerX;
        const dy = moveY - centerY;
        
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        if (angle >= 30 && angle <= 330) {
          const newTemp = angleToTemp(angle);
          if (newTemp !== lastValue.current) {
            const pos = calculateKnobPosition(angle);
            pan.setValue({ x: pos.x - centerX, y: pos.y - centerY });
            lastAngle.current = angle;
            lastValue.current = newTemp;
            onChange(newTemp);
          }
        }
      },
    })
  ).current;

  useEffect(() => {
    const angle = tempToAngle(value);
    const pos = calculateKnobPosition(angle);
    pan.setValue({ x: pos.x - centerX, y: pos.y - centerY });
  }, [value]);

  const angle = tempToAngle(value);
  const knobPosition = calculateKnobPosition(angle);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View {...panResponder.panHandlers}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={inactiveColor}
            strokeWidth="3"
            fill="none"
            strokeDasharray="4,4"
          />
          
          {/* Line to knob */}
          <Path
            d={`M${centerX},${centerY} L${knobPosition.x},${knobPosition.y}`}
            stroke={activeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Svg>
        
        {/* Animated Knob */}
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y }
              ]
            }
          ]}
        >
          <View style={[styles.knobInner, { backgroundColor: activeColor }]} />
        </Animated.View>
      </View>

      <View style={styles.temperatureDisplay}>
        <Text style={styles.temperatureText}>{value}°</Text>
        <Text style={styles.temperatureUnit}>C</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  knobInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'white',
  },
  temperatureDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperatureText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  temperatureUnit: {
    fontSize: 14,
    color: '#666666',
    marginTop: -5,
  },
});

export default TemperatureKnob;