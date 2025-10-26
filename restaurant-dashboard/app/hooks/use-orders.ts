import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/app/services/restaurant.service';

export const useOrders = () => {
  return useQuery({ queryKey: ['orders'], queryFn: getOrders });
};
