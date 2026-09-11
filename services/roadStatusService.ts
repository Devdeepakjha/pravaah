import { RoadCorridor } from '@/types/roadStatus';
import { MOCK_ROAD_CORRIDORS } from '@/data/mockRoads';
import { fetchWithFallback } from './api';

export async function getRoadCorridors(): Promise<RoadCorridor[]> {
  const result = await fetchWithFallback<RoadCorridor[]>('/api/v1/roads', MOCK_ROAD_CORRIDORS);
  return result.data;
}
