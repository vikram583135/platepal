import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addAvailableTask, acceptTask, checkDeliveryAuthStatus } from '../store';
import io from 'react-native-socket.io-client';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliveryPartner, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { availableTasks, currentTask, loading } = useSelector((state: RootState) => state.tasks);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    dispatch(checkDeliveryAuthStatus());
    
    // Connect to WebSocket for real-time task updates
    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);

    newSocket.on('delivery_task', (task: any) => {
      dispatch(addAvailableTask(task));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAcceptTask = async (taskId: string) => {
    Alert.alert(
      'Accept Task',
      'Are you sure you want to accept this delivery task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptTask(taskId)).unwrap();
              navigation.navigate('TaskDetails');
            } catch (error) {
              Alert.alert('Error', 'Failed to accept task');
            }
          },
        },
      ]
    );
  };

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskId}>Task #{item.id.slice(-8)}</Text>
        <Text style={styles.taskStatus}>Available</Text>
      </View>
      
      <View style={styles.taskInfo}>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <Text style={styles.taskAddress}>{item.restaurantAddress}</Text>
        <Text style={styles.customerAddress}>To: {item.customerAddress}</Text>
        <Text style={styles.taskTotal}>Total: ${item.total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptTask(item.id)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.acceptButtonText}>Accept Task</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const navigateToCurrentTask = () => {
    if (currentTask) {
      navigation.navigate('TaskDetails');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome, {deliveryPartner?.name || 'Partner'}! 👋
        </Text>
        <Text style={styles.subtitle}>
          {currentTask ? 'You have an active task' : 'Available delivery tasks'}
        </Text>
      </View>

      {currentTask && (
        <TouchableOpacity style={styles.currentTaskCard} onPress={navigateToCurrentTask}>
          <Text style={styles.currentTaskTitle}>Current Task</Text>
          <Text style={styles.currentTaskInfo}>
            {currentTask.restaurantName} → Customer
          </Text>
          <Text style={styles.currentTaskStatus}>
            Status: {currentTask.status.replace('_', ' ').toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>
          Available Tasks ({availableTasks.length})
        </Text>
        
        {availableTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No available tasks</Text>
            <Text style={styles.emptySubtitle}>
              New delivery tasks will appear here when available
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tasksList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  currentTaskCard: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  currentTaskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentTaskInfo: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  currentTaskStatus: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tasksList: {
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskStatus: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskInfo: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
