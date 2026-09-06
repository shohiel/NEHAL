export type NodeType =
  | 'gateway'
  | 'sdn_controller'
  | 'switch'
  | 'server'
  | 'database'
  | 'iot'
  | 'honeypot';

export type NodeHealth =
  | 'normal'
  | 'suspicious'
  | 'compromised'
  | 'quarantined'
  | 'healing'
  | 'recovered';

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  ip: string;
  mac: string;
  status: NodeHealth;
  cpuLoad: number; // 0-100%
  trafficRateKbps: number;
  droppedPackets: number;
  quarantinedAt?: number;
  x: number; // For visual topology (percentage or coordinate)
  y: number;
  tier: 'ingress' | 'controller' | 'core' | 'workload' | 'sinkhole';
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  status: 'normal' | 'congested' | 'blocked' | 'rerouted';
  bandwidthUtilization: number; // 0-100%
  activeFlowCount: number;
}

export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'SSH' | 'DNS' | 'MODBUS';

export interface PacketFlow {
  id: string;
  timestamp: number;
  srcIp: string;
  dstIp: string;
  protocol: ProtocolType;
  srcPort: number;
  dstPort: number;
  durationMs: number;
  srcBytes: number;
  dstBytes: number;
  packetCount: number;
  sameSrvRate: number;
  dstHostDiffSrvRate: number;
  anomalyScore: number; // 0.0 to 1.0
  predictedClass: string;
  isAttack: boolean;
  attackCategory?: string;
  action: 'forwarded' | 'analyzed' | 'dropped' | 'quarantined' | 'diverted_to_honeypot';
}

export interface AttackPreset {
  id: string;
  name: string;
  category: 'DoS / DDoS' | 'Probe / Recon' | 'R2L / Exploit' | 'U2R / Escalation' | 'Botnet / C2' | 'Zero-Day';
  description: string;
  targetNodeId: string;
  targetNodeName: string;
  defaultPacketRate: number; // pps
  protocol: ProtocolType;
  dstPort: number;
  entropy: number;
  affectedNodes: string[];
  signature: string;
}

export type MLModelId = 'DT' | 'RF' | 'SVM' | 'ANN' | 'ENSEMBLE';
export type DatasetId = 'NSL_KDD' | 'CIC_IDS2017' | 'UNSW_NB15';

export interface ModelConfig {
  id: MLModelId;
  name: string;
  fullName: string;
  architecture: string;
  trainingSamples: string;
  featureDimension: number;
  description: string;
}

export interface DatasetConfig {
  id: DatasetId;
  name: string;
  fullName: string;
  year: number;
  totalInstances: string;
  attackClasses: string[];
  description: string;
}

export interface BenchmarkMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  fpr: number; // False Positive Rate
  inferenceLatencyMs: number;
  meanRecoveryTimeMs: number;
  auc: number;
}

export interface BenchmarkRecord {
  modelId: MLModelId;
  modelName: string;
  datasetId: DatasetId;
  datasetName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  fpr: number;
  inferenceLatencyMs: number;
  meanRecoveryTimeMs: number;
  auc: number;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][]; // [actual][predicted]
}

export interface RocCurveDataPoint {
  fpr: number;
  tpr: number;
}

export interface FeatureImportance {
  feature: string;
  weight: number;
  dataset: DatasetId;
}

export interface RecoveryStage {
  stageNumber: number;
  title: string;
  shortDesc: string;
  status: 'idle' | 'executing' | 'completed' | 'failed';
  executionTimeMs: number;
  commandSnippet: string;
}

export interface RecoveryLog {
  id: string;
  timestamp: string;
  stageNumber: number;
  stageName: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
  latencyMs: number;
  rawTelemetry?: string;
}

export interface SystemStatusState {
  mode: 'autonomous' | 'manual_triage';
  state: 'healthy' | 'attack_detected' | 'remediating' | 'restored';
  activeAttack: AttackPreset | null;
  packetsPerSecond: number;
  threatLevel: 'nominal' | 'elevated' | 'high' | 'critical';
  confidenceThreshold: number; // e.g. 0.85
  quarantinedNodesCount: number;
  totalAttacksMitigated: number;
  lastMitigationDurationMs: number;
}
