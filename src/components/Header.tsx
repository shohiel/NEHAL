import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FastForward,
  Info,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SystemStatusState } from '../types';

interface HeaderProps {
  systemStatus: SystemStatusState;
  isSimulating: boolean;
  simSpeed: number;
  onToggleSimulation: () => void;
  onStepSimulation: () => void;
  onChangeSimSpeed: (speed: number) => void;
  onResetNetwork: () => void;
  onToggleAutonomousMode: () => void;
  activeTab: 'testing_ground' | 'data_flow_diagram' | 'empirical_benchmarks' | 'methodology_doc';
  onSelectTab: (tab: 'testing_ground' | 'data_flow_diagram' | 'empirical_benchmarks' | 'methodology_doc') => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  isSimulating,
  simSpeed,
  onToggleSimulation,
  onStepSimulation,
  onChangeSimSpeed,
  onResetNetwork,
  onToggleAutonomousMode,
  activeTab,
  onSelectTab,
}) => {
  const getStatusBadge = () => {
    switch (systemStatus.state) {
      case 'healthy':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide shadow-xs shadow-emerald-950">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYSTEM HEALTHY (NOMINAL)</span>
          </div>
        );
      case 'attack_detected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-500/60 text-rose-300 text-xs font-semibold tracking-wide shadow-xs shadow-rose-950 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>THREAT DETECTED: {systemStatus.activeAttack?.category || 'ANOMALY'}</span>
          </div>
        );
      case 'remediating':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 text-xs font-semibold tracking-wide shadow-xs shadow-amber-950">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>SELF-HEALING PIPELINE ACTIVE</span>
          </div>
        );
      case 'restored':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 text-xs font-semibold tracking-wide shadow-xs shadow-cyan-950">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>AUTONOMOUS STATE RESTORED ({systemStatus.lastMitigationDurationMs}ms)</span>
          </div>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Academic Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-semibold text-cyan-400 uppercase tracking-wider text-[10px] bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded">
            <Cpu className="w-3 h-3 text-cyan-400" />
            IEEE Transactions Research Rig
          </span>
          <span className="text-slate-300 font-medium">International Islamic University Chittagong (IIUC)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Department of Computer Science & Engineering</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">
            Author: <strong className="text-slate-200">Sadek Subhan Sakib</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Supervisor: <strong className="text-slate-200">Mr. Abdullahil Kafi</strong> (Asst. Professor)
          </span>
        </div>
      </div>

      {/* Main Navigation and Controls Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg shadow-cyan-950 border border-cyan-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                AUTONOMA-X <span className="text-cyan-400 font-mono text-sm font-normal">v2.6-SDN</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Mininet + OpenFlow
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Driven Threat Detection & Self-Recovery Testing Ground for Autonomous Networks
            </p>
          </div>
        </div>

        {/* Center: System Status & Tabs */}
        <div className="flex items-center gap-3">
          {getStatusBadge()}

          <nav className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              id="tab-testing-ground-btn"
              onClick={() => onSelectTab('testing_ground')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'testing_ground'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Interactive Testing Ground
            </button>
            <button
              id="tab-dfd-btn"
              onClick={() => onSelectTab('data_flow_diagram')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'data_flow_diagram'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Data Flow Diagram (DFD)
            </button>
            <button
              id="tab-benchmarks-btn"
              onClick={() => onSelectTab('empirical_benchmarks')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'empirical_benchmarks'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Empirical Benchmark Matrix
            </button>
            <button
              id="tab-methodology-btn"
              onClick={() => onSelectTab('methodology_doc')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'methodology_doc'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Thesis Specification
            </button>
          </nav>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Autonomous Mode Toggle */}
          <button
            id="toggle-autonomous-mode-btn"
            onClick={onToggleAutonomousMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              systemStatus.mode === 'autonomous'
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/70'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="When active, the system automatically triggers SDN drop & host isolation without human operator intervention."
          >
            <Zap className={`w-3.5 h-3.5 ${systemStatus.mode === 'autonomous' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{systemStatus.mode === 'autonomous' ? 'AUTONOMOUS MODE' : 'MANUAL TRIAGE'}</span>
          </button>

          {/* Simulation Play/Pause */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              id="sim-play-pause-btn"
              onClick={onToggleSimulation}
              className={`p-1.5 rounded-md transition-colors ${
                isSimulating
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
              title={isSimulating ? 'Pause live packet stream' : 'Start live packet stream'}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              id="sim-step-btn"
              onClick={onStepSimulation}
              disabled={isSimulating}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 disabled:opacity-40"
              title="Step single packet tick"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 text-[11px] p-0.5 font-mono">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSimSpeed(speed)}
                className={`px-2 py-1 rounded transition-colors ${
                  simSpeed === speed ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            id="sim-reset-btn"
            onClick={onResetNetwork}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Network Topology & Telemetry"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
