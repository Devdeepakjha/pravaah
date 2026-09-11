import { DataSource } from './riskZone';

export interface ScenarioResult {
  scenarioId: string;
  zoneId: string;
  rainfallIncreasePercent: number; // e.g. +30%
  baselineRiskScore: number;
  simulatedRiskScore: number;
  projectedSlopeFailures: number;
  additionalExposedPopulation: number;
  corridorDisruptionProbability: number;
  suggestedP1EvacuationWindowHours: number;
  summary: string;
  dataSource: DataSource;
}
