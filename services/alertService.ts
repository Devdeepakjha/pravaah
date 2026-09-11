import { Alert, SituationOverview } from '@/types/alert';
import { MOCK_ALERTS, MOCK_SITUATION_OVERVIEW } from '@/data/mockAlerts';
import { fetchWithFallback } from './api';

export async function getActiveAlerts(): Promise<Alert[]> {
  const result = await fetchWithFallback<Alert[]>('/api/v1/alerts', MOCK_ALERTS);
  return result.data;
}

export async function getSituationOverview(): Promise<SituationOverview> {
  const result = await fetchWithFallback<SituationOverview>('/api/v1/situation', MOCK_SITUATION_OVERVIEW);
  return result.data;
}
