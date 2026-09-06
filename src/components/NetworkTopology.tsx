import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  CheckCircle,
  Cpu,
  Database,
  Globe,
  Radio,
  RefreshCw,
  Router,
  Server,
  Shield,
  ShieldAlert,
  Sliders,
  Terminal,
  Zap,
} from 'lucide-react';
import { NetworkLink, NetworkNode, NodeType } from '../types';

interface NetworkTopologyProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onManualIsolateNode: (nodeId: string) => void;
  onManualReactivateNode: (nodeId: string) => void;
  isSimulating: boolean;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onManualIsolateNode,
  onManualReactivateNode,
  isSimulating,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'gateway':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'sdn_controller':
        return <Sliders className="w-5 h-5 text-indigo-400" />;
      case 'switch':
        return <Router className="w-5 h-5 text-blue-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-400" />;
      case 'database':
        return <Database className="w-5 h-5 text-amber-400" />;
      case 'iot':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'honeypot':
        return <Shield className="w-5 h-5 text-rose-400" />;
    }
  };

  const getNodeColorClasses = (status: NetworkNode['status']) => {
    switch (status) {
      case 'normal':
        return 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-cyan-500/70 hover:shadow-cyan-950/50';
      case 'suspicious':
        return 'border-amber-500/80 bg-amber-950/40 text-amber-200 animate-pulse shadow-amber-950/60';
      case 'compromised':
        return 'border-rose-500 bg-rose-950/80 text-rose-100 shadow-lg shadow-rose-950 animate-bounce-short';
      case 'quarantined':
        return 'border-purple-500/80 bg-purple-950/60 text-purple-200 opacity-90 ring-1 ring-purple-400/50';
      case 'healing':
        return 'border-cyan-400 bg-cyan-950/70 text-cyan-100 animate-pulse';
      case 'recovered':
        return 'border-emerald-500 bg-emerald-950/50 text-emerald-200';
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Topology Header */}
      <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Router className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Mininet Software-Defined Network Topology</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                13 Nodes | OpenFlow v1.3
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive SDN Open vSwitch mesh with live telemetry routing and autonomous quarantine enforcement
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Nominal
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Under Attack
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Quarantined
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sinkhole
          </span>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative flex-1 min-h-[460px] bg-slate-950 p-4 overflow-hidden select-none">
        {/* Ambient Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* SVG Interconnecting Links */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="link-grad-normal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="link-grad-attack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="link-grad-quarantined" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {links.map((link) => {
            const srcNode = nodes.find((n) => n.id === link.source);
            const tgtNode = nodes.find((n) => n.id === link.target);
            if (!srcNode || !tgtNode) return null;

            const isAttacked =
              srcNode.status === 'compromised' ||
              tgtNode.status === 'compromised' ||
              srcNode.status === 'suspicious' ||
              tgtNode.status === 'suspicious';

            const isQuarantined =
              srcNode.status === 'quarantined' || tgtNode.status === 'quarantined';

            const strokeColor = isAttacked
              ? 'url(#link-grad-attack)'
              : isQuarantined
              ? 'url(#link-grad-quarantined)'
              : 'url(#link-grad-normal)';

            const strokeWidth = isAttacked ? 3 : 1.5;
            const strokeDash = isQuarantined ? '4,4' : isAttacked ? '6,3' : 'none';

            return (
              <g key={link.id}>
                <line
                  x1={`${srcNode.x}%`}
                  y1={`${srcNode.y}%`}
                  x2={`${tgtNode.x}%`}
                  y2={`${tgtNode.y}%`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  className={isAttacked ? 'animate-pulse' : ''}
                />
                {/* Flow particle animation */}
                {isSimulating && (
                  <circle r={isAttacked ? 3 : 2} fill={isAttacked ? '#f43f5e' : '#38bdf8'}>
                    <animateMotion
                      dur={isAttacked ? '1.2s' : '2.5s'}
                      repeatCount="indefinite"
                      path={`M ${srcNode.x * 6} ${srcNode.y * 4.5} L ${tgtNode.x * 6} ${tgtNode.y * 4.5}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                id={`node-elem-${node.id}`}
                onClick={() => onSelectNode(node.id)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute cursor-pointer group transition-all duration-200 z-10`}
              >
                {/* Node Pill / Box */}
                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border shadow-md backdrop-blur-md transition-all ${getNodeColorClasses(
                    node.status
                  )} ${isSelected ? 'ring-2 ring-cyan-400 scale-105 shadow-cyan-950' : 'hover:scale-105'}`}
                >
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono tracking-tight text-white">
                        {node.name.split(' ')[0]}
                      </span>
                      {node.status === 'compromised' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      )}
                      {node.status === 'quarantined' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-900/80 text-purple-200 font-mono">
                          ISOLATED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{node.ip}</span>
                      <span className="text-slate-600">•</span>
                      <span className={node.cpuLoad > 60 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {node.cpuLoad}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtitle tag below */}
                <div className="text-center mt-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                    {node.name.includes('(') ? node.name.substring(node.name.indexOf('(')) : node.tier}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Telemetry Floating Card */}
        {selectedNode && (
          <div className="absolute bottom-3 right-3 w-80 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md z-20">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedNode.name}</h4>
                  <span className="text-[10px] font-mono text-cyan-400">{selectedNode.ip}</span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                  selectedNode.status === 'compromised'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : selectedNode.status === 'quarantined'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MAC Address</span>
                <span className="text-slate-200 text-[11px]">{selectedNode.mac}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CPU Core Load</span>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold ${
                      selectedNode.cpuLoad > 60 ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {selectedNode.cpuLoad}%
                  </span>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedNode.cpuLoad > 60 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${selectedNode.cpuLoad}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Throughput Rate</span>
                <span className="text-slate-200 text-[11px]">{selectedNode.trafficRateKbps} Kbps</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Dropped Packets</span>
                <span className="text-slate-200 text-[11px]">{selectedNode.droppedPackets} pkts</span>
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              {selectedNode.status === 'quarantined' ? (
                <button
                  id={`reactivate-node-btn-${selectedNode.id}`}
                  onClick={() => onManualReactivateNode(selectedNode.id)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore & Unquarantine
                </button>
              ) : (
                <button
                  id={`isolate-node-btn-${selectedNode.id}`}
                  onClick={() => onManualIsolateNode(selectedNode.id)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Isolate / Quarantine Node
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
