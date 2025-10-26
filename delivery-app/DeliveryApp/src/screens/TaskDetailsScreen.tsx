import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateTaskStatus, completeTask } from '../store';

interface TaskDetailsScreenProps {
  navigation: any;
}

const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentTask } = useSelector((state: RootState) => state.tasks);
  const { loading } = useSelector((state: RootState) => state.tasks);

  const handleStatusUpdate = async (status: string) => {
    if (!currentTask) return;

    try {
      await dispatch(updateTaskStatus({ taskId: currentTask.id, status })).unwrap();
      
      if (status === 'delivered') {
        Alert.alert(
          'Task Completed',
          'Great job! Task has been completed successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#2196F3';
      case 'picked_up':
        return '#FF9800';
      case 'delivered':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'picked_up':
        return 'Picked Up';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getNextAction = () => {
    if (!currentTask) return null;

    switch (currentTask.status) {
      case 'accepted':
        return {
          text: 'Mark as Picked Up',
          action: () => handleStatusUpdate('picked_up'),
          color: '#FF9800',
        };
      case 'picked_up':
        return {
          text: 'Mark as Delivered',
          action: () => handleStatusUpdate('delivered'),
          color: '#4CAF50',
        };
      default:
        return null;
    }
  };

  if (!currentTask) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Task</Text>
        <Text style={styles.emptySubtitle}>
          You don't have any active tasks
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

  const nextAction = getNextAction();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.taskId}>Task #{currentTask.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentTask.status) }]}>
          <Text style={styles.statusText}>{getStatusText(currentTask.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Details</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Restaurant</Text>
          <Text style={styles.infoValue}>{currentTask.restaurantName}</Text>
          
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{currentTask.restaurantAddress}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Delivery Address</Text>
          <Text style={styles.infoValue}>{currentTask.customerAddress}</Text>
          
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{currentTask.customerPhone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.infoCard}>
          {currentTask.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${currentTask.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Delivery</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{currentTask.estimatedDeliveryTime}</Text>
        </View>
      </View>

      {nextAction && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: nextAction.color }]}
            onPress={nextAction.action}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>{nextAction.text}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.navigationSection}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('Navigation')}
        >
          <Text style={styles.navigationButtonText}>Open Navigation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  taskId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionSection: {
    padding: 20,
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationSection: {
    padding: 20,
    marginBottom: 20,
  },
  navigationButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailsScreen;
