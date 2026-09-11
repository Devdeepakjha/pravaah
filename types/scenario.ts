import { DataSource } from './riskZone';

export interface ScenarioResult {
  scenarioId: string;
  zoneId: string;
  rainfallIncreasePercent: number; // e.g. +30%
  baselineRiskScore: number;
  simulatedRiskScore: number;
  riskDelta?: number;
  baselineRain24h?: number;
  simulatedRain24h?: number;
  baselineRiskLevel?: string;
  simulatedRiskLevel?: string;
  projectedSlopeFailures: number;
  additionalExposedPopulation: number;
  corridorDisruptionProbability: number;
  suggestedP1EvacuationWindowHours: number;
  summary: string;
  affectedInfrastructure?: string[];
  affectedVillages?: string[];
  changedResponsePriority?: string;
  operationalRecommendation?: string;
  dataSource: DataSource;
}
