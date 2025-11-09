import axios from 'axios';
import { toast } from 'sonner';

// --- TYPES ---
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  response?: string;
};

// Helper function to get restaurant ID
export const getRestaurantId = async (): Promise<number | null> => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const decodedToken: { sub: string } = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.sub;

    const restaurantResponse = await axios.get(`http://localhost:3002/restaurants?ownerId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (restaurantResponse.data.length === 0) {
      return null;
    }
    return restaurantResponse.data[0].id;
  } catch (error) {
    console.error('Error fetching restaurant ID:', error);
    return null;
  }
};

// --- API FUNCTIONS ---
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const token = localStorage.getItem('accessToken');
  if (!token) return [];

  try {
    const decodedToken: { sub: string } = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.sub;

    const restaurantResponse = await axios.get(`http://localhost:3002/restaurants?ownerId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (restaurantResponse.data.length === 0) {
      toast.error('No restaurant found for your account.');
      return [];
    }
    const restaurant = restaurantResponse.data[0];

    const menuResponse = await axios.get(`http://localhost:3002/restaurants/${restaurant.id}/menu`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const menu = menuResponse.data;
    if (!menu || !menu.categories) {
      return [];
    }

    // Flatten the categories and items into a single array of MenuItems
    const flattenedItems: MenuItem[] = menu.categories.flatMap((category: any) =>
      category.items.map((item: any) => ({
        id: item._id, // Assuming the backend provides an _id
        name: item.name,
        description: item.description || 'No description',
        price: item.price,
        category: category.name,
      }))
    );

    return flattenedItems;
  } catch (error) {
    console.error('Error fetching or processing menu items:', error);
    toast.error('Failed to load menu data. Please try again.');
    return [];
  }
};

export const addMenuItem = async (newItem: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.post('http://localhost:3002/menus', newItem, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const updateMenuItem = async (updatedItem: MenuItem): Promise<MenuItem> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.put(`http://localhost:3002/menus/${updatedItem.id}`, updatedItem, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  await axios.delete(`http://localhost:3002/menus/${id}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const getMenuItem = async (id: string): Promise<MenuItem> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get(`http://localhost:3002/menus/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const getReviews = async (): Promise<Review[]> => {
  const token = localStorage.getItem('accessToken');
  try {
    const { data } = await axios.get('http://localhost:3002/reviews', { headers: { Authorization: `Bearer ${token}` } });
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const respondToReview = async (reviewId: string, response: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  await axios.post(`http://localhost:3002/reviews/${reviewId}/respond`, 
    { response }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const getOrders = async (): Promise<any[]> => {
  const token = localStorage.getItem('accessToken');
  try {
    const { data } = await axios.get('http://localhost:3003/orders', { headers: { Authorization: `Bearer ${token}` } });
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};
