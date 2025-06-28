import { getAuthToken } from '@/utils/auth';

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: {
    interviews: string | number;
    storage: string;
    support: string;
    team?: boolean;
  };
  isActive: boolean;
}

export const planService = {
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  async getPublicPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans/public`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch public plans');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching public plans:', error);
      throw error;
    }
  }
}; 