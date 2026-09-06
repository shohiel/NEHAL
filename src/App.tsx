import React, { useEffect, useRef, useState } from 'react';
import {
  AttackPreset,
  DatasetId,
  MLModelId,
  NetworkLink,
  NetworkNode,
  PacketFlow,
  RecoveryLog,
  RecoveryStage,
  SystemStatusState,
} from './types';
import {
  INITIAL_NETWORK_LINKS,
  INITIAL_NETWORK_NODES,
} from './data/benchmarkData';
import {
  createInitialRecoveryStages,
  generateRandomPacket,
  generateRecoveryExecutionPlan,
} from './utils/simulationEngine';
import { Header } from './components/Header';
import { NetworkTopology } from './components/NetworkTopology';
import { ModelSelector } from './components/ModelSelector';
import { AttackSandbox } from './components/AttackSandbox';
import { RecoveryPipeline } from './components/RecoveryPipeline';
import { TrafficInspector } from './components/TrafficInspector';
import { MetricsDashboard } from './components/MetricsDashboard';
import { MethodologyDoc } from './components/MethodologyDoc';
import { DataFlowDiagram } from './components/DataFlowDiagram';

export default function App() {
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NETWORK_NODES);
  const [links, setLinks] = useState<NetworkLink[]>(INITIAL_NETWORK_LINKS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node_web_01');
  const [activeModel, setActiveModel] = useState<MLModelId>('RF');
  const [activeDataset, setActiveDataset] = useState<DatasetId>('NSL_KDD');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.85);
  const [activeAttack, setActiveAttack] = useState<AttackPreset | null>(null);

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    'testing_ground' | 'data_flow_diagram' | 'empirical_benchmarks' | 'methodology_doc'
  >('testing_ground');

  const [packets, setPackets] = useState<PacketFlow[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState<number>(1420);
  const [totalThreats, setTotalThreats] = useState<number>(12);

  const [recoveryStages, setRecoveryStages] = useState<RecoveryStage[]>(
    createInitialRecoveryStages()
  );
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const [isRemediating, setIsRemediating] = useState<boolean>(false);
  const [totalRecoveryTimeMs, setTotalRecoveryTimeMs] = useState<number>(0);

  const [realtimeTrafficData, setRealtimeTrafficData] = useState<
    Array<{ time: string; throughputKbps: number; anomalyScore: number }>
  >([
    { time: '06:30:10', throughputKbps: 420, anomalyScore: 0.12 },
    { time: '06:30:15', throughputKbps: 450, anomalyScore: 0.15 },
    { time: '06:30:20', throughputKbps: 410, anomalyScore: 0.08 },
    { time: '06:30:25', throughputKbps: 480, anomalyScore: 0.14 },
    { time: '06:30:30', throughputKbps: 430, anomalyScore: 0.10 },
  ]);

  const [systemStatus, setSystemStatus] = useState<SystemStatusState>({
    mode: 'autonomous',
    state: 'healthy',
    activeAttack: null,
    packetsPerSecond: 450,
    threatLevel: 'nominal',
    confidenceThreshold: 0.85,
    quarantinedNodesCount: 0,
    totalAttacksMitigated: 12,
    lastMitigationDurationMs: 142,
  });

  const remediationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial stream on mount
  useEffect(() => {
    const initialPkts: PacketFlow[] = [];
    for (let i = 0; i < 15; i++) {
      initialPkts.unshift(
        generateRandomPacket(null, activeModel, activeDataset, confidenceThreshold)
      );
    }
    setPackets(initialPkts);
  }, []);

  // Main Simulation Loop for Real-time Packet Ingestion
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = Math.max(200, Math.floor(1000 / simSpeed));
    const interval = setInterval(() => {
      const newPkt = generateRandomPacket(
        activeAttack,
        activeModel,
        activeDataset,
        confidenceThreshold
      );

      setPackets((prev) => [newPkt, ...prev.slice(0, 50)]);
      setTotalAnalyzed((prev) => prev + 1);

      if (newPkt.isAttack) {
        setTotalThreats((prev) => prev + 1);
      }

      // Update real-time chart
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const throughput = activeAttack
        ? Math.floor(2500 + Math.random() * 2000)
        : Math.floor(380 + Math.random() * 150);

      setRealtimeTrafficData((prev) => [
        ...prev.slice(-15),
        { time: timeStr, throughputKbps: throughput, anomalyScore: newPkt.anomalyScore },
      ]);

      // Subtle jitter on normal node loads
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.status === 'compromised') {
            return {
              ...node,
              cpuLoad: Math.min(99, Math.floor(85 + Math.random() * 14)),
              trafficRateKbps: Math.floor(3200 + Math.random() * 800),
            };
          }
          if (node.status === 'quarantined') {
            return { ...node, cpuLoad: 4, trafficRateKbps: 0 };
          }
          const jitter = Math.floor(Math.random() * 5) - 2;
          return {
            ...node,
            cpuLoad: Math.max(5, Math.min(45, node.cpuLoad + jitter)),
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, activeAttack, activeModel, activeDataset, confidenceThreshold]);

  // Handle Injecting Attack
  const handleInjectAttack = (attack: AttackPreset) => {
    setActiveAttack(attack);
    setSystemStatus((prev) => ({
      ...prev,
      state: 'attack_detected',
      activeAttack: attack,
      threatLevel: 'critical',
    }));

    // Update target node status to compromised
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === attack.targetNodeId || attack.affectedNodes.includes(node.id)) {
          return {
            ...node,
            status: node.id === attack.targetNodeId ? 'compromised' : 'suspicious',
            cpuLoad: Math.floor(88 + Math.random() * 10),
            droppedPackets: node.droppedPackets + 45,
          };
        }
        return node;
      })
    );

    // If autonomous mode is enabled, immediately schedule self-recovery pipeline!
    if (systemStatus.mode === 'autonomous') {
      if (remediationTimeoutRef.current) clearTimeout(remediationTimeoutRef.current);
      remediationTimeoutRef.current = setTimeout(() => {
        executeRemediationPipeline(attack);
      }, 400);
    }
  };

  // Execute closed-loop automated self-recovery
  const executeRemediationPipeline = (attack: AttackPreset) => {
    setIsRemediating(true);
    setSystemStatus((prev) => ({ ...prev, state: 'remediating' }));

    const plan = generateRecoveryExecutionPlan(attack, activeModel, activeDataset);
    setTotalRecoveryTimeMs(plan.totalTimeMs);
    setRecoveryStages(plan.stages);
    setRecoveryLogs((prev) => [...plan.logs, ...prev.slice(0, 40)]);

    // Simulate multi-stage visual execution
    setTimeout(() => {
      // Host Quarantine and OpenFlow drop stage
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === attack.targetNodeId) {
            return {
              ...node,
              status: 'quarantined',
              cpuLoad: 8,
              trafficRateKbps: 0,
              quarantinedAt: Date.now(),
            };
          }
          if (node.status === 'suspicious') {
            return { ...node, status: 'healing' };
          }
          return node;
        })
      );
    }, Math.min(plan.totalTimeMs * 0.4, 250));

    setTimeout(() => {
      // Restored stage
      setIsRemediating(false);
      setActiveAttack(null);
      setSystemStatus((prev) => ({
        ...prev,
        state: 'restored',
        activeAttack: null,
        threatLevel: 'nominal',
        totalAttacksMitigated: prev.totalAttacksMitigated + 1,
        lastMitigationDurationMs: plan.totalTimeMs,
        quarantinedNodesCount: prev.quarantinedNodesCount + 1,
      }));

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.status === 'healing' || node.status === 'suspicious') {
            return { ...node, status: 'normal', cpuLoad: 20 };
          }
          return node;
        })
      );
    }, plan.totalTimeMs + 100);
  };

  const handleStopAttack = () => {
    setActiveAttack(null);
    setSystemStatus((prev) => ({
      ...prev,
      state: 'healthy',
      activeAttack: null,
      threatLevel: 'nominal',
    }));
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.status === 'compromised' || node.status === 'suspicious'
          ? { ...node, status: 'normal', cpuLoad: 18 }
          : node
      )
    );
  };

  const handleResetNetwork = () => {
    setActiveAttack(null);
    setNodes(INITIAL_NETWORK_NODES);
    setLinks(INITIAL_NETWORK_LINKS);
    setRecoveryStages(createInitialRecoveryStages());
    setRecoveryLogs([]);
    setTotalRecoveryTimeMs(0);
    setIsRemediating(false);
    setSystemStatus({
      mode: 'autonomous',
      state: 'healthy',
      activeAttack: null,
      packetsPerSecond: 450,
      threatLevel: 'nominal',
      confidenceThreshold: 0.85,
      quarantinedNodesCount: 0,
      totalAttacksMitigated: 0,
      lastMitigationDurationMs: 0,
    });
  };

  const handleManualIsolateNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'quarantined' } : n))
    );
    const now = new Date().toLocaleTimeString();
    setRecoveryLogs((prev) => [
      {
        id: `manual_${Date.now()}`,
        timestamp: now,
        stageNumber: 3,
        stageName: 'Manual Operator Isolation',
        message: `Operator explicitly quarantined node ${nodeId} via console override.`,
        severity: 'warning',
        latencyMs: 12,
        rawTelemetry: `iptables -A FORWARD -s ${nodes.find((n) => n.id === nodeId)?.ip} -j DROP`,
      },
      ...prev,
    ]);
  };

  const handleManualReactivateNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'normal', cpuLoad: 20 } : n))
    );
    const now = new Date().toLocaleTimeString();
    setRecoveryLogs((prev) => [
      {
        id: `reactivate_${Date.now()}`,
        timestamp: now,
        stageNumber: 4,
        stageName: 'Manual Re-activation',
        message: `Node ${nodeId} restored from quarantine to clean production VLAN.`,
        severity: 'success',
        latencyMs: 8,
        rawTelemetry: `iptables -D FORWARD -s ${nodes.find((n) => n.id === nodeId)?.ip} -j DROP`,
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header */}
      <Header
        systemStatus={systemStatus}
        isSimulating={isSimulating}
        simSpeed={simSpeed}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onStepSimulation={() => {
          const newPkt = generateRandomPacket(
            activeAttack,
            activeModel,
            activeDataset,
            confidenceThreshold
          );
          setPackets((prev) => [newPkt, ...prev.slice(0, 50)]);
          setTotalAnalyzed((prev) => prev + 1);
        }}
        onChangeSimSpeed={setSimSpeed}
        onResetNetwork={handleResetNetwork}
        onToggleAutonomousMode={() =>
          setSystemStatus((prev) => ({
            ...prev,
            mode: prev.mode === 'autonomous' ? 'manual_triage' : 'autonomous',
          }))
        }
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1700px] w-full mx-auto space-y-5">
        {/* Tab 1: Interactive Testing Ground */}
        {activeTab === 'testing_ground' && (
          <div className="space-y-5">
            {/* Top Grid: Model Controls & Attack Sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-6">
                <ModelSelector
                  activeModel={activeModel}
                  activeDataset={activeDataset}
                  confidenceThreshold={confidenceThreshold}
                  onSelectModel={setActiveModel}
                  onSelectDataset={setActiveDataset}
                  onChangeConfidenceThreshold={setConfidenceThreshold}
                />
              </div>
              <div className="lg:col-span-6">
                <AttackSandbox
                  activeAttack={activeAttack}
                  nodes={nodes}
                  onInjectAttack={handleInjectAttack}
                  onStopAttack={handleStopAttack}
                  isSimulating={isSimulating}
                />
              </div>
            </div>

            {/* Middle Grid: Network Topology & Autonomous Recovery Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <NetworkTopology
                  nodes={nodes}
                  links={links}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  onManualIsolateNode={handleManualIsolateNode}
                  onManualReactivateNode={handleManualReactivateNode}
                  isSimulating={isSimulating}
                />
              </div>
              <div className="lg:col-span-5">
                <RecoveryPipeline
                  stages={recoveryStages}
                  logs={recoveryLogs}
                  isRemediating={isRemediating}
                  totalTimeMs={totalRecoveryTimeMs}
                  activeAttack={activeAttack}
                  autonomousMode={systemStatus.mode === 'autonomous'}
                  onManualTriggerRemediation={() => {
                    if (activeAttack) executeRemediationPipeline(activeAttack);
                  }}
                />
              </div>
            </div>

            {/* Bottom Grid: Live Ingress Telemetry & Flow Feature Inspector */}
            <div className="grid grid-cols-1 gap-5">
              <TrafficInspector
                packets={packets}
                totalAnalyzed={totalAnalyzed}
                totalThreats={totalThreats}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Formal Data Flow Diagram (DFD Level 0 & Level 1) */}
        {activeTab === 'data_flow_diagram' && <DataFlowDiagram />}

        {/* Tab 3: Empirical Benchmarks & Theoretical Matrices */}
        {activeTab === 'empirical_benchmarks' && (
          <MetricsDashboard
            activeModel={activeModel}
            activeDataset={activeDataset}
            realtimeTrafficData={realtimeTrafficData}
          />
        )}

        {/* Tab 4: Full Academic Thesis Specification Document */}
        {activeTab === 'methodology_doc' && <MethodologyDoc />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-[1700px] mx-auto">
          <span>
            AUTONOMA-X: AI-Driven Threat Detection & Self-Recovery Testing Ground • Dept. of CSE, IIUC
          </span>
          <span>
            Supervisor: Mr. Abdullahil Kafi • Candidate: Sadek Subhan Sakib • All rights reserved 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
