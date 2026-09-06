import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Flame,
  Gauge,
  Play,
  Radio,
  RefreshCw,
  Server,
  ShieldAlert,
  Sliders,
  Square,
  Zap,
} from 'lucide-react';
import { ATTACK_PRESETS } from '../data/benchmarkData';
import { AttackPreset, NetworkNode } from '../types';

interface AttackSandboxProps {
  activeAttack: AttackPreset | null;
  nodes: NetworkNode[];
  onInjectAttack: (attack: AttackPreset) => void;
  onStopAttack: () => void;
  isSimulating: boolean;
}

export const AttackSandbox: React.FC<AttackSandboxProps> = ({
  activeAttack,
  nodes,
  onInjectAttack,
  onStopAttack,
  isSimulating,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ATTACK_PRESETS[0].id);
  const [customPacketRate, setCustomPacketRate] = useState<number>(3500);
  const [customEntropy, setCustomEntropy] = useState<number>(0.92);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customTargetId, setCustomTargetId] = useState<string>('node_web_01');

  const selectedPreset =
    ATTACK_PRESETS.find((p) => p.id === selectedPresetId) || ATTACK_PRESETS[0];

  const handleLaunchCurrentPreset = () => {
    onInjectAttack({
      ...selectedPreset,
      defaultPacketRate: customPacketRate || selectedPreset.defaultPacketRate,
      entropy: customEntropy || selectedPreset.entropy,
    });
  };

  const handleLaunchCustom = () => {
    const targetNode = nodes.find((n) => n.id === customTargetId);
    const customAttack: AttackPreset = {
      id: `custom_${Date.now()}`,
      name: 'Custom Parameterized Vector',
      category: 'DoS / DDoS',
      description: 'Arbitrarily configured adversarial network vector with custom packet injection rate and payload entropy.',
      targetNodeId: customTargetId,
      targetNodeName: targetNode?.name || 'Custom Target',
      defaultPacketRate: customPacketRate,
      protocol: 'TCP',
      dstPort: 443,
      entropy: customEntropy,
      affectedNodes: ['node_gw', 'node_s1', customTargetId],
      signature: `CUSTOM_VECTOR: rate=${customPacketRate}pps, entropy=${customEntropy}, target=${customTargetId}`,
    };
    onInjectAttack(customAttack);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Adversarial Attack Sandbox
            </h3>
            <p className="text-[11px] text-slate-400">
              Inject synthetic intrusion payloads into Mininet SDN topology
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            id="tab-preset-attacks-btn"
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'presets'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets (6)
          </button>
          <button
            id="tab-custom-attack-btn"
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'custom'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Vector
          </button>
        </div>
      </div>

      {/* Preset Attacks Grid */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ATTACK_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const isCurrentlyActive = activeAttack?.id === preset.id;

              return (
                <button
                  key={preset.id}
                  id={`preset-attack-btn-${preset.id}`}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setCustomPacketRate(preset.defaultPacketRate);
                    setCustomEntropy(preset.entropy);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all relative ${
                    isCurrentlyActive
                      ? 'bg-rose-950/90 border-rose-500 text-rose-100 ring-2 ring-rose-500/70 shadow-lg shadow-rose-950'
                      : isSelected
                      ? 'bg-slate-950 border-rose-800/80 text-white ring-1 ring-rose-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 truncate pr-2">
                      {preset.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                        preset.category.includes('DoS')
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : preset.category.includes('Probe')
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : preset.category.includes('Zero')
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-orange-950 text-orange-300 border border-orange-800'
                      }`}
                    >
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                    <span>Target: {preset.targetNodeName.split(' ')[0]}</span>
                    <span>•</span>
                    <span>{preset.defaultPacketRate} pps</span>
                    <span>•</span>
                    <span>{preset.protocol}:{preset.dstPort}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Attack Specs Details */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Signature Vector Payload:</span>
              <span className="text-rose-400 text-[11px]">{selectedPreset.signature}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
              <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Packet Injection Rate</span>
                <span className="text-rose-400 font-bold">{customPacketRate} pps</span>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Payload Entropy</span>
                <span className="text-amber-400 font-bold">{customEntropy} (High)</span>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Target Victim Node</span>
                <span className="text-cyan-400 font-bold truncate block">
                  {selectedPreset.targetNodeName}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Vector Builder Tab */}
      {activeTab === 'custom' && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold mb-1 block">Victim Target Node</label>
            <select
              id="custom-target-select"
              value={customTargetId}
              onChange={(e) => setCustomTargetId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs font-mono"
            >
              {nodes
                .filter((n) => n.tier === 'workload' || n.tier === 'core')
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.ip}) - {n.tier.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Traffic Flood Rate (pps)</span>
              <span className="font-mono text-rose-400 font-bold">{customPacketRate} pps</span>
            </div>
            <input
              id="custom-packet-rate-slider"
              type="range"
              min="100"
              max="10000"
              step="100"
              value={customPacketRate}
              onChange={(e) => setCustomPacketRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Payload Shannon Entropy</span>
              <span className="font-mono text-amber-400 font-bold">{customEntropy}</span>
            </div>
            <input
              id="custom-entropy-slider"
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={customEntropy}
              onChange={(e) => setCustomEntropy(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* Main Trigger Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
        {activeAttack ? (
          <button
            id="stop-attack-btn"
            onClick={onStopAttack}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-all"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>HALT ATTACK INCURSION & FLUSH FLOWS</span>
          </button>
        ) : (
          <button
            id="launch-attack-btn"
            onClick={activeTab === 'presets' ? handleLaunchCurrentPreset : handleLaunchCustom}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span>INJECT ADVERSARIAL ATTACK VECTOR</span>
          </button>
        )}
      </div>
    </div>
  );
};
