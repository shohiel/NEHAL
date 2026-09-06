import {
  AttackPreset,
  DatasetId,
  MLModelId,
  NetworkLink,
  NetworkNode,
  PacketFlow,
  ProtocolType,
  RecoveryLog,
  RecoveryStage,
} from '../types';
import { EMPIRICAL_BENCHMARK_RECORDS, MODEL_CONFIGS } from '../data/benchmarkData';

const SAMPLE_BENIGN_IPS = [
  '192.168.1.105',
  '172.16.4.12',
  '10.0.1.55',
  '192.168.10.44',
  '10.0.2.80',
  '172.20.10.14',
];

const SAMPLE_MALICIOUS_IPS = [
  '185.220.101.5',
  '45.154.255.88',
  '194.26.29.112',
  '91.240.118.23',
  '103.145.13.9',
];

export function generateRandomPacket(
  activeAttack: AttackPreset | null,
  activeModel: MLModelId,
  activeDataset: DatasetId,
  confidenceThreshold: number
): PacketFlow {
  const isAttackPacket = activeAttack ? Math.random() < 0.88 : Math.random() < 0.04;
  const now = Date.now();

  const benchmark = EMPIRICAL_BENCHMARK_RECORDS.find(
    (b) => b.modelId === activeModel && b.datasetId === activeDataset
  ) || EMPIRICAL_BENCHMARK_RECORDS[0];

  let protocol: ProtocolType = 'TCP';
  let srcIp = SAMPLE_BENIGN_IPS[Math.floor(Math.random() * SAMPLE_BENIGN_IPS.length)];
  let dstIp = '10.0.1.10';
  let srcPort = Math.floor(1024 + Math.random() * 64000);
  let dstPort = 443;
  let srcBytes = Math.floor(120 + Math.random() * 1400);
  let dstBytes = Math.floor(400 + Math.random() * 8200);
  let packetCount = Math.floor(1 + Math.random() * 12);
  let durationMs = Math.floor(10 + Math.random() * 320);
  let sameSrvRate = +(0.7 + Math.random() * 0.3).toFixed(2);
  let dstHostDiffSrvRate = +(Math.random() * 0.15).toFixed(2);
  let predictedClass = 'Normal (Benign)';
  let anomalyScore = +(Math.random() * 0.28).toFixed(3);
  let action: PacketFlow['action'] = 'forwarded';

  if (isAttackPacket && activeAttack) {
    srcIp = SAMPLE_MALICIOUS_IPS[Math.floor(Math.random() * SAMPLE_MALICIOUS_IPS.length)];
    protocol = activeAttack.protocol;
    dstPort = activeAttack.dstPort;
    dstIp = activeAttack.targetNodeId === 'node_web_01' ? '10.0.1.10' :
            activeAttack.targetNodeId === 'node_db_01' ? '10.0.2.10' :
            activeAttack.targetNodeId === 'node_iot_gw' ? '10.0.3.10' :
            activeAttack.targetNodeId === 'node_iot_02' ? '10.0.3.22' : '10.0.1.11';
    
    srcBytes = Math.floor(64 + Math.random() * (activeAttack.category.includes('DoS') ? 80 : 3500));
    dstBytes = activeAttack.category.includes('DoS') ? 0 : Math.floor(120 + Math.random() * 400);
    packetCount = Math.floor(40 + Math.random() * 480);
    durationMs = Math.floor(1 + Math.random() * 45);
    sameSrvRate = activeAttack.category.includes('DoS') ? 1.0 : +(0.05 + Math.random() * 0.3).toFixed(2);
    dstHostDiffSrvRate = activeAttack.category.includes('Probe') ? +(0.85 + Math.random() * 0.15).toFixed(2) : 0.08;

    // Model-dependent classification score with high fidelity
    const modelAccuracyFactor = benchmark.accuracy / 100;
    const baseAnomaly = 0.82 + Math.random() * 0.17;
    anomalyScore = +(baseAnomaly * modelAccuracyFactor).toFixed(3);
    predictedClass = `${activeAttack.name} [${activeAttack.category}]`;

    if (anomalyScore >= confidenceThreshold) {
      action = activeAttack.category.includes('DoS') ? 'dropped' :
               activeAttack.category.includes('Probe') ? 'diverted_to_honeypot' : 'quarantined';
    } else {
      action = 'analyzed';
    }
  } else if (!isAttackPacket && Math.random() < (benchmark.fpr / 100)) {
    // Model false positive simulation according to benchmark
    anomalyScore = +(confidenceThreshold + Math.random() * 0.08).toFixed(3);
    predictedClass = 'False Positive Anomaly';
    action = 'analyzed';
  }

  return {
    id: `pkt_${now}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    srcIp,
    dstIp,
    protocol,
    srcPort,
    dstPort,
    durationMs,
    srcBytes,
    dstBytes,
    packetCount,
    sameSrvRate,
    dstHostDiffSrvRate,
    anomalyScore,
    predictedClass,
    isAttack: isAttackPacket,
    attackCategory: activeAttack?.category,
    action,
  };
}

export function createInitialRecoveryStages(): RecoveryStage[] {
  return [
    {
      stageNumber: 1,
      title: 'Threat Detection & Anomaly Filter',
      shortDesc: 'Multi-layer classifier evaluates flow feature vectors against security confidence thresholds.',
      status: 'idle',
      executionTimeMs: 0,
      commandSnippet: 'sdn_ai_engine.evaluate_flow(flow_vector, threshold=0.85) -> FLAG_MALICIOUS',
    },
    {
      stageNumber: 2,
      title: 'SDN OpenFlow Rule Injection',
      shortDesc: 'Ryu SDN controller issues OpenFlow table-0 drop & rate-limit actions to ingress switches.',
      status: 'idle',
      executionTimeMs: 0,
      commandSnippet: 'ovs-ofctl add-flow s1 "priority=65535,ip,nw_src={MALICIOUS_IP},actions=drop"',
    },
    {
      stageNumber: 3,
      title: 'Dynamic Host Isolation & Sinkhole',
      shortDesc: 'Compromised MAC/IP isolated from core VLAN; anomalous traffic redirected to Honeypot sinkhole.',
      status: 'idle',
      executionTimeMs: 0,
      commandSnippet: 'iptables -A FORWARD -m mac --mac-source {SRC_MAC} -j REJECT --reject-with icmp-net-prohibited',
    },
    {
      stageNumber: 4,
      title: 'Zero-Touch Topology & State Rollback',
      shortDesc: 'Automated rollback to verified baseline snapshot; container workloads re-instantiated.',
      status: 'idle',
      executionTimeMs: 0,
      commandSnippet: 'gitops_engine.revert_state(cluster="web_cluster", target_hash="HEAD@sha256:baseline_90f2")',
    },
    {
      stageNumber: 5,
      title: 'Forensic Telemetry & Post-Incident Audit',
      shortDesc: 'PCAP packet buffer archived to SIEM, cryptographic certificates rotated, status returned to Healthy.',
      status: 'idle',
      executionTimeMs: 0,
      commandSnippet: 'siem_telemetry.export_pcap_bundle(incident_id="{INCIDENT_ID}", status="MITIGATED_RESOLVED")',
    },
  ];
}

export function generateRecoveryExecutionPlan(
  attack: AttackPreset,
  model: MLModelId,
  dataset: DatasetId
): { stages: RecoveryStage[]; logs: RecoveryLog[]; totalTimeMs: number } {
  const benchmark = EMPIRICAL_BENCHMARK_RECORDS.find(
    (b) => b.modelId === model && b.datasetId === dataset
  ) || EMPIRICAL_BENCHMARK_RECORDS[0];

  const totalTime = Math.round(benchmark.meanRecoveryTimeMs * (0.92 + Math.random() * 0.16));
  const t1 = Math.round(benchmark.inferenceLatencyMs * 10 + 4);
  const t2 = Math.round(totalTime * 0.26);
  const t3 = Math.round(totalTime * 0.28);
  const t4 = Math.round(totalTime * 0.30);
  const t5 = totalTime - (t1 + t2 + t3 + t4);

  const stages: RecoveryStage[] = [
    {
      stageNumber: 1,
      title: 'Threat Detection & Anomaly Filter',
      shortDesc: `Classified via ${MODEL_CONFIGS[model].name} with ${(benchmark.accuracy).toFixed(1)}% benchmark accuracy.`,
      status: 'completed',
      executionTimeMs: t1,
      commandSnippet: `ai_classifier.predict(vector, model='${model}') -> CLASS='${attack.category}' CONF=0.994`,
    },
    {
      stageNumber: 2,
      title: 'SDN OpenFlow Rule Injection',
      shortDesc: `Injected OpenFlow flow drop and rate-limiting rules across Open vSwitch nodes s1 & s2.`,
      status: 'completed',
      executionTimeMs: t2,
      commandSnippet: `ovs-ofctl -O OpenFlow13 add-flow s1 "priority=60000,tcp,tp_dst=${attack.dstPort},actions=drop"`,
    },
    {
      stageNumber: 3,
      title: 'Dynamic Host Isolation & Sinkhole',
      shortDesc: `Target ${attack.targetNodeName} quarantined; reconnaissance traffic diverted to Honeypot (hp-01).`,
      status: 'completed',
      executionTimeMs: t3,
      commandSnippet: `sdn_controller.isolate_node('${attack.targetNodeId}', sinkhole='10.0.99.99')`,
    },
    {
      stageNumber: 4,
      title: 'Zero-Touch Topology & State Rollback',
      shortDesc: `Network state table and healthy container replica restored in ${t4} ms.`,
      status: 'completed',
      executionTimeMs: t4,
      commandSnippet: `net_orch.rollback_topology(nodes=['${attack.affectedNodes.join("','")}'])`,
    },
    {
      stageNumber: 5,
      title: 'Forensic Telemetry & Post-Incident Audit',
      shortDesc: `Cryptographic tokens rotated, PCAP traces persisted to evaluation dataset, network marked Healthy.`,
      status: 'completed',
      executionTimeMs: t5,
      commandSnippet: `audit_logger.commit_incident(event='${attack.id}', total_latency_ms=${totalTime})`,
    },
  ];

  const now = new Date();
  const formatTime = (offsetMs: number) => {
    const d = new Date(now.getTime() + offsetMs);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  let elapsed = 0;
  const logs: RecoveryLog[] = [
    {
      id: `log_${Date.now()}_1`,
      timestamp: formatTime(elapsed),
      stageNumber: 1,
      stageName: 'Detection Trigger',
      message: `ANOMALY DETECTED: [${attack.name}] signature matching payload pattern on port ${attack.dstPort}.`,
      severity: 'danger',
      latencyMs: elapsed,
      rawTelemetry: attack.signature,
    },
    {
      id: `log_${Date.now()}_2`,
      timestamp: formatTime(elapsed += t1),
      stageNumber: 1,
      stageName: 'Classifier Engine',
      message: `Model ${model} (${MODEL_CONFIGS[model].name}) verified malicious probability at 0.994 >= threshold (Dataset: ${dataset}).`,
      severity: 'warning',
      latencyMs: t1,
      rawTelemetry: `Entropy: ${attack.entropy}, PacketRate: ${attack.defaultPacketRate} pps, Target: ${attack.targetNodeId}`,
    },
    {
      id: `log_${Date.now()}_3`,
      timestamp: formatTime(elapsed += t2),
      stageNumber: 2,
      stageName: 'OpenFlow Interception',
      message: `OpenFlow flow table entry successfully programmed in core switches (s1, s2). Active flows dropped.`,
      severity: 'info',
      latencyMs: t2,
      rawTelemetry: `ovs-ofctl add-flow table=0,priority=65535,actions=drop [OK 200]`,
    },
    {
      id: `log_${Date.now()}_4`,
      timestamp: formatTime(elapsed += t3),
      stageNumber: 3,
      stageName: 'Host Containment',
      message: `Dynamic MAC isolation engaged. Probe/Exploit traffic redirected to Honeypot sinkhole (10.0.99.99).`,
      severity: 'warning',
      latencyMs: t3,
      rawTelemetry: `VLAN ID 99 remapped. Compromised port shut.`,
    },
    {
      id: `log_${Date.now()}_5`,
      timestamp: formatTime(elapsed += t4),
      stageNumber: 4,
      stageName: 'State Rollback',
      message: `Zero-touch state rollback completed. Microservices re-synced to clean configuration baseline snapshot.`,
      severity: 'success',
      latencyMs: t4,
      rawTelemetry: `GitOps sha256 checksum matched baseline. Network connectivity verified.`,
    },
    {
      id: `log_${Date.now()}_6`,
      timestamp: formatTime(elapsed += t5),
      stageNumber: 5,
      stageName: 'Closed-Loop Telemetry',
      message: `Self-recovery successfully completed in ${totalTime} ms. Autonomous network resumed nominal telemetry.`,
      severity: 'success',
      latencyMs: totalTime,
      rawTelemetry: `Incident report generated. Total recovery latency: ${totalTime}ms.`,
    },
  ];

  return { stages, logs, totalTimeMs: totalTime };
}
