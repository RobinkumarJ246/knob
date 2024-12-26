import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
  Share,
} from 'react-native';
import {
  Clock,
  Plus,
  ChefHat,
  Flame,
  Edit2,
  Trash2,
  X,
  Save,
  Copy,
  Share2,
  ArrowLeft,
} from 'lucide-react-native';
import { Stack } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2;

// Predefined cooking modes with more details
const DEFAULT_MODES = [
  {
    id: '1',
    name: 'Boil Water',
    description: 'The simplest mode to just boil water',
    image: 'https://peasi.com/hubfs/Imported_Blog_Media/Roiling-Boil-2.jpg',
    steps: [
      { duration: 1800, heatLevel: 9, description: 'Heat at maximum' }
    ],
    tags: ['Basic', 'Quick']
  },
  {
    id: '2',
    name: 'Boil Milk',
    description: 'Controlled heating to prevent overflow',
    image: 'https://t4.ftcdn.net/jpg/03/35/50/11/360_F_335501121_UwnGmbk30RsVDX46pK8QUxZ2iRyKnBv8.jpg',
    steps: [
      { duration: 180, heatLevel: 9, description: 'Initial boiling' },
      { duration: 120, heatLevel: 5, description: 'Medium heat' },
      { duration: 300, heatLevel: 2, description: 'Low heat simmer' }
    ],
    tags: ['Daily', 'Precise']
  },
  {
    id: '3',
    name: 'Rice Cooking',
    description: 'Perfect fluffy rice every time',
    image: 'https://cdn.sanity.io/images/2r0kdewr/production/df402b157973418b5c6bb33be6d9f695e0f46d20-500x375.jpg',
    steps: [
      { duration: 600, heatLevel: 8, description: 'Initial boiling' },
      { duration: 900, heatLevel: 4, description: 'Simmer' },
      { duration: 300, heatLevel: 0, description: 'Rest' }
    ],
    tags: ['Food', 'Controlled']
  }
];

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};

const CookingModesPage = () => {
  const [modes, setModes] = useState(DEFAULT_MODES);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newMode, setNewMode] = useState({
    name: '',
    description: '',
    steps: [],
    tags: []
  });
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState({
    duration: '',
    heatLevel: '',
    description: ''
  });

  const [timeUnit, setTimeUnit] = useState('minutes');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // Add these helper functions inside the component:
  const convertToSeconds = (h, m, s) => {
    return (parseInt(h || '0') * 3600) + (parseInt(m || '0') * 60) + parseInt(s || '0');
  };
  
  const convertFromSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };
  
  const addTag = () => {
    if (newTag.trim() && !newMode.tags.includes(newTag.trim())) {
      setNewMode({
        ...newMode,
        tags: [...newMode.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setNewMode({
      ...newMode,
      tags: newMode.tags.filter(tag => tag !== tagToRemove)
    });
  };  

  const shareMode = async (mode) => {
    try {
      const message = `Cooking Mode: ${mode.name}\n\n${mode.description}\n\nSteps:\n${
        mode.steps.map((step, index) => 
          `${index + 1}. ${formatDuration(step.duration)} at level ${step.heatLevel}: ${step.description}`
        ).join('\n')
      }`;
      await Share.share({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const duplicateMode = (mode) => {
    const newModeData = {
      ...mode,
      id: Date.now().toString(),
      name: `${mode.name} (Copy)`,
    };
    setModes([...modes, newModeData]);
  };

  const renderModeCard = (mode) => (
    <TouchableOpacity 
      key={mode.id} 
      style={styles.modeCard}
      onPress={() => {
        setSelectedMode(mode);
        setDetailModalVisible(true);
      }}
    >
      <Image
        source={{ uri: mode.image }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{mode.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {mode.description}
        </Text>
        <View style={styles.tagsContainer}>
          {mode.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cardMetrics}>
          <View style={styles.metric}>
            <Clock size={14} color="#4A90E2" />
            <Text style={styles.metricText}>
              {formatDuration(mode.steps.reduce((acc, step) => acc + parseInt(step.duration), 0))}
            </Text>
          </View>
          <View style={styles.metric}>
            <Flame size={14} color="#FF6B6B" />
            <Text style={styles.metricText}>
              {Math.max(...mode.steps.map(step => step.heatLevel))}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={detailModalVisible}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.detailContainer}>
        <ScrollView>
          <Image
            source={{ uri: selectedMode?.image }}
            style={styles.detailImage}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setDetailModalVisible(false)}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{selectedMode?.name}</Text>
            <Text style={styles.detailDescription}>{selectedMode?.description}</Text>
            
            <View style={styles.tagsContainer}>
              {selectedMode?.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setEditMode(selectedMode);
                  setNewMode(selectedMode);
                  setModalVisible(true);
                  setDetailModalVisible(false);
                }}
              >
                <Edit2 size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.duplicateButton]}
                onPress={() => duplicateMode(selectedMode)}
              >
                <Copy size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => shareMode(selectedMode)}
              >
                <Share2 size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  setModes(modes.filter(m => m.id !== selectedMode.id));
                  setDetailModalVisible(false);
                }}
              >
                <Trash2 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Cooking Steps</Text>
            {selectedMode?.steps.map((step, index) => (
              <View key={index} style={styles.detailStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepMetrics}>
                    <View style={styles.metric}>
                      <Clock size={16} color="#4A90E2" />
                      <Text style={styles.stepMetricText}>
                        {formatDuration(step.duration)}
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Flame size={16} color="#FF6B6B" />
                      <Text style={styles.stepMetricText}>
                        Level {step.heatLevel}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

// Add this modal code right before the return statement:
const renderAddEditModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Mode' : 'Add New Mode'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
  
          <ScrollView style={styles.modalScrollView}
          showsVerticalScrollIndicator={false}>
            {/* Image Picker Button */}
            <TouchableOpacity style={styles.imagePickerButton}>
              <ChefHat size={32} color="#666" />
              <Text style={styles.imagePickerText}>Add Mode Image</Text>
            </TouchableOpacity>
  
            {/* Basic Information */}
            <TextInput
              style={styles.input}
              placeholder="Mode Name"
              value={newMode.name}
              onChangeText={text => setNewMode({ ...newMode, name: text })}
            />
  
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              multiline
              value={newMode.description}
              onChangeText={text => setNewMode({ ...newMode, description: text })}
            />
  
            {/* Tags Input */}
            <View style={styles.tagInput}>
              <TextInput
                style={styles.tagInputField}
                placeholder="Add tags (e.g., Quick, Vegetarian)"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
  
            {/* Display Tags */}
            <View style={styles.tagsContainer}>
              {newMode.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
  
            <Text style={styles.sectionTitle}>Cooking Steps</Text>
            
            {/* Display existing steps */}
            {newMode.steps.map((step, index) => (
              <View key={index} style={styles.stepPreview}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepNumberText}>Step {index + 1}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setNewMode({
                        ...newMode,
                        steps: newMode.steps.filter((_, i) => i !== index)
                      });
                    }}
                  >
                    <Trash2 size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.stepMetrics}>
                  <Clock size={16} color="#4A90E2" />
                  <Text style={styles.stepMetricText}>{formatDuration(step.duration)}</Text>
                  <Flame size={16} color="#FF6B6B" />
                  <Text style={styles.stepMetricText}>Level {step.heatLevel}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            ))}
  
            {/* Add Step Button */}
            <TouchableOpacity 
              style={styles.addStepButton}
              onPress={() => {
                setHours('');
                setMinutes('');
                setSeconds('');
                setStepModalVisible(true);
              }}
            >
              <Plus size={20} color="#4A90E2" />
              <Text style={styles.addStepText}>Add Step</Text>
            </TouchableOpacity>
          </ScrollView>
  
          {/* Save Button - Now outside ScrollView but inside modalContent */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              if (newMode.name && newMode.steps.length > 0) {
                if (editMode) {
                  setModes(modes.map(mode => 
                    mode.id === editMode.id ? { ...newMode, id: editMode.id } : mode
                  ));
                } else {
                  setModes([...modes, { ...newMode, id: Date.now().toString() }]);
                }
                setModalVisible(false);
                setNewMode({ name: '', description: '', steps: [], tags: [] });
                setEditMode(null);
              }
            }}
          >
            <Save size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Save Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  // Add Step Modal
  const renderAddStepModal = () => (
    <Modal
      visible={stepModalVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Cooking Step</Text>
            <TouchableOpacity onPress={() => setStepModalVisible(false)}>
              <X size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
  
          {/* Time Inputs */}
          <Text style={styles.inputLabel}>Duration</Text>
          <View style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="Hours"
              keyboardType="numeric"
              value={hours}
              onChangeText={setHours}
            />
            <TextInput
              style={styles.timeInput}
              placeholder="Minutes"
              keyboardType="numeric"
              value={minutes}
              onChangeText={setMinutes}
            />
            <TextInput
              style={styles.timeInput}
              placeholder="Seconds"
              keyboardType="numeric"
              value={seconds}
              onChangeText={setSeconds}
            />
          </View>
  
          <TextInput
            style={styles.input}
            placeholder="Heat Level (1-9)"
            keyboardType="numeric"
            value={currentStep.heatLevel}
            onChangeText={text => setCurrentStep({ ...currentStep, heatLevel: text })}
          />
  
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Step Description"
            multiline
            value={currentStep.description}
            onChangeText={text => setCurrentStep({ ...currentStep, description: text })}
          />
  
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              const duration = convertToSeconds(hours, minutes, seconds);
              if (duration > 0 && currentStep.heatLevel && currentStep.description) {
                setNewMode({
                  ...newMode,
                  steps: [...newMode.steps, { 
                    duration,
                    heatLevel: parseInt(currentStep.heatLevel),
                    description: currentStep.description
                  }]
                });
                setCurrentStep({ duration: '', heatLevel: '', description: '' });
                setStepModalVisible(false);
              }
            }}
          >
            <Save size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Add Step</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ... (Previous modal code remains the same, just update the time input to include units)

  return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Cooking modes' }} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>We have covered you with the essential modes. Not enough? You can add your own cooking modes easily</Text>
        
        <View style={styles.grid}>
          {modes.map(renderModeCard)}
          <TouchableOpacity 
            style={[styles.modeCard, styles.addCard]}
            onPress={() => {
              setEditMode(null);
              setNewMode({ name: '', description: '', steps: [], tags: [] });
              setModalVisible(true);
            }}
          >
            <Plus size={32} color="#4A90E2" />
            <Text style={styles.addCardText}>Add Custom Mode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderDetailModal()}
      
      {/* Keep existing modals for editing/adding modes and steps */}
      {renderAddEditModal()}
      {renderAddStepModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeCard: {
    width: cardWidth,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#EEE',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    height: 32,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#4A90E2',
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  addCard: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  addCardText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  detailImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#EEE',
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  duplicateButton: {
    backgroundColor: '#50C878',
  },
  shareButton: {
    backgroundColor: '#FFB347',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepMetrics: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepMetricText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%', // Limit modal height
    flex: 1, // Allow content to flex
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    color: '#333',
  },
  stepPreview: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    marginBottom: 12,
  },
  addStepText: {
    color: '#4A90E2',
    fontSize: 16,
    marginLeft: 8,
  },
  modalScrollView: {
    flex: 1, // Take up available space
    marginBottom: 16, // Add space for save button
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    marginTop: 'auto', // Push to bottom of modalContent
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tagInput: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagInputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerButton: {
    backgroundColor: '#F5F5F5',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});

export default CookingModesPage;