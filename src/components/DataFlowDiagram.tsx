import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Eye,
  FileCode,
  Filter,
  Info,
  Layers,
  Play,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';

interface DFDProcess {
  id: string;
  number: string;
  name: string;
  category: 'ingestion' | 'ml_inference' | 'decision' | 'recovery' | 'storage';
  inputs: string[];
  outputs: string[];
  dataStores: string[];
  description: string;
  mathModel: string;
  latencyMs: number;
  sampleInputData: Record<string, any>;
  sampleOutputData: Record<string, any>;
}

interface DFDDataStore {
  id: string;
  code: string;
  name: string;
  type: string;
  schema: string[];
  description: string;
}

interface DFDEntity {
  id: string;
  name: string;
  role: string;
  trafficType: string;
  icon: string;
}

const DFD_PROCESSES: DFDProcess[] = [
  {
    id: 'p1',
    number: '1.0',
    name: 'Telemetry Ingestion & Flow Parser',
    category: 'ingestion',
    inputs: ['Raw Ethernet Frames', 'NetFlow / IPFIX Telemetry', 'pcap Streams'],
    outputs: ['Raw Bidirectional Flow Records (41-78 dimensions)'],
    dataStores: ['D1: Ingress Ring Buffer'],
    description:
      'Captures high-throughput packet streams via DPDK / AF_PACKET rings, reassembles TCP/UDP sessions, and calculates statistical flow metrics (duration, packet count, byte symmetry, inter-arrival times).',
    mathModel:
      '\\text{Flow}(\\Delta t) = \\left\\{ \\text{src\\_ip}, \\text{dst\\_ip}, \\text{src\\_port}, \\text{dst\\_port}, \\text{proto}, \\sum_{i=1}^N B_i, \\mu_{\\Delta t}, \\sigma_{\\Delta t} \\right\\}',
    latencyMs: 0.42,
    sampleInputData: {
      src_ip: '192.168.10.45',
      dst_ip: '10.0.0.10',
      src_port: 48210,
      dst_port: 80,
      protocol: 'TCP',
      flags: ['SYN', 'ACK'],
      payload_len: 1460,
    },
    sampleOutputData: {
      duration_sec: 0.084,
      total_fwd_pkts: 128,
      total_bwd_pkts: 114,
      flow_bytes_per_sec: 184500.0,
      flow_pkts_per_sec: 2880.9,
      fwd_iat_mean: 0.00065,
      bwd_iat_std: 0.00012,
    },
  },
  {
    id: 'p2',
    number: '2.0',
    name: 'Feature Normalization & Tensor Scaling',
    category: 'ingestion',
    inputs: ['Raw Flow Records', 'Mean/Std Variance Registry'],
    outputs: ['Standardized Feature Vector Tensor X_i ∈ ℝ^d'],
    dataStores: ['D2: Feature Scaler Parameters'],
    description:
      'Performs One-Hot categorical encoding on symbolic protocol features and applies robust Z-Score standardization to continuous traffic statistics to prevent gradient domination.',
    mathModel:
      'z_{i,j} = \\frac{x_{i,j} - \\mu_j}{\\sigma_j}, \\quad \\mathbf{X}_i = [z_{i,1}, z_{i,2}, \\dots, z_{i,d}]^T',
    latencyMs: 0.18,
    sampleInputData: {
      raw_features: [0.084, 128, 114, 184500, 2880.9, 0.00065, 0.00012],
      encoder: 'OneHot(protocol="TCP", service="HTTP", flag="SF")',
    },
    sampleOutputData: {
      normalized_tensor: [0.24, 1.89, -0.42, 3.14, 2.76, -0.88, 0.05],
      tensor_dim: '1x41 (NSL-KDD) or 1x78 (CIC-IDS2017)',
      status: 'Ready for Model Tensor Core',
    },
  },
  {
    id: 'p3',
    number: '3.0',
    name: 'AI Multi-Model Classification Kernel',
    category: 'ml_inference',
    inputs: ['Normalized Feature Tensor X_i', 'Trained Classifier Weights'],
    outputs: ['Class Probabilities P(C_k | X)', 'Model Inference Latency'],
    dataStores: ['D3: Trained Weight Matrices (DT/RF/SVM/ANN)'],
    description:
      'Executes forward inference across supervised models (Decision Trees, Random Forest Bagging, Support Vector Machines, Artificial Neural Network MLPs, or Stacking Ensemble) to yield class probabilities.',
    mathModel:
      '\\hat{y} = \\arg\\max_{k \\in \\mathcal{C}} \\sum_{m=1}^M w_m P_m(C_k \\mid \\mathbf{X}_i), \\quad P(\\text{Threat}) = 1 - P(\\text{Normal})',
    latencyMs: 1.15,
    sampleInputData: {
      active_model: 'Random Forest (100 Estimators, max_depth=15)',
      input_vector_length: 41,
    },
    sampleOutputData: {
      predicted_class: 'DoS_SynFlood',
      confidence: 0.9942,
      raw_probabilities: {
        Normal: 0.0058,
        DoS: 0.9942,
        Probe: 0.0000,
        R2L: 0.0000,
        U2R: 0.0000,
      },
      inference_time_ms: 0.88,
    },
  },
  {
    id: 'p4',
    number: '4.0',
    name: 'State Decision & Dynamic Thresholding Engine',
    category: 'decision',
    inputs: ['Class Probabilities', 'Operational Threshold τ', 'Topology State Matrix'],
    outputs: ['Remediation Directive {Action, TargetNode, Urgency}'],
    dataStores: ['D4: Autonomous Defense Policies & State Registry'],
    description:
      'Evaluates anomaly scores against the confidence threshold τ = 0.85, filters false positive noise, maps threat signatures to network topology, and generates atomic mitigation directives.',
    mathModel:
      '\\text{Decision}(\\mathbf{X}) = \\begin{cases} \\text{EXECUTE\\_RECOVERY}(\\text{Action}) & \\text{if } P(\\text{Threat}) \\ge \\tau \\\\ \\text{LOG\\_BENIGN} & \\text{if } P(\\text{Threat}) < \\tau \\end{cases}',
    latencyMs: 0.25,
    sampleInputData: {
      confidence: 0.9942,
      active_threshold: 0.85,
      target_node: 'node_web_01 (10.0.0.10)',
      threat_category: 'DoS / Volumetric Flood',
    },
    sampleOutputData: {
      threshold_passed: true,
      alarm_state: 'CRITICAL',
      prescribed_action: 'ISOLATE_AND_DIVERT',
      target_switch: 's1 (Open vSwitch dpid=0000000000000001)',
      target_port: 2,
    },
  },
  {
    id: 'p5',
    number: '5.0',
    name: 'Zero-Touch Self-Healing & OpenFlow Orchestration',
    category: 'recovery',
    inputs: ['Remediation Directive', 'OpenFlow Controller API (Ryu / ONOS)'],
    outputs: ['OFP_FLOW_MOD (Drop)', 'VLAN Isolation', 'Honeypot Diversion', 'GitOps State Rollback'],
    dataStores: ['D5: OpenFlow Switch Flow Table', 'D6: SIEM & Audit Telemetry Store'],
    description:
      'Transmits OpenFlow v1.3 flow modification messages to edge switches, alters table-0 match rules to drop malicious traffic, isolates compromised MACs to quarantine VLAN 99, and triggers microservice baseline state rollback.',
    mathModel:
      'T_{\\text{rec}} = T_{\\text{detect}} + T_{\\text{decision}} + T_{\\text{OpenFlow\\_mod}} + T_{\\text{isolate}} + T_{\\text{verify}} \\le 200\\text{ ms}',
    latencyMs: 138.2,
    sampleInputData: {
      openflow_controller: 'Ryu SDN Controller (REST API :8080)',
      action: 'OFPFC_ADD (priority=65535, match={ip_src="192.168.10.45", ip_proto=6}, actions=[])',
    },
    sampleOutputData: {
      openflow_rule_installed: 'table=0, priority=65535, tcp, nw_src=192.168.10.45 actions=drop',
      vlan_tag_applied: 'VLAN_ID=99 (Quarantine Sinkhole)',
      honeypot_forwarding: '10.0.99.99 (Sinkhole Capture Enabled)',
      recovery_status: 'COMPLETED_ZERO_TOUCH',
      total_loop_latency_ms: 138.2,
    },
  },
];

const DFD_DATA_STORES: DFDDataStore[] = [
  {
    id: 'd1',
    code: 'D1',
    name: 'Ingress Telemetry Ring Buffer',
    type: 'High-Speed DPDK Shared Memory Buffer',
    schema: ['timestamp_ns', 'packet_raw', 'flow_id', 'header_metadata', 'rx_port'],
    description: 'Zero-copy ring buffer storing incoming network frames for sub-millisecond feature extraction.',
  },
  {
    id: 'd2',
    code: 'D2',
    name: 'Feature Scaler Parameters & Registry',
    type: 'In-Memory Key-Value Parameter Cache',
    schema: ['feature_index', 'mean_mu', 'std_sigma', 'min_val', 'max_val', 'one_hot_vocab'],
    description: 'Stores statistical population statistics for online Z-score scaling and protocol feature mapping.',
  },
  {
    id: 'd3',
    code: 'D3',
    name: 'Pre-Trained AI Classifier Model Store',
    type: 'ONNX / Scikit-Learn / PyTorch Model Weights',
    schema: ['model_id', 'hyperparameters', 'weights_tensor', 'decision_trees_json', 'feature_importances'],
    description: 'Houses pre-trained weight matrices for Decision Tree, Random Forest, SVM, ANN, and Ensemble architectures.',
  },
  {
    id: 'd4',
    code: 'D4',
    name: 'Policy Engine & Anomaly Threshold Rules',
    type: 'YAML Policy Configuration & Redis State',
    schema: ['rule_id', 'threat_type', 'threshold_tau', 'mitigation_action', 'whitelist_subnets'],
    description: 'Defines autonomous defense heuristics, confidence bounds, and automated remediation action matrices.',
  },
  {
    id: 'd5',
    code: 'D5',
    name: 'OpenFlow Switch Forwarding Table',
    type: 'Open vSwitch Hardware TCAM / Software Flow Table',
    schema: ['table_id', 'priority', 'match_fields', 'actions', 'cookie', 'idle_timeout'],
    description: 'Live OpenFlow flow entries installed in core switches governing packet forwarding, drops, and VLAN isolation.',
  },
  {
    id: 'd6',
    code: 'D6',
    name: 'Immutable SIEM Forensics & Audit Log',
    type: 'Elasticsearch / OpenSearch Append-Only Log Store',
    schema: ['event_id', 'timestamp', 'threat_class', 'confidence', 'mitigation_time_ms', 'pcap_snapshot_uri'],
    description: 'Cryptographically signed audit logs detailing detected intrusions, classification telemetry, and self-recovery performance.',
  },
];

const DFD_ENTITIES: DFDEntity[] = [
  {
    id: 'e1',
    name: 'External Ingress Clients & IoT Nodes',
    role: 'Traffic Ingress Originator',
    trafficType: 'Legitimate & Adversarial Packets',
    icon: 'server',
  },
  {
    id: 'e2',
    name: 'OpenFlow Hardware / Virtual Switches (s1–s3)',
    role: 'Forwarding Plane Execution',
    trafficType: 'Packet Filtering & Flow Control',
    icon: 'layers',
  },
  {
    id: 'e3',
    name: 'Network Operations (SOC Administrator)',
    role: 'Supervisory Control & Audit',
    trafficType: 'Policy Updates & Emergency Overrides',
    icon: 'shield',
  },
  {
    id: 'e4',
    name: 'Quarantine Honeypot Sinkhole',
    role: 'Deception & Forensics Capture',
    trafficType: 'Isolated Malicious Incursions',
    icon: 'terminal',
  },
];

export const DataFlowDiagram: React.FC = () => {
  const [activeDiagramLevel, setActiveDiagramLevel] = useState<'l0_context' | 'l1_detailed' | 'interactive_trace'>('l1_detailed');
  const [selectedProcess, setSelectedProcess] = useState<DFDProcess>(DFD_PROCESSES[2]); // Default to AI inference
  const [selectedStore, setSelectedStore] = useState<DFDDataStore | null>(null);
  const [isSimulatingTrace, setIsSimulatingTrace] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [testPayloadType, setTestPayloadType] = useState<'normal_http' | 'syn_flood' | 'port_scan' | 'sqli_rce'>('syn_flood');

  // Step-through animation when trace is playing
  useEffect(() => {
    if (!isSimulatingTrace) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % DFD_PROCESSES.length;
        setSelectedProcess(DFD_PROCESSES[next]);
        return next;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isSimulatingTrace]);

  const handleSelectProcess = (proc: DFDProcess, idx: number) => {
    setSelectedProcess(proc);
    setSelectedStore(null);
    setCurrentStepIndex(idx);
  };

  const handleSelectStore = (store: DFDDataStore) => {
    setSelectedStore(store);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto text-slate-200">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold uppercase">
              System Architecture Formalization
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-bold">
              DFD Levels 0 & 1
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Candidate: Sadek Subhan Sakib (IIUC)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Autonomous Network Threat Detection & Self-Healing Data Flow Diagram (DFD)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formal architectural representation of ingress telemetry processing, AI tensor classification, state decision mapping, and zero-touch OpenFlow remediation.
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            id="dfd-l0-tab-btn"
            onClick={() => setActiveDiagramLevel('l0_context')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeDiagramLevel === 'l0_context'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Level-0 Context Diagram
          </button>
          <button
            id="dfd-l1-tab-btn"
            onClick={() => setActiveDiagramLevel('l1_detailed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeDiagramLevel === 'l1_detailed'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Level-1 Detailed Architecture
          </button>
          <button
            id="dfd-trace-tab-btn"
            onClick={() => setActiveDiagramLevel('interactive_trace')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeDiagramLevel === 'interactive_trace'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Interactive Data Flow Trace
          </button>
        </div>
      </div>

      {/* VIEW 1: LEVEL-0 CONTEXT DIAGRAM */}
      {activeDiagramLevel === 'l0_context' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Level-0 Context Diagram: System Boundary & External Entities
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Depicts the entire AUTONOMA-X ecosystem as a single top-level system process interacting with external network agents, switches, administrators, and audit storage.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
              Process ID: 0.0 (AUTONOMA-X Core)
            </span>
          </div>

          {/* Graphical SVG / Box Diagram for Level 0 */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Entities (Inputs) */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 shadow-lg hover:border-cyan-400 transition-all">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase mb-1">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>External Entity 1: Traffic Sources</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Clients, IoT Gateways & Adversaries</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-cyan-400 bg-slate-950 p-2 rounded border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Raw Packet Stream / Ingress NetFlow</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 shadow-lg hover:border-indigo-400 transition-all">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase mb-1">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>External Entity 2: SOC Administrator</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Security Operations Supervisor</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-indigo-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Confidence Threshold &tau; & Policy Config</span>
                  </div>
                </div>
              </div>

              {/* Center Process 0.0 (The System) */}
              <div className="bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border-2 border-cyan-500/60 rounded-2xl p-6 shadow-2xl text-center space-y-3 relative">
                <div className="inline-block p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 shadow-inner">
                  <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
                  Central Process 0.0
                </div>
                <h4 className="text-base font-bold text-white">
                  AUTONOMA-X Autonomous Threat Detection & Self-Recovery System
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  Performs real-time telemetry extraction, ML tensor classification, closed-loop state decisions, OpenFlow drop rule synthesis, and microservice state restoration.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] font-mono">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                    Latency: &le; 140 ms
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-emerald-300">
                    Precision: 99.46%
                  </span>
                </div>
              </div>

              {/* Right Entities (Outputs & Actuation) */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 shadow-lg hover:border-emerald-400 transition-all">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase mb-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>External Entity 3: SDN OpenFlow Switches</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Mininet / Core Switches (s1, s2, s3)</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>OFP_FLOW_MOD Drop & Quarantine VLAN</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-lg hover:border-amber-400 transition-all">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase mb-1">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>External Entity 4: SIEM Forensics & Logs</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Elasticsearch / Audit Log Store</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-amber-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Incident Records & T_rec Latency Metrics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Context Formulation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              Mathematical Representation of Level-0 System Mapping
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Let <span className="text-cyan-300">S</span> be the autonomous system mapping function:
              <span className="block my-2 p-2 bg-slate-900 rounded border border-slate-800 text-cyan-300">
                S : (P_ingress, &tau;, M_weights, T_topology) &longrightarrow; (A_OpenFlow, L_SIEM, Q_VLAN)
              </span>
              Where incoming telemetry packet stream <span className="text-slate-200">&Phi;</span> is continuously evaluated against confidence threshold <span className="text-indigo-300">&tau; = 0.85</span> to output deterministic flow table modifications <span className="text-emerald-300">&Delta;F</span> within <span className="text-amber-300">T_rec &le; 140 ms</span>.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: LEVEL-1 DETAILED DATA FLOW DIAGRAM */}
      {activeDiagramLevel === 'l1_detailed' && (
        <div className="space-y-6">
          {/* Main Flow Pipeline Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Level-1 Detailed Architecture Pipeline (Processes 1.0 to 5.0)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any process or data store to inspect its algorithmic formulation, input/output tensors, and execution timing.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Selected Process:
                <strong className="text-white">{selectedProcess.number} {selectedProcess.name}</strong>
              </div>
            </div>

            {/* Interactive Process Pipeline Rail */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {DFD_PROCESSES.map((proc, index) => {
                const isSelected = selectedProcess.id === proc.id && !selectedStore;
                const isCurrent = currentStepIndex === index && isSimulatingTrace;

                return (
                  <button
                    key={proc.id}
                    id={`dfd-proc-card-${proc.id}`}
                    onClick={() => handleSelectProcess(proc, index)}
                    className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    } ${isCurrent ? 'ring-2 ring-emerald-400 bg-slate-900' : ''}`}
                  >
                    {/* Top Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        {proc.number}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {proc.latencyMs} ms
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight mb-1.5">
                        {proc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {proc.description}
                      </p>
                    </div>

                    {/* Footer badge */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 font-semibold uppercase">{proc.category}</span>
                      <span className="text-slate-500">{proc.inputs.length} in / {proc.outputs.length} out</span>
                    </div>

                    {/* Highlight indicator */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Data Stores Rail */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Architectural Data Stores (D1 – D6)
                </span>
                <span className="text-[11px] font-mono text-slate-500">Click to view table schema & persistence model</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {DFD_DATA_STORES.map((ds) => {
                  const isStoreSelected = selectedStore?.id === ds.id;
                  return (
                    <button
                      key={ds.id}
                      id={`dfd-store-card-${ds.id}`}
                      onClick={() => handleSelectStore(ds)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isStoreSelected
                          ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                          {ds.code}
                        </span>
                        <Database className="w-3 h-3 text-indigo-400" />
                      </div>
                      <div className="text-[11px] font-semibold truncate text-slate-200">{ds.name}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{ds.type}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Inspector Panel for Selected Process or Data Store */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Col: Mathematical & Transformation Specifications */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              {selectedStore ? (
                /* Data Store Inspector */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {selectedStore.code}
                      </span>
                      <h4 className="text-base font-bold text-white">{selectedStore.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-indigo-400">{selectedStore.type}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedStore.description}
                  </p>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                      Relational / Tensor Schema Definition
                    </h5>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5">
                      {selectedStore.schema.map((field, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-300 border-b border-slate-900 pb-1">
                          <span className="text-cyan-300">field_{i + 1}: &quot;{field}&quot;</span>
                          <span className="text-slate-500 text-[10px]">Indexed / Memory Resident</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Process Inspector */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        Process {selectedProcess.number}
                      </span>
                      <h4 className="text-base font-bold text-white">{selectedProcess.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                      Exec Time: {selectedProcess.latencyMs} ms
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedProcess.description}
                  </p>

                  {/* Mathematical Formulation */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider">
                      Algorithmic & Mathematical Formulation
                    </h5>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
                      <code>{selectedProcess.mathModel}</code>
                    </div>
                  </div>

                  {/* Input / Output Vectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <strong className="text-xs text-slate-400 uppercase font-mono block mb-1">
                        Ingress Inflows:
                      </strong>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {selectedProcess.inputs.map((inflow, i) => (
                          <li key={i} className="text-[11px] text-cyan-300">{inflow}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <strong className="text-xs text-slate-400 uppercase font-mono block mb-1">
                        Egress Outflows:
                      </strong>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {selectedProcess.outputs.map((outflow, i) => (
                          <li key={i} className="text-[11px] text-emerald-300">{outflow}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Live Data Stream Serialization Sample */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Live Telemetry Serialization Inspect
                </h4>
                <span className="text-[10px] font-mono text-slate-400">JSON-RPC / gRPC Payload</span>
              </div>

              {/* Sample Inbound Data */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 font-bold block">
                  &gt; INBOUND PAYLOAD TO PROCESS {selectedProcess.number}:
                </span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                  <pre>{JSON.stringify(selectedProcess.sampleInputData, null, 2)}</pre>
                </div>
              </div>

              {/* Sample Outbound Data */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                  &gt; OUTBOUND TRANSFORMED TENSOR:
                </span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-40">
                  <pre>{JSON.stringify(selectedProcess.sampleOutputData, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INTERACTIVE DATA FLOW TRACE & STEPPER */}
      {activeDiagramLevel === 'interactive_trace' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Interactive Ingress Packet Flow Simulator & DFD Stepper
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inject a sample attack or benign packet and watch the real-time data transformation cascade across all 5 DFD processes.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  id="trace-type-syn-btn"
                  onClick={() => setTestPayloadType('syn_flood')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    testPayloadType === 'syn_flood' ? 'bg-rose-900 text-rose-200' : 'text-slate-400'
                  }`}
                >
                  SYN Flood DoS
                </button>
                <button
                  id="trace-type-scan-btn"
                  onClick={() => setTestPayloadType('port_scan')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    testPayloadType === 'port_scan' ? 'bg-indigo-900 text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  Port Scan
                </button>
                <button
                  id="trace-type-http-btn"
                  onClick={() => setTestPayloadType('normal_http')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    testPayloadType === 'normal_http' ? 'bg-emerald-900 text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  Normal HTTP
                </button>
              </div>

              <button
                id="trace-play-btn"
                onClick={() => setIsSimulatingTrace(!isSimulatingTrace)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  isSimulatingTrace
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-cyan-950 border-cyan-600 text-cyan-300 hover:bg-cyan-900'
                }`}
              >
                {isSimulatingTrace ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulatingTrace ? 'Auto Stepping...' : 'Start Trace Run'}</span>
              </button>
            </div>
          </div>

          {/* Stepper Visualization */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {DFD_PROCESSES.map((proc, index) => {
                const isActive = currentStepIndex === index;
                const isPassed = currentStepIndex > index;

                return (
                  <div
                    key={proc.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-950 border-cyan-400 shadow-xl shadow-cyan-950/80 ring-2 ring-cyan-500'
                        : isPassed
                        ? 'bg-slate-950/90 border-emerald-500/50'
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400'
                      }`}>
                        Stage {index + 1}: {proc.number}
                      </span>
                      {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isActive && <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />}
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1">{proc.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{proc.description}</p>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>Exec: {proc.latencyMs} ms</span>
                      <span className={isActive ? 'text-cyan-400 font-bold' : ''}>
                        {isActive ? 'PROCESSING' : isPassed ? 'COMPLETE' : 'QUEUED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Step Transformation Details */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2">
                <span className="text-cyan-400 font-bold uppercase block text-[11px]">
                  &gt; Active Process Transformation Context
                </span>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                  <div><strong>Active Node:</strong> Process {DFD_PROCESSES[currentStepIndex].number} ({DFD_PROCESSES[currentStepIndex].name})</div>
                  <div><strong>Algorithm:</strong> <code>{DFD_PROCESSES[currentStepIndex].mathModel}</code></div>
                  <div><strong>Accumulated Delay:</strong> {(DFD_PROCESSES.slice(0, currentStepIndex + 1).reduce((a, b) => a + b.latencyMs, 0)).toFixed(2)} ms</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-emerald-400 font-bold uppercase block text-[11px]">
                  &gt; Simulated OpenFlow / System Directive
                </span>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-emerald-300 space-y-1">
                  <div><strong>Payload Vector:</strong> {testPayloadType.toUpperCase()}</div>
                  <div>
                    <strong>Action Dispatch:</strong> {
                      currentStepIndex >= 3
                        ? testPayloadType === 'normal_http'
                          ? 'OFPP_NORMAL (Forward)'
                          : 'OFP_FLOW_MOD (Drop Table-0 & Quarantine VLAN 99)'
                        : 'Evaluating in pipeline...'
                    }
                  </div>
                  <div><strong>Self-Healing State:</strong> {currentStepIndex === 4 ? 'RECOVERED & NOMINAL (138.2 ms)' : 'PROCESSING'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
