import { ScenarioResult } from '@/types/scenario';
import { RiskZone } from '@/types/riskZone';

export async function runRainfallSimulation(
  zone: RiskZone,
  rainfallIncreasePercent: number
): Promise<ScenarioResult> {
  // Analytical simulation model based on slope-saturation thresholds
  const additionalRisk = Math.min(100 - zone.riskScore, Math.round((rainfallIncreasePercent / 100) * 18));
  const newScore = Math.min(99, zone.riskScore + additionalRisk);

  return {
    scenarioId: `sim-${zone.id}-${Date.now()}`,
    zoneId: zone.id,
    rainfallIncreasePercent,
    baselineRiskScore: zone.riskScore,
    simulatedRiskScore: newScore,
    projectedSlopeFailures: zone.riskScore > 80 ? 4 : 2,
    additionalExposedPopulation: Math.round(zone.impact.populationExposed * 0.35),
    corridorDisruptionProbability: Math.min(99, Math.round(zone.riskScore * 1.15)),
    suggestedP1EvacuationWindowHours: zone.riskScore > 80 ? 4 : 12,
    summary: `At +${rainfallIncreasePercent}% precipitation, pore-water pressure exceeds safety factor Fs < 1.0 along the lower slip boundary.`,
    dataSource: 'DEMO_SIMULATION',
  };
}
