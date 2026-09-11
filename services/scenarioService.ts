import { ScenarioResult } from '@/types/scenario';
import { RiskZone } from '@/types/riskZone';
import { fetchWithFallback } from './api';

export async function runRainfallSimulation(
  zone: RiskZone,
  rainfallIncreasePercent: number
): Promise<ScenarioResult> {
  const fallbackResult: ScenarioResult = {
    scenarioId: `sim-${zone.id}-${Date.now()}`,
    zoneId: zone.id,
    rainfallIncreasePercent,
    baselineRiskScore: zone.riskScore,
    simulatedRiskScore: Math.min(99, Math.round(zone.riskScore + (rainfallIncreasePercent / 100) * 22)),
    riskDelta: Math.round((rainfallIncreasePercent / 100) * 22),
    baselineRain24h: Math.round(zone.telemetry?.rainfall24h ?? 94),
    simulatedRain24h: Math.round((zone.telemetry?.rainfall24h ?? 94) * (1 + rainfallIncreasePercent / 100)),
    projectedSlopeFailures: zone.riskScore > 60 ? 4 : 2,
    additionalExposedPopulation: Math.round(zone.impact.populationExposed * 0.35),
    corridorDisruptionProbability: Math.min(99, Math.round(zone.riskScore * 1.2)),
    suggestedP1EvacuationWindowHours: zone.riskScore > 60 ? 4 : 12,
    summary: `At +${rainfallIncreasePercent}% precipitation, pore-water pressure increases significantly along the shear plane.`,
    changedResponsePriority: zone.riskScore + (rainfallIncreasePercent / 100) * 22 > 60 ? 'P1 — Immediate Pre-positioning' : 'P2 — Enhanced Patrol',
    operationalRecommendation: 'Monitor tension cracks and prepare heavy earthmovers along vulnerable bypass nodes.',
    dataSource: 'DEMO_SIMULATION',
  };

  try {
    const { data, isLive } = await fetchWithFallback<any>(
      '/api/v1/simulate',
      null as any,
      {
        method: 'POST',
        body: JSON.stringify({
          zone_id: zone.id,
          rainfall_delta_percent: rainfallIncreasePercent,
        }),
      }
    );

    if (isLive && data) {
      return {
        scenarioId: `sim-${zone.id}-${Date.now()}`,
        zoneId: data.zone_id,
        rainfallIncreasePercent: data.rainfall_delta_percent,
        baselineRiskScore: Math.round(data.baseline_risk_score),
        simulatedRiskScore: Math.round(data.simulated_risk_score),
        riskDelta: Math.round(data.risk_delta),
        baselineRain24h: Math.round(data.baseline_rain_24h ?? zone.telemetry?.rainfall24h ?? 94),
        simulatedRain24h: Math.round(data.simulated_rain_24h ?? ((zone.telemetry?.rainfall24h ?? 94) * (1 + rainfallIncreasePercent / 100))),
        baselineRiskLevel: data.baseline_risk_level,
        simulatedRiskLevel: data.simulated_risk_level,
        projectedSlopeFailures: data.simulated_risk_score > 60 ? 4 : 2,
        additionalExposedPopulation: data.estimated_exposed_population,
        corridorDisruptionProbability: Math.min(99, Math.round(data.simulated_risk_score * 1.1)),
        suggestedP1EvacuationWindowHours: data.simulated_risk_score > 70 ? 4 : 12,
        summary: data.operational_recommendation,
        affectedInfrastructure: data.affected_infrastructure,
        affectedVillages: data.affected_villages,
        changedResponsePriority: data.changed_response_priority,
        operationalRecommendation: data.operational_recommendation,
        dataSource: 'LIVE_TELEMETRY',
      };
    }
  } catch (err) {
    console.warn('[PRAVAAH API] Simulation endpoint error, falling back to analytical estimate:', err);
  }

  return fallbackResult;
}

export async function simulateScenario(params: {
  zone_id: string;
  rainfall_delta_percent: number;
  scenario_type?: string;
}): Promise<ScenarioResult> {
  const dummyZone = {
    id: params.zone_id,
    riskScore: 68,
    impact: { populationExposed: 18450 }
  } as RiskZone;
  return runRainfallSimulation(dummyZone, params.rainfall_delta_percent);
}

