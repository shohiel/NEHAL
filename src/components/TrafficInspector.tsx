import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Eye,
  Filter,
  Layers,
  Radio,
  Search,
  ShieldAlert,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import { PacketFlow } from '../types';

interface TrafficInspectorProps {
  packets: PacketFlow[];
  totalAnalyzed: number;
  totalThreats: number;
}

export const TrafficInspector: React.FC<TrafficInspectorProps> = ({
  packets,
  totalAnalyzed,
  totalThreats,
}) => {
  const [selectedPacket, setSelectedPacket] = useState<PacketFlow | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredPackets = packets.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.srcIp.includes(searchTerm) ||
      p.dstIp.includes(searchTerm) ||
      p.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.predictedClass.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === 'all' ||
      (actionFilter === 'threats' && p.isAttack) ||
      (actionFilter === 'dropped' && p.action === 'dropped') ||
      (actionFilter === 'quarantined' && p.action === 'quarantined');

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: PacketFlow['action']) => {
    switch (action) {
      case 'forwarded':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[10px] font-semibold">
            FORWARD
          </span>
        );
      case 'dropped':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-800 text-rose-300 font-mono text-[10px] font-bold">
            DROP (OVS)
          </span>
        );
      case 'quarantined':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-950/90 border border-purple-800 text-purple-300 font-mono text-[10px] font-bold">
            QUARANTINE
          </span>
        );
      case 'diverted_to_honeypot':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-950/90 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
            HONEYPOT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
            ANALYZING
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      {/* Header & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Live Ingress Packet Telemetry Stream</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                PCAP Ingestion
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Extracted flow feature vectors evaluated against classification models
            </p>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 mr-1.5">Flows Analyzed:</span>
            <span className="text-cyan-400 font-bold">{totalAnalyzed.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 mr-1.5">Threat Incursions:</span>
            <span className="text-rose-400 font-bold">{totalThreats}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="packet-search-input"
            type="text"
            placeholder="Search by IP, Protocol, or Attack Signature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          {(['all', 'threats', 'dropped', 'quarantined'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActionFilter(mode)}
              className={`px-2 py-0.5 rounded capitalize ${
                actionFilter === mode ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Packet Table Stream */}
      <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/80 max-h-[300px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Protocol</th>
              <th className="py-2 px-3">Source Socket</th>
              <th className="py-2 px-3">Destination Socket</th>
              <th className="py-2 px-3">Size (B)</th>
              <th className="py-2 px-3">Anomaly Score</th>
              <th className="py-2 px-3">Classifier Output</th>
              <th className="py-2 px-3">SDN Action</th>
              <th className="py-2 px-2 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredPackets.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-600 text-xs font-sans">
                  No packets match criteria. Live flow generator active.
                </td>
              </tr>
            ) : (
              filteredPackets.slice(0, 30).map((pkt) => (
                <tr
                  key={pkt.id}
                  className={`hover:bg-slate-900/60 transition-colors ${
                    pkt.isAttack ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        pkt.protocol === 'TCP'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                          : pkt.protocol === 'UDP'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                          : pkt.protocol === 'SSH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pkt.protocol}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300 text-[11px]">
                    {pkt.srcIp}:{pkt.srcPort}
                  </td>
                  <td className="py-2 px-3 text-slate-300 text-[11px]">
                    {pkt.dstIp}:{pkt.dstPort}
                  </td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">
                    {pkt.srcBytes + pkt.dstBytes} B
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold ${
                          pkt.anomalyScore > 0.8
                            ? 'text-rose-400'
                            : pkt.anomalyScore > 0.5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {pkt.anomalyScore.toFixed(3)}
                      </span>
                      <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            pkt.anomalyScore > 0.8
                              ? 'bg-rose-500'
                              : pkt.anomalyScore > 0.5
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pkt.anomalyScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[11px] font-sans font-medium truncate block max-w-[170px] ${
                        pkt.isAttack ? 'text-rose-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {pkt.predictedClass}
                    </span>
                  </td>
                  <td className="py-2 px-3">{getActionBadge(pkt.action)}</td>
                  <td className="py-2 px-2 text-center">
                    <button
                      id={`inspect-pkt-btn-${pkt.id}`}
                      onClick={() => setSelectedPacket(pkt)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Inspect extracted feature dimensions"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Deep Feature Vector Inspector Modal */}
      {selectedPacket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Flow Feature Vector Inspector</h4>
                  <span className="text-[10px] font-mono text-slate-400">{selectedPacket.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPacket(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Protocol & Sockets</span>
                <span className="text-cyan-400 font-bold">
                  {selectedPacket.protocol} ({selectedPacket.srcPort} → {selectedPacket.dstPort})
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Anomaly Probability</span>
                <span className="text-rose-400 font-bold">
                  {(selectedPacket.anomalyScore * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Connection Duration</span>
                <span className="text-slate-200 font-bold">{selectedPacket.durationMs} ms</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Source Payload (src_bytes)</span>
                <span className="text-slate-200 font-bold">{selectedPacket.srcBytes} B</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Dest Payload (dst_bytes)</span>
                <span className="text-slate-200 font-bold">{selectedPacket.dstBytes} B</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Burst Count (count)</span>
                <span className="text-slate-200 font-bold">{selectedPacket.packetCount}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">same_srv_rate</span>
                <span className="text-slate-200 font-bold">{selectedPacket.sameSrvRate}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">dst_host_diff_srv_rate</span>
                <span className="text-slate-200 font-bold">{selectedPacket.dstHostDiffSrvRate}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Classification Decision</span>
                <span className="text-emerald-400 font-bold">{selectedPacket.predictedClass}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPacket(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
