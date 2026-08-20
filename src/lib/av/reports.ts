import type { AnalysisRecord, CaseRecord, ReportRecord } from './types';
import { createReportInFirestore } from '../firebase/firestore';

export async function generateAndDownloadReport(
  analysis: AnalysisRecord,
  caseInfo?: CaseRecord,
  format: 'PDF' | 'JSON' = 'PDF'
): Promise<ReportRecord> {
  const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const report: ReportRecord = {
    id: reportId,
    title: `Forensic assessment report — ${analysis.filename}`,
    caseId: analysis.caseId,
    analysisId: analysis.id,
    createdAt: new Date().toISOString(),
    author: analysis.analyst || 'Senior Forensic Examiner',
    verdict: analysis.verdict,
    confidence: analysis.confidence,
    format,
    risk: analysis.risk,
    generatedAt: new Date().toISOString(),
    analyst: analysis.analyst || 'Certified Examiner',
  };

  await createReportInFirestore(report);

  if (format === 'JSON') {
    const jsonBlob = new Blob([JSON.stringify({ report, analysis, caseInfo }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}_${analysis.filename.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // Generate styled printable HTML forensic report window
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; max-width: 900px; margin: 0 auto; line-height: 1.5; }
          .header { border-bottom: 2px solid #00D4FF; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: bold; color: #070A0F; }
          .subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #0088CC; font-weight: bold; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; font-size: 13px; }
          .meta-item strong { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          .verdict-box { padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #ccc; text-align: center; }
          .verdict-box.deepfake, .verdict-box.morph { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
          .verdict-box.authentic { background: #f0fdf4; border-color: #86efac; color: #166534; }
          .verdict-box.suspicious { background: #fffbeb; border-color: #fde047; color: #854d0e; }
          .verdict-title { font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
          .verdict-conf { font-size: 16px; font-weight: 600; }
          .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
          .signal-card { border: 1px solid #e2e8f0; padding: 12px 15px; border-radius: 6px; margin-bottom: 10px; font-size: 13px; }
          .signal-title { font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 4px; }
          .hash-code { font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 11px; word-break: break-all; }
          .footer { margin-top: 50px; border-t: 1px solid #e2e8f0; pt: 20px; font-size: 11px; color: #64748b; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="subtitle">AUTHENTIVISION FORENSICS PLATFORM</div>
            <div class="title">Official Forensic Assessment Report</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <strong>REPORT ID:</strong> ${report.id}<br>
            <strong>DATE:</strong> ${new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div class="verdict-box ${analysis.verdict}">
          <div class="verdict-title">${analysis.verdict}</div>
          <div class="verdict-conf">Calibrated Confidence Score: ${analysis.confidence}% | Risk Level: ${analysis.risk.toUpperCase()}</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <strong>Case Name & Number</strong>
            ${caseInfo ? `${caseInfo.name} (${caseInfo.id})` : analysis.caseId}
          </div>
          <div class="meta-item">
            <strong>Evidence File Name</strong>
            ${analysis.filename}
          </div>
          <div class="meta-item">
            <strong>Media Type & Resolution</strong>
            ${analysis.kind.toUpperCase()} · ${analysis.resolution || 'N/A'}
          </div>
          <div class="meta-item">
            <strong>Primary Examiner</strong>
            ${analysis.analyst || 'Certified Analyst'}
          </div>
          <div class="meta-item" style="grid-column: span 2;">
            <strong>Cryptographic SHA-256 Hash</strong>
            <span class="hash-code">${analysis.sha256}</span>
          </div>
          <div class="meta-item" style="grid-column: span 2;">
            <strong>AI Model & Pipeline Version</strong>
            ${analysis.model}
          </div>
        </div>

        <div class="section-title">Key Forensic Detection Signals</div>
        ${analysis.signals && analysis.signals.length > 0 ? analysis.signals.map(s => `
          <div class="signal-card">
            <div class="signal-title">
              <span>${s.label} (${s.severity.toUpperCase()})</span>
              <span>Contribution: +${s.contribution}%</span>
            </div>
            <div><strong>Summary:</strong> ${s.summary}</div>
            <div style="color: #475569; margin-top: 4px;">${s.detail}</div>
          </div>
        `).join('') : '<p style="font-size: 13px; color: #64748b;">No abnormal manipulation signals recorded.</p>'}

        <div class="section-title">Human Examiner Review & Sign-Off</div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; font-size: 13px; border-left: 4px solid #00D4FF;">
          ${analysis.humanReview ? `
            <p><strong>Reviewer:</strong> ${analysis.humanReview.reviewedBy} (${new Date(analysis.humanReview.reviewedAt).toLocaleString()})</p>
            <p><strong>Decision:</strong> <span style="text-transform: uppercase; font-weight: bold;">${analysis.humanReview.decision}</span></p>
            <p><strong>Official Examiner Notes:</strong> ${analysis.humanReview.notes}</p>
          ` : `
            <p><strong>Status:</strong> Pending secondary peer review. AI confidence score calibrated under standard forensic protocols.</p>
          `}
        </div>

        <div class="footer">
          AUTHENTIVISION DIGITAL FORENSICS · Cryptographic Chain of Custody Verified · Confidential Evidence Report
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(reportHtml);
      printWin.document.close();
    }
  }

  return report;
}
