import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { AttackPreset, RecoveryLog, RecoveryStage } from '../types';

interface RecoveryPipelineProps {
  stages: RecoveryStage[];
  logs: RecoveryLog[];
  isRemediating: boolean;
  totalTimeMs: number;
  activeAttack: AttackPreset | null;
  autonomousMode: boolean;
  onManualTriggerRemediation: () => void;
}

export const RecoveryPipeline: React.FC<RecoveryPipelineProps> = ({
  stages,
  logs,
  isRemediating,
  totalTimeMs,
  activeAttack,
  autonomousMode,
  onManualTriggerRemediation,
}) => {
  const [copied, setCopied] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'actions' | 'errors'>('all');

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [STAGE ${l.stageNumber}: ${l.stageName}] [${l.severity.toUpperCase()}] ${
            l.message
          } (Latency: ${l.latencyMs}ms)${l.rawTelemetry ? `\n   > ${l.rawTelemetry}` : ''}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'actions') return l.stageNumber >= 2;
    if (logFilter === 'errors') return l.severity === 'danger' || l.severity === 'warning';
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Autonomous Self-Recovery Engine</span>
              {totalTimeMs > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  T_rec: {totalTimeMs} ms
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              5-Stage Closed-Loop OpenFlow Interception & Microservice Rollback Pipeline
            </p>
          </div>
        </div>

        {/* Manual remediation trigger if manual mode */}
        {!autonomousMode && activeAttack && (
          <button
            id="manual-remediate-btn"
            onClick={onManualTriggerRemediation}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Self-Recovery</span>
          </button>
        )}
      </div>

      {/* 5-Stage Visual Workflow Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {stages.map((stage) => {
          const isCompleted = stage.status === 'completed';
          const isExecuting = stage.status === 'executing';

          return (
            <div
              key={stage.stageNumber}
              className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between relative overflow-hidden ${
                isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-xs'
                  : isExecuting
                  ? 'bg-amber-950/50 border-amber-400 text-amber-100 ring-2 ring-amber-400/50 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-900/80 text-emerald-300'
                        : isExecuting
                        ? 'bg-amber-900/80 text-amber-300'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    PHASE 0{stage.stageNumber}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isExecuting ? (
                    <Zap className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200 tracking-tight leading-snug">
                  {stage.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {stage.shortDesc}
                </p>
              </div>

              {stage.executionTimeMs > 0 && (
                <div className="mt-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                  <span>Latency:</span>
                  <span className="font-bold">{stage.executionTimeMs} ms</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time Telemetry & Execution Log Terminal */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col flex-1 min-h-[220px]">
        {/* Terminal Header */}
        <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-300 font-bold">
              Autonomous Recovery Execution Log
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              ({logs.length} telemetry entries)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px] font-mono">
              {(['all', 'actions', 'errors'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    logFilter === f ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              id="copy-logs-btn"
              onClick={handleCopyLogs}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              title="Copy trace to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Terminal Stream */}
        <div className="p-3 font-mono text-xs overflow-y-auto flex-1 max-h-[260px] space-y-2 bg-slate-950">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-6 text-[11px]">
              [Waiting for telemetry event... System in nominal monitoring state]
            </div>
          ) : (
            filteredLogs.map((log) => {
              const severityColor =
                log.severity === 'danger'
                  ? 'text-rose-400 bg-rose-950/40 border-rose-800/60'
                  : log.severity === 'warning'
                  ? 'text-amber-400 bg-amber-950/40 border-amber-800/60'
                  : log.severity === 'success'
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60'
                  : 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';

              return (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg border text-[11px] leading-relaxed transition-all ${severityColor}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] opacity-80 mb-0.5">
                    <span className="font-bold">
                      [{log.timestamp}] [PHASE {log.stageNumber}: {log.stageName}]
                    </span>
                    <span className="font-mono text-slate-400">Δt = +{log.latencyMs}ms</span>
                  </div>
                  <div className="text-slate-100">{log.message}</div>
                  {log.rawTelemetry && (
                    <div className="mt-1 p-1 bg-slate-900/90 rounded text-[10px] text-slate-300 font-mono border border-slate-800/80 overflow-x-auto">
                      <span className="text-cyan-500 font-bold">$ </span>
                      {log.rawTelemetry}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
