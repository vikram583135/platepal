import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateOrderStatus } from '../store';
import io from 'react-native-socket.io-client';

interface OrderTrackingScreenProps {
  navigation: any;
}

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder } = useSelector((state: RootState) => state.orders);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);

    newSocket.on('order_status_update', (data: { orderId: string; status: string }) => {
      dispatch(updateOrderStatus({ orderId: data.orderId, status: data.status as any }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4CAF50';
      case 'preparing':
        return '#2196F3';
      case 'ready':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Ready for Pickup';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being processed';
      case 'confirmed':
        return 'The restaurant has confirmed your order';
      case 'preparing':
        return 'Your delicious food is being prepared';
      case 'ready':
        return 'Your order is ready for pickup or delivery';
      case 'delivered':
        return 'Your order has been delivered. Enjoy your meal!';
      default:
        return '';
    }
  };

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  if (!currentOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Order</Text>
        <Text style={styles.emptySubtitle}>
          You don't have any active orders to track
        </Text>
        <TouchableOpacity style={styles.browseButton} onPress={navigateToHome}>
          <Text style={styles.browseButtonText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{currentOrder.id.slice(-8)}</Text>
        <Text style={styles.restaurantName}>{currentOrder.restaurantName}</Text>
        <Text style={styles.orderTime}>
          Ordered at {new Date(currentOrder.createdAt).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(currentOrder.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(currentOrder.status)}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {getStatusDescription(currentOrder.status)}
        </Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        {currentOrder.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${currentOrder.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={navigateToHome}>
          <Text style={styles.actionButtonText}>Order Again</Text>
        </TouchableOpacity>
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
  browseButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: '#999',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  orderDetails: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
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
    color: '#FF6B35',
  },
  actions: {
    padding: 20,
    marginTop: 'auto',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderTrackingScreen;
