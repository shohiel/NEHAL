import React from 'react';
import {
  BarChart3,
  BrainCircuit,
  Database,
  Layers,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  DATASET_CONFIGS,
  EMPIRICAL_BENCHMARK_RECORDS,
  FEATURE_IMPORTANCES,
  MODEL_CONFIGS,
} from '../data/benchmarkData';
import { DatasetId, MLModelId } from '../types';

interface ModelSelectorProps {
  activeModel: MLModelId;
  activeDataset: DatasetId;
  confidenceThreshold: number;
  onSelectModel: (model: MLModelId) => void;
  onSelectDataset: (dataset: DatasetId) => void;
  onChangeConfidenceThreshold: (threshold: number) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  activeModel,
  activeDataset,
  confidenceThreshold,
  onSelectModel,
  onSelectDataset,
  onChangeConfidenceThreshold,
}) => {
  const currentModel = MODEL_CONFIGS[activeModel];
  const currentDataset = DATASET_CONFIGS[activeDataset];

  const currentBenchmark = EMPIRICAL_BENCHMARK_RECORDS.find(
    (b) => b.modelId === activeModel && b.datasetId === activeDataset
  ) || EMPIRICAL_BENCHMARK_RECORDS[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              AI Threat Detection Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Select classifier architecture and benchmark training corpus
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
          Inference Engine Active
        </span>
      </div>

      {/* Dataset Selection */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Benchmark Dataset Corpus</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(DATASET_CONFIGS).map((ds) => (
            <button
              key={ds.id}
              id={`dataset-btn-${ds.id}`}
              onClick={() => onSelectDataset(ds.id as DatasetId)}
              className={`p-2 rounded-lg border text-left transition-all ${
                activeDataset === ds.id
                  ? 'bg-cyan-950/80 border-cyan-500/80 text-white shadow-sm ring-1 ring-cyan-500/50'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-cyan-300">{ds.name}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  {ds.year}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{ds.totalInstances}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Classifier Algorithm Model</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(MODEL_CONFIGS) as MLModelId[]).map((key) => {
            const m = MODEL_CONFIGS[key];
            const isSelected = activeModel === key;
            return (
              <button
                key={key}
                id={`model-btn-${key}`}
                onClick={() => onSelectModel(key)}
                className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950/90 to-slate-900 border-indigo-500/80 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {key === 'ENSEMBLE' && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-[8px] font-bold text-white px-1.5 py-0.2 rounded-bl">
                    SOTA
                  </div>
                )}
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>{m.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                  <span>Acc: {(EMPIRICAL_BENCHMARK_RECORDS.find(b => b.modelId === key && b.datasetId === activeDataset)?.accuracy || 98).toFixed(1)}%</span>
                  <span>•</span>
                  <span>Lat: {EMPIRICAL_BENCHMARK_RECORDS.find(b => b.modelId === key && b.datasetId === activeDataset)?.inferenceLatencyMs}ms</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Spec & Mathematical Profile */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 font-mono">
            {currentModel.fullName}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
            AUC: {currentBenchmark.auc}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {currentModel.description}
        </p>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">Precision</span>
            <span className="text-emerald-400 font-bold">{currentBenchmark.precision}%</span>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">Recall / TPR</span>
            <span className="text-cyan-400 font-bold">{currentBenchmark.recall}%</span>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">False Alarm (FPR)</span>
            <span className="text-amber-400 font-bold">{currentBenchmark.fpr}%</span>
          </div>
        </div>
      </div>

      {/* Decision Engine Confidence Threshold Slider */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Decision Engine Threshold (τ)</span>
          </label>
          <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/50">
            {confidenceThreshold.toFixed(2)} ({(confidenceThreshold * 100).toFixed(0)}%)
          </span>
        </div>
        <input
          id="confidence-threshold-slider"
          type="range"
          min="0.50"
          max="0.98"
          step="0.01"
          value={confidenceThreshold}
          onChange={(e) => onChangeConfidenceThreshold(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0.50 (High Recall / Aggressive)</span>
          <span>0.98 (High Precision / Low FPR)</span>
        </div>
      </div>

      {/* Feature Importance Ranking */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Extracted Flow Features</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">Information Gain</span>
        </div>
        <div className="space-y-1.5 pt-1">
          {FEATURE_IMPORTANCES.slice(0, 4).map((f, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[200px]">{f.feature}</span>
                <span className="text-cyan-400 font-bold">{(f.weight * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                  style={{ width: `${f.weight * 350}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
