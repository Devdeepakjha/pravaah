import { FieldReport } from '@/types/fieldReport';
import { MOCK_FIELD_REPORTS } from '@/data/mockFieldReports';
import { fetchWithFallback } from './api';

export async function getFieldReports(): Promise<FieldReport[]> {
  const result = await fetchWithFallback<FieldReport[]>('/api/v1/field-reports', MOCK_FIELD_REPORTS);
  return result.data;
}
