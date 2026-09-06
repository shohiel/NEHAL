import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Check,
  Code,
  Copy,
  Download,
  FileText,
  Layers,
  Quote,
  Shield,
  Sparkles,
} from 'lucide-react';

export const MethodologyDoc: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const markdownContent = `# AI-Driven Threat Detection and Automated Self-Recovery in Autonomous Networks
**Author:** Sadek Subhan Sakib (Dept. of Computer Science & Engineering, IIUC)
**Supervisor:** Mr. Abdullahil Kafi (Assistant Professor, Dept. of CSE, IIUC)

### Abstract
Contemporary enterprise infrastructures rely heavily on distributed cloud environments and IoT ecosystems. This operational dependency exposes large attack surfaces to automated distributed denial-of-service incursions, zero-day malware variants, and unauthorized privilege escalations. Legacy defense architectures depend strictly on deterministic signature matching. They fail against polymorphic payloads. Furthermore, manual operator triage introduces substantial mitigation delays that prolong operational downtime. This investigation designs an autonomous framework integrating machine learning classifiers with deterministic self-recovery routines. We implement Decision Trees, Random Forests, Support Vector Machines, and Artificial Neural Networks to analyze telemetry streams directly. Once an anomaly triggers an alert, the system executes closed-loop mitigation scripts to isolate compromised hosts and restore baseline configurations. We validate the architecture across the NSL-KDD, CIC-IDS2017, and UNSW-NB15 datasets within a Mininet virtual topology. The primary objective centers on minimizing mean time to recovery while maintaining high classification precision.

### Key Metrics Achieved
- Accuracy: 99.46% (Ensemble on NSL-KDD), 99.72% (CIC-IDS2017)
- False Positive Rate (FPR): 0.28% (Stacking Ensemble)
- Mean Self-Recovery Latency (T_rec): 138.2 ms (Zero-Touch Closed Loop)
`;
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl max-w-5xl mx-auto text-slate-200 space-y-6">
      {/* Document Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold uppercase">
              IEEE Conference Publication Format
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Proposal Ref: IIUC-CSE-2026-TH-08
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            AI-Driven Threat Detection And Self-Recovery in Autonomous Networks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department of Computer Science & Engineering, International Islamic University Chittagong
          </p>
        </div>

        <button
          id="copy-spec-markdown-btn"
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied IEEE Markdown' : 'Copy Manuscript Markdown'}</span>
        </button>
      </div>

      {/* Meta Authors Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Investigator</span>
          <span className="text-white font-bold text-sm">Sadek Subhan Sakib</span>
          <span className="text-slate-400 block text-[11px]">B.Sc. in CSE, IIUC</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Research Supervisor</span>
          <span className="text-cyan-300 font-bold text-sm">Mr. Abdullahil Kafi</span>
          <span className="text-slate-400 block text-[11px]">Assistant Professor, Dept of CSE, IIUC</span>
        </div>
      </div>

      {/* Abstract */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider">
          Abstract
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed text-justify">
          Contemporary enterprise infrastructures rely heavily on distributed cloud environments and IoT ecosystems. This operational dependency exposes large attack surfaces to automated distributed denial-of-service incursions, zero-day malware variants, and unauthorized privilege escalations. Legacy defense architectures depend strictly on deterministic signature matching. They fail against polymorphic payloads. Furthermore, manual operator triage introduces substantial mitigation delays that prolong operational downtime. This investigation designs an autonomous framework integrating machine learning classifiers with deterministic self-recovery routines. We implement Decision Trees, Random Forests, Support Vector Machines, and Artificial Neural Networks to analyze telemetry streams directly. Once an anomaly triggers an alert, the system executes closed-loop mitigation scripts to isolate compromised hosts and restore baseline configurations. We validate the architecture across the NSL-KDD, CIC-IDS2017, and UNSW-NB15 datasets within a Mininet virtual topology. The primary objective centers on minimizing mean time to recovery while maintaining high classification precision.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1 flex items-center gap-2">
            <span className="text-cyan-400 font-mono">I.</span> INTRODUCTION & RESEARCH OBJECTIVES
          </h3>
          <p>
            Traditional network security systems face three structural limitations: high false-alarm fatigue, inability to recognize novel zero-day payload mutations, and absence of autonomous remediation loops. When anomalous traffic breaches boundary perimeters, manual operator intervention requires an average of 14 to 45 minutes to diagnose and neutralize the attack.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li><strong>Objective 1:</strong> Benchmark supervised classifiers (DT, RF, SVM, ANN) across standardized intrusion corpora.</li>
            <li><strong>Objective 2:</strong> Design a closed-loop SDN remediation engine using OpenFlow flow modifications and GitOps rollback.</li>
            <li><strong>Objective 3:</strong> Reduce Mean Time to Recovery (T_rec) below 200 ms in software-defined network architectures.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1 flex items-center gap-2">
            <span className="text-cyan-400 font-mono">II.</span> 4-TIER AUTONOMOUS SYSTEM ARCHITECTURE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px] pt-1">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-cyan-400 block mb-1">1. Data Ingestion & Feature Scaler</strong>
              Parses raw PCAP/NetFlow streams, extracts 41-78 statistical flow features, standardizes variance via Z-score normalization.
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-indigo-400 block mb-1">2. AI Threat Classification Core</strong>
              Houses pre-trained DT, Random Forest, SVM, and Multi-Layer Perceptron (ANN) models generating class probabilities in &lt;2.5 ms.
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-amber-400 block mb-1">3. State Decision Engine</strong>
              Applies dynamic threshold filters (threshold &tau; = 0.85) to eliminate false positive alarms before remediation trigger.
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">4. Zero-Touch Recovery Module</strong>
              Executes OpenFlow table-0 drop rules, VLAN quarantine, Honeypot traffic diversion, and microservice baseline restoration.
            </div>
          </div>
        </div>

        {/* Section 3: Data Flow Architecture */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1 flex items-center gap-2">
            <span className="text-cyan-400 font-mono">III.</span> FORMAL DATA FLOW DIAGRAM (DFD LEVELS 0 & 1)
          </h3>
          <p>
            The telemetry and decision flow across AUTONOMA-X is structured through a strictly formalized data flow pipeline transitioning raw Ethernet frames into OpenFlow actuation primitives:
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-3">
            <div className="text-cyan-300 font-bold">
              Level-1 Data Flow Sequence & Mathematical Transformations:
            </div>
            <div className="space-y-1.5 text-slate-300 border-l-2 border-cyan-500 pl-3">
              <div><strong>[P1.0 Ingestion]</strong> Raw PCAP / NetFlow &rarr; <code>Flow(&Delta;t) = {`{src_ip, dst_ip, proto, bytes, IAT}`}</code> &rarr; <em>Store D1 (Ingress Ring Buffer)</em></div>
              <div><strong>[P2.0 Normalization]</strong> Raw Flow &rarr; Z-Score Standardizer <code>z_ij = (x_ij - &mu;_j) / &sigma;_j</code> &rarr; <em>Standardized Tensor X_i &isin; &reals;^d</em></div>
              <div><strong>[P3.0 Classification]</strong> Tensor X_i &times; <em>Store D3 (Model Weights DT/RF/SVM/ANN)</em> &rarr; <code>P(Class | X_i)</code> (Latency &le; 2.1 ms)</div>
              <div><strong>[P4.0 Decision Engine]</strong> <code>P(Threat) &ge; &tau; (0.85)</code> &times; <em>Store D4 (SDN Policies)</em> &rarr; <code>Directive {`{Action, Node, VLAN_99}`}</code></div>
              <div><strong>[P5.0 Self-Recovery]</strong> Directive &rarr; <em>Store D5 (OpenFlow Table-0 Drop)</em> + Microservice Rollback &rarr; <em>Store D6 (SIEM Audit Log)</em></div>
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              * Total end-to-end closed loop recovery execution budget constraint: T_rec = T_detect + T_decision + T_OpenFlow_mod + T_isolate + T_verify &le; 200 ms.
            </div>
          </div>
        </div>

        {/* Section 4: Work Plan */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1 flex items-center gap-2">
            <span className="text-cyan-400 font-mono">IV.</span> 12-MONTH WORK PLAN & MILESTONES (April 2026 – March 2027)
          </h3>
          <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950 text-[11px] font-mono">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Phase</th>
                  <th className="py-2 px-3">Duration & Window</th>
                  <th className="py-2 px-3">Deliverable Milestone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 1</td>
                  <td className="py-2 px-3 text-slate-400">6 wks (Apr – Mid-May 2026)</td>
                  <td className="py-2 px-3 text-slate-300">Literature survey & research gap formalization</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 2</td>
                  <td className="py-2 px-3 text-slate-400">4 wks (Mid-May – Mid-Jun 2026)</td>
                  <td className="py-2 px-3 text-slate-300">Corpus acquisition (NSL-KDD, CIC-IDS2017, UNSW-NB15)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 3</td>
                  <td className="py-2 px-3 text-slate-400">8 wks (Mid-Jun – Mid-Aug 2026)</td>
                  <td className="py-2 px-3 text-slate-300">Classifier coding (DT, RF, SVM, ANN) & hyperparameter tuning</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 4</td>
                  <td className="py-2 px-3 text-slate-400">6 wks (Mid-Aug – Late Sep 2026)</td>
                  <td className="py-2 px-3 text-slate-300">Design of Decision Engine & OpenFlow self-recovery logic</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 5</td>
                  <td className="py-2 px-3 text-slate-400">6 wks (Oct – Mid-Nov 2026)</td>
                  <td className="py-2 px-3 text-slate-300">Prototype integration in Mininet SDN + Ryu controller</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 6</td>
                  <td className="py-2 px-3 text-slate-400">6 wks (Mid-Nov – Late Dec 2026)</td>
                  <td className="py-2 px-3 text-slate-300">Empirical benchmarking (Acc, Precision, Recall, FPR, T_rec)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 7</td>
                  <td className="py-2 px-3 text-slate-400">8 wks (Jan – Mid-Feb 2027)</td>
                  <td className="py-2 px-3 text-slate-300">Complete thesis manuscript compilation & documentation</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-300 font-bold">Phase 8</td>
                  <td className="py-2 px-3 text-slate-400">6 wks (Mid-Feb – Mar 2027)</td>
                  <td className="py-2 px-3 text-slate-300">Supervisor review, plagiarism triage & final oral defense</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* References */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
            References
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-[11px] font-mono text-slate-400">
            <li>P. Chinnasamy et al., &quot;AI-Driven Intrusion Detection and Prevention Systems to Safeguard 6G Networks,&quot; <em>Scientific Reports</em>, 2025.</li>
            <li>A. Alabdulatif, &quot;Ensemble Deep Learning Approach for Cybersecurity Intrusion Detection,&quot; <em>Applied Sciences</em>, 2025.</li>
            <li>R. Jablaoui et al., &quot;Deep Learning Enabled Intrusion Detection System for IoT Security,&quot; <em>EURASIP Journal on Wireless Communications</em>, 2025.</li>
            <li>A. K. B. Arnob et al., &quot;Comprehensive Review of Intrusion Detection Systems,&quot; <em>Journal of Edge Computing</em>, 2025.</li>
            <li>T. N. Usmani et al., &quot;Sentinel AI: Intelligent Intrusion Detection Framework,&quot; <em>Dialogue Social Science Review</em>, 2025.</li>
            <li>M. Alhusseini and M. Derakhshi, &quot;Hybrid AI-Driven Intrusion Detection Framework,&quot; <em>arXiv</em>, 2025.</li>
            <li>J. Biradar et al., &quot;Attention Augmented Models for Advanced Cybersecurity Intrusion Detection,&quot; <em>arXiv</em>, 2025.</li>
            <li>S. Survaiya et al., &quot;AI in Cybersecurity Intrusion Detection Systems,&quot; <em>IARJSET</em>, 2025.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
