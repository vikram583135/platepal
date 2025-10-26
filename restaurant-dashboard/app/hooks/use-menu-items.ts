import { useQuery } from '@tanstack/react-query';
import { getMenuItems } from '@/app/services/restaurant.service';

export const useMenuItems = () => {
  return useQuery({ queryKey: ['menuItems'], queryFn: getMenuItems });
};
