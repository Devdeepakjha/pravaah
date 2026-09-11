import { Infrastructure } from '@/types/infrastructure';
import { MOCK_INFRASTRUCTURE } from '@/data/mockInfrastructure';
import { fetchWithFallback } from './api';

export async function getInfrastructure(): Promise<Infrastructure[]> {
  const result = await fetchWithFallback<Infrastructure[]>('/api/v1/infrastructure', MOCK_INFRASTRUCTURE);
  return result.data;
}
