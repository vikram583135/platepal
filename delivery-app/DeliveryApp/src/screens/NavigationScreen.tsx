import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface NavigationScreenProps {
  navigation: any;
}

const NavigationScreen: React.FC<NavigationScreenProps> = ({ navigation }) => {
  const { currentTask } = useSelector((state: RootState) => state.tasks);
  const [currentStep, setCurrentStep] = useState<'restaurant' | 'customer'>('restaurant');

  useEffect(() => {
    if (currentTask?.status === 'picked_up') {
      setCurrentStep('customer');
    }
  }, [currentTask?.status]);

  const handleArrived = () => {
    const location = currentStep === 'restaurant' ? 'restaurant' : 'customer';
    Alert.alert(
      `Arrived at ${location}`,
      `You have arrived at the ${location}. What would you like to do?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            if (currentStep === 'restaurant') {
              Alert.alert('At Restaurant', 'Please pick up the order and mark as picked up in task details.');
            } else {
              Alert.alert('At Customer', 'Please deliver the order and mark as delivered in task details.');
            }
          },
        },
      ]
    );
  };

  const toggleStep = () => {
    setCurrentStep(currentStep === 'restaurant' ? 'customer' : 'restaurant');
  };

  if (!currentTask) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Task</Text>
        <Text style={styles.emptySubtitle}>
          You need an active task to use navigation
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentLocation = currentStep === 'restaurant' 
    ? currentTask.restaurantAddress 
    : currentTask.customerAddress;

  const nextLocation = currentStep === 'restaurant' 
    ? currentTask.customerAddress 
    : currentTask.restaurantAddress;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.taskId}>Task #{currentTask.id.slice(-8)}</Text>
        <Text style={styles.statusText}>
          Status: {currentTask.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.navigationCard}>
        <View style={styles.stepIndicator}>
          <View style={[styles.step, currentStep === 'restaurant' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'restaurant' && styles.activeStepText]}>
              1
            </Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, currentStep === 'customer' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'customer' && styles.activeStepText]}>
              2
            </Text>
          </View>
        </View>

        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, currentStep === 'restaurant' && styles.activeStepLabel]}>
            Pickup
          </Text>
          <Text style={[styles.stepLabel, currentStep === 'customer' && styles.activeStepLabel]}>
            Delivery
          </Text>
        </View>
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>
          {currentStep === 'restaurant' ? 'Pickup Location' : 'Delivery Location'}
        </Text>
        <Text style={styles.locationAddress}>{currentLocation}</Text>
        
        <TouchableOpacity style={styles.arrivedButton} onPress={handleArrived}>
          <Text style={styles.arrivedButtonText}>I've Arrived</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nextLocationCard}>
        <Text style={styles.nextLocationTitle}>Next Stop</Text>
        <Text style={styles.nextLocationAddress}>{nextLocation}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleStep}>
          <Text style={styles.toggleButtonText}>
            Switch to {currentStep === 'restaurant' ? 'Delivery' : 'Pickup'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToTaskButton}
          onPress={() => navigation.navigate('TaskDetails')}
        >
          <Text style={styles.backToTaskButtonText}>Back to Task Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Navigation Tips</Text>
        <Text style={styles.infoText}>
          • Use your preferred navigation app (Google Maps, Apple Maps, etc.)
        </Text>
        <Text style={styles.infoText}>
          • Tap "I've Arrived" when you reach each location
        </Text>
        <Text style={styles.infoText}>
          • Update task status in Task Details after each step
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  taskId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  navigationCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#4CAF50',
  },
  stepText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  activeStepText: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 8,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepLabel: {
    fontSize: 16,
    color: '#666',
  },
  activeStepLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  arrivedButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextLocationCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  nextLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nextLocationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    padding: 16,
  },
  toggleButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToTaskButton: {
    backgroundColor: '#666',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default NavigationScreen;
