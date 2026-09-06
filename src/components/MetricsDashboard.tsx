import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  Award,
  BarChart2,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Layers,
  LineChart as LineChartIcon,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  CONFUSION_MATRICES,
  DATASET_CONFIGS,
  EMPIRICAL_BENCHMARK_RECORDS,
  MODEL_CONFIGS,
  ROC_CURVES,
} from '../data/benchmarkData';
import { BenchmarkRecord, DatasetId, MLModelId } from '../types';

interface MetricsDashboardProps {
  activeModel: MLModelId;
  activeDataset: DatasetId;
  realtimeTrafficData: Array<{ time: string; throughputKbps: number; anomalyScore: number }>;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  activeModel,
  activeDataset,
  realtimeTrafficData,
}) => {
  const [subTab, setSubTab] = useState<'matrix' | 'roc' | 'confusion' | 'latency' | 'realtime'>('matrix');
  const [filterDataset, setFilterDataset] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof BenchmarkRecord>('accuracy');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleExportCSV = () => {
    const headers = [
      'Model',
      'Dataset',
      'Accuracy (%)',
      'Precision (%)',
      'Recall (%)',
      'F1-Score (%)',
      'FPR (%)',
      'Inference Latency (ms)',
      'Recovery Time (ms)',
      'AUC',
    ];
    const rows = EMPIRICAL_BENCHMARK_RECORDS.map((r) => [
      r.modelName,
      r.datasetName,
      r.accuracy,
      r.precision,
      r.recall,
      r.f1Score,
      r.fpr,
      r.inferenceLatencyMs,
      r.meanRecoveryTimeMs,
      r.auc,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUTONOMA_X_Benchmark_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = EMPIRICAL_BENCHMARK_RECORDS.filter(
    (r) => filterDataset === 'all' || r.datasetId === filterDataset
  ).sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    }
    return 0;
  });

  const confusionData = CONFUSION_MATRICES[activeModel] || CONFUSION_MATRICES.RF;

  // Latency comparison data across models
  const latencyData = (Object.keys(MODEL_CONFIGS) as MLModelId[]).map((key) => {
    const rec = EMPIRICAL_BENCHMARK_RECORDS.find(
      (r) => r.modelId === key && r.datasetId === activeDataset
    ) || EMPIRICAL_BENCHMARK_RECORDS[0];
    return {
      model: MODEL_CONFIGS[key].name.split(' ')[0],
      inference: rec.inferenceLatencyMs,
      recovery: rec.meanRecoveryTimeMs,
    };
  });

  // ROC multi-line coordinates
  const rocPlotData = [
    { fpr: 0.0, ENSEMBLE: 0.0, RF: 0.0, ANN: 0.0, SVM: 0.0, DT: 0.0 },
    { fpr: 0.005, ENSEMBLE: 0.94, RF: 0.91, ANN: 0.86, SVM: 0.78, DT: 0.72 },
    { fpr: 0.015, ENSEMBLE: 0.988, RF: 0.975, ANN: 0.95, SVM: 0.91, DT: 0.86 },
    { fpr: 0.03, ENSEMBLE: 0.996, RF: 0.992, ANN: 0.982, SVM: 0.958, DT: 0.92 },
    { fpr: 0.07, ENSEMBLE: 0.999, RF: 0.998, ANN: 0.992, SVM: 0.978, DT: 0.96 },
    { fpr: 0.15, ENSEMBLE: 1.0, RF: 1.0, ANN: 0.998, SVM: 0.992, DT: 0.982 },
    { fpr: 0.3, ENSEMBLE: 1.0, RF: 1.0, ANN: 1.0, SVM: 1.0, DT: 0.996 },
    { fpr: 1.0, ENSEMBLE: 1.0, RF: 1.0, ANN: 1.0, SVM: 1.0, DT: 1.0 },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Empirical Performance Benchmarks & Theoretical Metrics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                10-Fold Cross Validated
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparative multi-model evaluation across NSL-KDD, CIC-IDS2017, and UNSW-NB15
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            id="subtab-matrix-btn"
            onClick={() => setSubTab('matrix')}
            className={`px-3 py-1 rounded-md transition-all ${
              subTab === 'matrix'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmark Matrix
          </button>
          <button
            id="subtab-roc-btn"
            onClick={() => setSubTab('roc')}
            className={`px-3 py-1 rounded-md transition-all ${
              subTab === 'roc'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ROC Curves (AUC)
          </button>
          <button
            id="subtab-confusion-btn"
            onClick={() => setSubTab('confusion')}
            className={`px-3 py-1 rounded-md transition-all ${
              subTab === 'confusion'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Confusion Matrix
          </button>
          <button
            id="subtab-latency-btn"
            onClick={() => setSubTab('latency')}
            className={`px-3 py-1 rounded-md transition-all ${
              subTab === 'latency'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recovery Latency (T_rec)
          </button>
          <button
            id="subtab-realtime-btn"
            onClick={() => setSubTab('realtime')}
            className={`px-3 py-1 rounded-md transition-all ${
              subTab === 'realtime'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Throughput
          </button>
        </div>
      </div>

      {/* Tab 1: Comprehensive Benchmark Matrix Table */}
      {subTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Filter Dataset:</span>
              <select
                id="filter-dataset-select"
                value={filterDataset}
                onChange={(e) => setFilterDataset(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-mono"
              >
                <option value="all">All Datasets (15 Evaluations)</option>
                <option value="NSL_KDD">NSL-KDD (Standard)</option>
                <option value="CIC_IDS2017">CIC-IDS2017 (Multi-day PCAP)</option>
                <option value="UNSW_NB15">UNSW-NB15 (Modern Synthesized)</option>
              </select>
            </div>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Benchmark CSV</span>
            </button>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Classifier Model</th>
                  <th className="py-2.5 px-3">Dataset Corpus</th>
                  <th className="py-2.5 px-3 text-right">Accuracy</th>
                  <th className="py-2.5 px-3 text-right">Precision</th>
                  <th className="py-2.5 px-3 text-right">Recall (TPR)</th>
                  <th className="py-2.5 px-3 text-right">F1-Score</th>
                  <th className="py-2.5 px-3 text-right">False Positive (FPR)</th>
                  <th className="py-2.5 px-3 text-right">Inference (T_inf)</th>
                  <th className="py-2.5 px-3 text-right">Self-Recovery (T_rec)</th>
                  <th className="py-2.5 px-3 text-right">AUC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r, i) => {
                  const isCurrentSelection =
                    r.modelId === activeModel && r.datasetId === activeDataset;
                  return (
                    <tr
                      key={i}
                      className={`hover:bg-slate-900/70 transition-colors ${
                        isCurrentSelection ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                        {r.modelId === 'ENSEMBLE' && (
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{r.modelName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{r.datasetName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {r.accuracy.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200">
                        {r.precision.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-cyan-300">
                        {r.recall.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200">
                        {r.f1Score.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-400">
                        {r.fpr.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {r.inferenceLatencyMs.toFixed(2)} ms
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                        {r.meanRecoveryTimeMs.toFixed(1)} ms
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-300">
                        {r.auc.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: ROC Curves */}
      {subTab === 'roc' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Receiver Operating Characteristic (ROC) — True Positive Rate vs False Positive Rate</span>
            <span className="font-mono text-cyan-400">Dataset: {DATASET_CONFIGS[activeDataset].name}</span>
          </div>

          <div className="h-[300px] w-full bg-slate-950 p-2 rounded-xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPlotData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="fpr"
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={[0, 0.3]}
                  label={{ value: 'False Positive Rate (FPR)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={[0.6, 1.0]}
                  label={{ value: 'True Positive Rate (TPR / Recall)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="ENSEMBLE" stroke="#38bdf8" strokeWidth={3} name="Ensemble (AUC 0.998)" dot={false} />
                <Line type="monotone" dataKey="RF" stroke="#34d399" strokeWidth={2} name="Random Forest (AUC 0.996)" dot={false} />
                <Line type="monotone" dataKey="ANN" stroke="#a78bfa" strokeWidth={2} name="ANN (AUC 0.991)" dot={false} />
                <Line type="monotone" dataKey="SVM" stroke="#fbbf24" strokeWidth={2} name="SVM (AUC 0.982)" dot={false} />
                <Line type="monotone" dataKey="DT" stroke="#f43f5e" strokeWidth={2} name="Decision Tree (AUC 0.968)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Multi-Class Confusion Matrix */}
      {subTab === 'confusion' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              5x5 Multi-Class Confusion Matrix for Model: <strong className="text-cyan-400">{MODEL_CONFIGS[activeModel].name}</strong>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Values represent test dataset instances</span>
          </div>

          <div className="overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center">
            <div className="inline-block">
              <div className="text-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Predicted Attack Class
              </div>
              <div className="flex items-center">
                <div className="text-xs font-bold text-slate-400 -rotate-90 uppercase tracking-wider mr-2">
                  Actual Class
                </div>
                <table className="border-collapse text-xs font-mono text-center">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      {confusionData.labels.map((l) => (
                        <th key={l} className="p-2 border border-slate-800 bg-slate-900 text-cyan-300 font-bold text-[11px]">
                          {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {confusionData.matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <th className="p-2 border border-slate-800 bg-slate-900 text-slate-300 font-bold text-[11px]">
                          {confusionData.labels[rIdx]}
                        </th>
                        {row.map((val, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <td
                              key={cIdx}
                              className={`p-3 border border-slate-800 font-bold ${
                                isDiagonal
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : val > 50
                                  ? 'bg-rose-950/70 text-rose-300'
                                  : val > 0
                                  ? 'bg-slate-900 text-amber-300'
                                  : 'text-slate-600'
                              }`}
                            >
                              {val.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Latency Breakdown Bar Chart */}
      {subTab === 'latency' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mean Self-Recovery Execution Latency ($T_rec$) Breakdown</span>
            <span className="font-mono text-cyan-400">Dataset: {DATASET_CONFIGS[activeDataset].name}</span>
          </div>

          <div className="h-[280px] w-full bg-slate-950 p-2 rounded-xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="model" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="recovery" fill="#38bdf8" name="Total Self-Recovery (T_rec ms)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inference" fill="#34d399" name="Inference Time (T_inf ms)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 5: Real-time Live Throughput Stream */}
      {subTab === 'realtime' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Real-time Ingress Network Throughput (Kbps) & Anomaly Probability</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live SDN Telemetry
            </span>
          </div>

          <div className="h-[280px] w-full bg-slate-950 p-2 rounded-xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realtimeTrafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="throughputKbps" stroke="#38bdf8" fillOpacity={1} fill="url(#colorThroughput)" name="Throughput (Kbps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
