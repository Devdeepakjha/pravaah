import { RiskZone } from '@/types/riskZone';
import { MOCK_RISK_ZONES } from '@/data/mockRiskZones';
import { fetchWithFallback } from './api';

export async function getRiskZones(): Promise<RiskZone[]> {
  const result = await fetchWithFallback<RiskZone[]>('/api/v1/risk-zones', MOCK_RISK_ZONES);
  return result.data;
}

export async function getRiskZoneById(zoneId: string): Promise<RiskZone | null> {
  const zones = await getRiskZones();
  return zones.find(z => z.id === zoneId) || null;
}

export async function searchLocations(query: string): Promise<{
  zones: RiskZone[];
  landmarks: Array<{ name: string; type: string; coordinates: { lat: number; lng: number }; zoneId?: string }>;
}> {
  const clean = query.trim().toLowerCase();
  if (!clean) return { zones: [], landmarks: [] };

  const zones = await getRiskZones();
  const matchedZones = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(clean) ||
      z.district.toLowerCase().includes(clean) ||
      z.state.toLowerCase().includes(clean) ||
      z.basin.toLowerCase().includes(clean) ||
      z.primaryAction.toLowerCase().includes(clean) ||
      z.impact.populationDetail.toLowerCase().includes(clean) ||
      z.impact.criticalRoadImpact.toLowerCase().includes(clean) ||
      (clean.includes('singtam') && z.id === 'zone-east-sikkim') ||
      (clean.includes('dikchu') && z.id === 'zone-east-sikkim') ||
      (clean.includes('gangtok') && z.id === 'zone-east-sikkim') ||
      (clean.includes('teesta') && z.id === 'zone-east-sikkim') ||
      (clean.includes('mangan') && z.id === 'zone-north-sikkim') ||
      (clean.includes('chungthang') && z.id === 'zone-north-sikkim') ||
      (clean.includes('kurung') && z.id === 'zone-kurung-kumey') ||
      (clean.includes('koloriang') && z.id === 'zone-kurung-kumey') ||
      (clean.includes('haflong') && z.id === 'zone-dima-hasao') ||
      (clean.includes('aizawl') && z.id === 'zone-champhai') ||
      (clean.includes('kumey') && z.id === 'zone-kurung-kumey')
  );

  const landmarks = [
    {
      name: 'North Sikkim — Mangan / Chungthang Corridor',
      type: 'Upper Teesta / BRO Lifeline',
      coordinates: { lat: 27.5200, lng: 88.5400 },
      zoneId: 'zone-north-sikkim',
    },
    {
      name: 'Singtam Basin & Highway Corridor',
      type: 'Teesta Basin / NH-10',
      coordinates: { lat: 27.2380, lng: 88.5000 },
      zoneId: 'zone-east-sikkim',
    },
    {
      name: 'NH-10 Km 44 Active Blockade',
      type: 'Debris Flow Incident',
      coordinates: { lat: 27.2345, lng: 88.4980 },
      zoneId: 'zone-east-sikkim',
    },
    {
      name: 'Gangtok Ridge & DDMA Operations',
      type: 'Capital Sector',
      coordinates: { lat: 27.3389, lng: 88.6065 },
      zoneId: 'zone-east-sikkim',
    },
    {
      name: 'Kurung Kumey Sector (Koloriang)',
      type: 'Vulnerable Border Sector',
      coordinates: { lat: 27.9100, lng: 93.4500 },
      zoneId: 'zone-kurung-kumey',
    },
    {
      name: 'Rangpo Transit Checkpost',
      type: 'Corridor Lifeline',
      coordinates: { lat: 27.1760, lng: 88.5280 },
      zoneId: 'zone-east-sikkim',
    },
    {
      name: 'Haflong Hill Station & Railway',
      type: 'Dima Hasao Sector',
      coordinates: { lat: 25.1800, lng: 93.0200 },
      zoneId: 'zone-dima-hasao',
    },
    {
      name: 'Champhai Border Ridge',
      type: 'Mizoram Seismic Sector',
      coordinates: { lat: 23.4750, lng: 93.3280 },
      zoneId: 'zone-champhai',
    },
  ].filter(
    (l) =>
      l.name.toLowerCase().includes(clean) ||
      l.type.toLowerCase().includes(clean) ||
      (clean.includes('singtam') && l.name.toLowerCase().includes('singtam')) ||
      (clean.includes('gangtok') && l.name.toLowerCase().includes('gangtok')) ||
      (clean.includes('kurung') && l.name.toLowerCase().includes('kurung'))
  );

  return {
    zones: matchedZones,
    landmarks,
  };
}
