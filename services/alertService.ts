import { Alert, SituationOverview } from '@/types/alert';
import { MOCK_ALERTS, MOCK_SITUATION_OVERVIEW } from '@/data/mockAlerts';
import { fetchWithFallback, API_BASE_URL, IS_LIVE_API_ENABLED } from './api';

export async function getActiveAlerts(): Promise<Alert[]> {
  const result = await fetchWithFallback<any>('/api/v1/alerts', { alerts: MOCK_ALERTS });
  if (result.isLive && Array.isArray(result.data?.alerts)) {
    return result.data.alerts.map((a: any) => ({
      id: a.id,
      level: a.level === 'RED_ALERT' ? 'RED' : a.level === 'ORANGE_ALERT' ? 'ORANGE' : 'YELLOW',
      title: a.title,
      targetRegion: a.targetRegion,
      timestamp: a.timestamp,
      message: a.message,
      actionMandate: a.actionMandate,
      channels: a.channels || ['Web Dashboard', 'SMS Gateway (Preview)'],
      dataSource: a.dataSource || 'LIVE_TELEMETRY',
    }));
  }
  return MOCK_ALERTS;
}

export async function getSituationOverview(): Promise<SituationOverview> {
  const result = await fetchWithFallback<SituationOverview>('/api/v1/situation', MOCK_SITUATION_OVERVIEW);
  return result.data;
}

export async function previewAlert(zoneId: string = 'zone-east-sikkim', channel: string = 'sms'): Promise<any> {
  if (IS_LIVE_API_ENABLED) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/alerts/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: zoneId, channel }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[PRAVAAH API] Failed to fetch alert preview live:', err);
    }
  }

  // Fallback preview
  return {
    channel: 'SMS_BROADCAST_PREVIEW',
    carrier_status: 'PREVIEW_ONLY (No external SMS sent)',
    target_region: 'East Sikkim (Singtam)',
    payload: {
      sender_id: 'NDMA-PRAVAH',
      message_body: '[NDMA PRAVAAH ALERT] SEVERE HAZARD warning for East Sikkim. Saturated slopes exceed safety threshold. Avoid NH-10. Emergency: Dial 1070/112.',
      priority: 'HIGH_EMERGENCY',
    },
    timestamp: new Date().toISOString(),
    disclaimer: 'NOTIFICATION PREVIEW: Demonstration simulation format complying with CAP/NDMA standards.',
  };
}
