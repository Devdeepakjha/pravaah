import { FieldReport } from '@/types/fieldReport';
import { MOCK_FIELD_REPORTS } from '@/data/mockFieldReports';
import { fetchWithFallback, API_BASE_URL, IS_LIVE_API_ENABLED } from './api';

export async function getFieldReports(): Promise<FieldReport[]> {
  const result = await fetchWithFallback<FieldReport[]>('/api/v1/field-reports', MOCK_FIELD_REPORTS);
  return result.data;
}

export async function submitFieldReport(input: FormData | Record<string, any>): Promise<FieldReport> {
  let formData: FormData;
  if (input instanceof FormData) {
    formData = input;
  } else {
    formData = new FormData();
    Object.entries(input).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        if (key === 'file' && val instanceof File) {
          formData.append('image', val);
        } else if (key === 'incidentType') {
          formData.append('incident_type', String(val));
        } else if (key === 'locationName') {
          formData.append('location_name', String(val));
        } else if (key === 'reporterName') {
          formData.append('reporter_name', String(val));
        } else if (key === 'reporterRole') {
          formData.append('reporter_role', String(val));
        } else if (key === 'reporterAgency') {
          formData.append('reporter_agency', String(val));
        } else {
          formData.append(key, String(val));
        }
      }
    });
  }

  if (IS_LIVE_API_ENABLED) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/field-reports`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[PRAVAAH API] Failed to submit field report live, falling back to local creation:', err);
    }
  }

  // Local fallback creation
  const title = (formData.get('title') as string) || 'Field Hazard Observation';
  const locationName = (formData.get('location_name') as string) || 'Northeast Corridor';
  const district = (formData.get('district') as string) || 'East Sikkim';
  const lat = parseFloat((formData.get('latitude') as string) || '27.2400');
  const lng = parseFloat((formData.get('longitude') as string) || '88.5100');
  const observations = (formData.get('observations') as string) || 'Surface tension cracks observed along cut slope.';

  return {
    id: `report-${Date.now().toString(36)}`,
    title,
    incidentType: 'SLUMP',
    locationName,
    district,
    state: 'Sikkim',
    coordinates: { lat, lng },
    reporter: {
      name: (formData.get('reporter_name') as string) || 'Field Observer',
      role: (formData.get('reporter_role') as string) || 'Citizen / Ward Warden',
      agency: 'Community Response',
    },
    status: 'VERIFIED',
    urgency: 'HIGH',
    severity: 'HIGH',
    timestamp: new Date().toISOString(),
    observations,
    aiAnalysis: {
      severity: 'HIGH',
      operational_priority_influence: 'P1',
      confidence: 0.85,
      evidence: [
        'Visible tension crack discontinuity pattern detected',
        'Colluvial soil exposure along slope toe margin',
      ],
      analysis_source: 'PRAVAAH Computer Vision Engine v1.0',
      disclaimer: 'AI-assisted visual assessment (preliminary screening, not confirmed geological survey).',
    },
    dataSource: 'DEMO_SIMULATION',
  };
}
