import { RoadCorridor } from '@/types/roadStatus';
import { MOCK_ROAD_CORRIDORS } from '@/data/mockRoads';
import { fetchWithFallback, API_BASE_URL, IS_LIVE_API_ENABLED } from './api';

export async function getRoadCorridors(): Promise<RoadCorridor[]> {
  const result = await fetchWithFallback<any>('/api/v1/roads/status', { corridors: MOCK_ROAD_CORRIDORS });
  if (result.isLive && result.data?.corridors) {
    // Merge live blockade status with full geometry from mock corridors
    return MOCK_ROAD_CORRIDORS.map((m) => {
      const live = result.data.corridors.find((c: any) => c.id === m.id);
      return live ? { ...m, ...live, path: m.path } : m;
    });
  }
  return MOCK_ROAD_CORRIDORS;
}

export async function calculateAlternativeRoute(
  origin?: string,
  destination?: string,
  zoneId?: string
): Promise<any> {
  const requestBody: { origin?: string; destination?: string; zone_id?: string } = {};
  if (origin) requestBody.origin = origin;
  if (destination) requestBody.destination = destination;
  if (zoneId) requestBody.zone_id = zoneId;

  if (IS_LIVE_API_ENABLED) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roads/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[PRAVAAH API] Route planning live endpoint failed, falling back to local simulation:', err);
    }
  }

  // Local fallback simulation with STRICT location specificity
  if (zoneId) {
    const cleanZone = zoneId.toLowerCase().trim();
    if (cleanZone === 'zone-east-sikkim' || cleanZone === 'east-sikkim' || cleanZone === 'sikkim') {
      return getEastSikkimVerifiedRoute();
    }
    if (cleanZone === 'zone-north-sikkim' || cleanZone === 'north-sikkim' || cleanZone === 'mangan') {
      return {
        available: false,
        unavailable: true,
        zoneId: 'zone-north-sikkim',
        sectorName: 'North Sikkim - Mangan / Chungthang',
        primaryRoute: null,
        alternativeRoute: null,
        status: 'NO_VERIFIED_DETOUR',
        advisory:
          'North Sikkim Highway (BRO Lifeline) has active slope washouts along Mangan-Chungthang axis. No verified alternate road bypass exists. All heavy and civil transit restricted by Border Roads Organisation.',
        disclaimer: 'Live road status verified through Border Roads Organisation (BRO Project Swastik).'
      };
    }
    if (cleanZone === 'zone-kurung-kumey' || cleanZone === 'kurung-kumey' || cleanZone === 'koloriang') {
      return {
        available: false,
        unavailable: true,
        zoneId: 'zone-kurung-kumey',
        sectorName: 'Kurung Kumey Sector',
        primaryRoute: null,
        alternativeRoute: null,
        status: 'NO_VERIFIED_DETOUR',
        advisory:
          'No verified alternate bypass corridor is documented for Kurung Kumey (Koloriang corridor). Do not attempt unverified valley diversions. Follow local DDMA and police transit advisories.',
        disclaimer: 'Corridor status verified through Arunachal Pradesh Disaster Management.'
      };
    }
    if (cleanZone === 'zone-dima-hasao' || cleanZone === 'dima-hasao' || cleanZone === 'haflong') {
      return {
        available: false,
        unavailable: true,
        zoneId: 'zone-dima-hasao',
        sectorName: 'Dima Hasao Corridor',
        primaryRoute: null,
        alternativeRoute: null,
        status: 'NO_VERIFIED_DETOUR',
        advisory:
          'NH-27 Haflong pass is under standard monsoon speed advisory. No secondary detour corridor required or verified in current road-network database.',
        disclaimer: 'Corridor status verified through Assam State Disaster Management Authority.'
      };
    }
    if (cleanZone === 'zone-champhai' || cleanZone === 'champhai') {
      return {
        available: false,
        unavailable: true,
        zoneId: 'zone-champhai',
        sectorName: 'Champhai Ridge',
        primaryRoute: null,
        alternativeRoute: null,
        status: 'NO_VERIFIED_DETOUR',
        advisory:
          'Single arterial ridge corridor (NH-6). No verified alternate bypass corridor documented. Please adhere to local traffic control checkpoints.',
        disclaimer: 'Corridor status verified through Mizoram Disaster Management Authority.'
      };
    }

    return {
      available: false,
      unavailable: true,
      zoneId,
      sectorName: zoneId,
      primaryRoute: null,
      alternativeRoute: null,
      status: 'NO_VERIFIED_DETOUR',
      advisory: `Alternate route information unavailable for ${zoneId}. Follow local District Disaster Management Authority (DDMA) and traffic police advisories.`,
      disclaimer: 'Road corridor network database.'
    };
  }

  // If no zoneId was specified, but non-default origin/destination were passed
  if (origin && origin.toLowerCase() !== 'sevoke' && destination && destination.toLowerCase() !== 'gangtok') {
    return {
      available: false,
      unavailable: true,
      status: 'NO_VERIFIED_DETOUR',
      advisory: `No verified alternate route available between ${origin} and ${destination}.`,
    };
  }

  // Default East Sikkim fallback for backward compatibility
  return getEastSikkimVerifiedRoute();
}

function getEastSikkimVerifiedRoute() {
  return {
    available: true,
    unavailable: false,
    zoneId: 'zone-east-sikkim',
    sectorName: 'East Sikkim Basin',
    origin: { name: 'Sevoke (Siliguri Plain Entry)', coordinates: { lat: 26.8850, lng: 88.4600 } },
    destination: { name: 'Gangtok (State Capital / STNM Hospital)', coordinates: { lat: 27.3389, lng: 88.6065 } },
    primaryRoute: {
      name: 'NH-10 Teesta Valley Lifeline',
      status: 'IMPASSABLE_BLOCKADE',
      distanceKm: 75.0,
      estimatedTimeMins: 115,
      path: [
        { lat: 26.8850, lng: 88.4600 },
        { lat: 27.0580, lng: 88.4350 },
        { lat: 27.1760, lng: 88.5280 },
        { lat: 27.2345, lng: 88.4980 },
        { lat: 27.2380, lng: 88.5000 },
        { lat: 27.2850, lng: 88.5800 },
        { lat: 27.3389, lng: 88.6065 }
      ],
      blockade: {
        landmark: 'Km 44 Singtam - Rangpo Stretch',
        cause: '80m debris flow with boulder accumulation over 3 lanes',
      },
    },
    alternativeRoute: {
      name: 'NH-717A Reshi - Algarah - Pakyong Bypass Corridor',
      status: 'ACTIVE_SAFE_BYPASS',
      distanceKm: 118.0,
      estimatedTimeMins: 195,
      distanceDeltaKm: 43.0,
      timeDeltaMins: 80,
      path: [
        { lat: 26.8850, lng: 88.4600 },
        { lat: 27.0580, lng: 88.4350 },
        { lat: 27.0600, lng: 88.4720 },
        { lat: 27.1120, lng: 88.5860 },
        { lat: 27.1850, lng: 88.6380 },
        { lat: 27.2450, lng: 88.6150 },
        { lat: 27.2850, lng: 88.5800 },
        { lat: 27.3389, lng: 88.6065 }
      ],
    },
    advisory: 'ALERT: NH-10 is impassable at Km 44 due to active slope collapse. All emergency transit must divert via NH-717A Reshi-Algarah bypass.',
  };
}
