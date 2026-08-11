import type { Analysis, Case, Evidence, SystemComponent, Notification } from '../types';

export const DEMO_TAG = 'DEMO DATA';

export const recentAnalyses: Analysis[] = [
  { id: 'AV-2026-00481', caseId: 'CASE-0092', filename: 'interview_clip.mp4', mediaType: 'video', verdict: 'deepfake', confidence: 97.4, risk: 'critical', analyzedAt: '2 min ago', status: 'complete', analyst: 'M. Okonkwo' },
  { id: 'AV-2026-00480', caseId: 'CASE-0091', filename: 'press_conference.mp4', mediaType: 'video', verdict: 'authentic', confidence: 94.1, risk: 'low', analyzedAt: '18 min ago', status: 'complete', analyst: 'S. Reyes' },
  { id: 'AV-2026-00479', caseId: 'CASE-0090', filename: 'passport_photo.jpg', mediaType: 'image', verdict: 'face-morph', confidence: 92.8, risk: 'high', analyzedAt: '34 min ago', status: 'complete', analyst: 'M. Okonkwo' },
  { id: 'AV-2026-00478', caseId: 'CASE-0089', filename: 'social_post.jpg', mediaType: 'image', verdict: 'suspicious', confidence: 71.2, risk: 'medium', analyzedAt: '1h ago', status: 'complete', analyst: 'L. Nakamura' },
  { id: 'AV-2026-00477', caseId: 'CASE-0088', filename: 'video_call.mp4', mediaType: 'video', verdict: 'authentic', confidence: 89.3, risk: 'low', analyzedAt: '2h ago', status: 'complete', analyst: 'S. Reyes' },
  { id: 'AV-2026-00476', caseId: 'CASE-0087', filename: 'news_clip.mp4', mediaType: 'video', verdict: 'deepfake', confidence: 88.6, risk: 'high', analyzedAt: '3h ago', status: 'complete', analyst: 'L. Nakamura' },
  { id: 'AV-2026-00475', caseId: 'CASE-0086', filename: 'identity_doc.jpg', mediaType: 'image', verdict: 'inconclusive', confidence: 48.1, risk: 'medium', analyzedAt: '5h ago', status: 'complete', analyst: 'M. Okonkwo' },
  { id: 'AV-2026-00474', caseId: 'CASE-0085', filename: 'training_batch_02.mp4', mediaType: 'video', verdict: 'authentic', confidence: 96.2, risk: 'low', analyzedAt: '6h ago', status: 'complete', analyst: 'S. Reyes' },
];

export const cases: Case[] = [
  { id: 'CASE-0092', name: 'Operation Mirage', description: 'Investigation into synthetic media campaign targeting public officials', investigator: 'M. Okonkwo', createdAt: 'Aug 08, 2026', updatedAt: '2 min ago', priority: 'critical', status: 'investigating', evidenceCount: 14, analysisCount: 23, findings: 'Multiple deepfake video instances confirmed' },
  { id: 'CASE-0091', name: 'Identity Fraud Ring', description: 'Suspected use of morphed passport imagery in immigration fraud', investigator: 'S. Reyes', createdAt: 'Aug 06, 2026', updatedAt: '1h ago', priority: 'high', status: 'investigating', evidenceCount: 8, analysisCount: 11, findings: '3 confirmed face-morph artifacts' },
  { id: 'CASE-0090', name: 'Media Verification Batch', description: 'Routine verification of submitted media assets for news organization', investigator: 'L. Nakamura', createdAt: 'Aug 04, 2026', updatedAt: '1 day ago', priority: 'low', status: 'review', evidenceCount: 47, analysisCount: 47, findings: 'Pending senior review' },
  { id: 'CASE-0089', name: 'Social Manipulation Study', description: 'Academic research into coordinated social media disinformation', investigator: 'M. Okonkwo', createdAt: 'Jul 28, 2026', updatedAt: '3 days ago', priority: 'medium', status: 'open', evidenceCount: 62, analysisCount: 58, findings: 'Analysis ongoing' },
  { id: 'CASE-0088', name: 'Credential Fraud Investigation', description: 'Forensic review of manipulated credentials submitted for onboarding', investigator: 'S. Reyes', createdAt: 'Jul 15, 2026', updatedAt: '1 week ago', priority: 'high', status: 'closed', evidenceCount: 5, analysisCount: 5, findings: '2 confirmed morphs, referred to legal' },
];

export const evidenceItems: Evidence[] = [
  { id: 'EVD-00291', filename: 'interview_clip.mp4', hash: 'sha256:a3f...', sha256: 'a3f8e2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', mediaType: 'video', size: '84.2 MB', addedAt: 'Aug 10, 2026', integrity: 'verified', caseId: 'CASE-0092', status: 'active' },
  { id: 'EVD-00290', filename: 'passport_photo.jpg', hash: 'sha256:7c2...', sha256: '7c2a1b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', mediaType: 'image', size: '2.1 MB', addedAt: 'Aug 10, 2026', integrity: 'verified', caseId: 'CASE-0091', status: 'active' },
  { id: 'EVD-00289', filename: 'social_post.jpg', hash: 'sha256:d9e...', sha256: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0', mediaType: 'image', size: '892 KB', addedAt: 'Aug 09, 2026', integrity: 'warning', caseId: 'CASE-0089', status: 'active' },
  { id: 'EVD-00288', filename: 'press_conference.mp4', hash: 'sha256:1b4...', sha256: '1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', mediaType: 'video', size: '221.8 MB', addedAt: 'Aug 09, 2026', integrity: 'verified', caseId: 'CASE-0091', status: 'active' },
  { id: 'EVD-00287', filename: 'identity_doc.jpg', hash: 'sha256:6f7...', sha256: '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8', mediaType: 'image', size: '3.4 MB', addedAt: 'Aug 08, 2026', integrity: 'changed', caseId: 'CASE-0088', status: 'active' },
];

export const systemComponents: SystemComponent[] = [
  { name: 'Detection Engine', status: 'operational', latency: '12ms', load: 42 },
  { name: 'Face Analysis Engine', status: 'operational', latency: '28ms', load: 67 },
  { name: 'Frame Processor', status: 'processing', latency: '8ms', load: 88 },
  { name: 'AI Model (v2.4.1)', status: 'operational', latency: '145ms', load: 31 },
  { name: 'Storage Layer', status: 'operational', latency: '4ms', load: 54 },
  { name: 'API Gateway', status: 'operational', latency: '2ms', load: 28 },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'error', title: 'Critical Detection', message: 'AV-2026-00481: Deepfake confirmed at 97.4% confidence in CASE-0092', time: '2 min ago', read: false },
  { id: 'n2', type: 'warning', title: 'Evidence Integrity Warning', message: 'EVD-00287 has been modified since original ingest', time: '15 min ago', read: false },
  { id: 'n3', type: 'success', title: 'Batch Analysis Complete', message: '47 media files processed for CASE-0090', time: '1h ago', read: false },
  { id: 'n4', type: 'info', title: 'Report Ready', message: 'Forensic report CASE-0088 is available for download', time: '2h ago', read: true },
  { id: 'n5', type: 'info', title: 'Model Updated', message: 'Detection model updated to v2.4.1 with improved FMD accuracy', time: '1 day ago', read: true },
];

export const activityChartData = {
  '24H': [
    { time: '00:00', authentic: 8, suspicious: 2, deepfake: 1, faceMorph: 0 },
    { time: '02:00', authentic: 4, suspicious: 1, deepfake: 0, faceMorph: 0 },
    { time: '04:00', authentic: 2, suspicious: 0, deepfake: 0, faceMorph: 0 },
    { time: '06:00', authentic: 6, suspicious: 1, deepfake: 1, faceMorph: 0 },
    { time: '08:00', authentic: 18, suspicious: 4, deepfake: 2, faceMorph: 1 },
    { time: '10:00', authentic: 31, suspicious: 7, deepfake: 4, faceMorph: 2 },
    { time: '12:00', authentic: 28, suspicious: 5, deepfake: 3, faceMorph: 1 },
    { time: '14:00', authentic: 35, suspicious: 8, deepfake: 5, faceMorph: 3 },
    { time: '16:00', authentic: 29, suspicious: 6, deepfake: 3, faceMorph: 2 },
    { time: '18:00', authentic: 22, suspicious: 4, deepfake: 2, faceMorph: 1 },
    { time: '20:00', authentic: 15, suspicious: 3, deepfake: 2, faceMorph: 0 },
    { time: '22:00', authentic: 11, suspicious: 2, deepfake: 1, faceMorph: 0 },
  ],
  '7D': Array.from({ length: 7 }, (_, i) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { time: days[i], authentic: Math.floor(120 + Math.random() * 80), suspicious: Math.floor(20 + Math.random() * 20), deepfake: Math.floor(5 + Math.random() * 15), faceMorph: Math.floor(2 + Math.random() * 8) };
  }),
  '30D': Array.from({ length: 10 }, (_, i) => ({
    time: `${i * 3 + 1}`, authentic: Math.floor(400 + Math.random() * 200), suspicious: Math.floor(60 + Math.random() * 60), deepfake: Math.floor(20 + Math.random() * 40), faceMorph: Math.floor(8 + Math.random() * 20)
  })),
  '90D': Array.from({ length: 9 }, (_, i) => ({
    time: `W${i + 1}`, authentic: Math.floor(1200 + Math.random() * 600), suspicious: Math.floor(180 + Math.random() * 120), deepfake: Math.floor(60 + Math.random() * 80), faceMorph: Math.floor(20 + Math.random() * 40)
  })),
  '1Y': Array.from({ length: 12 }, (_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { time: months[i], authentic: Math.floor(4000 + Math.random() * 2000), suspicious: Math.floor(600 + Math.random() * 400), deepfake: Math.floor(200 + Math.random() * 200), faceMorph: Math.floor(80 + Math.random() * 100) };
  }),
};

export const kpiData = {
  totalAnalyses: 12842,
  authentic: 8921,
  suspicious: 2731,
  deepfakes: 1190,
  faceMorphs: 487,
  avgConfidence: 88.4,
};

export const activityLog = [
  { id: 'a1', timestamp: '2026-08-10 14:32:07', actor: 'M. Okonkwo', action: 'Analysis Completed', resource: 'AV-2026-00481', ip: '10.0.4.22', result: 'Success' },
  { id: 'a2', timestamp: '2026-08-10 14:31:44', actor: 'System', action: 'Model Inference', resource: 'interview_clip.mp4', ip: 'internal', result: 'Deepfake 97.4%' },
  { id: 'a3', timestamp: '2026-08-10 14:28:11', actor: 'M. Okonkwo', action: 'Upload', resource: 'interview_clip.mp4', ip: '10.0.4.22', result: 'Success' },
  { id: 'a4', timestamp: '2026-08-10 13:58:22', actor: 'S. Reyes', action: 'Evidence Accessed', resource: 'EVD-00290', ip: '10.0.3.18', result: 'Success' },
  { id: 'a5', timestamp: '2026-08-10 12:41:09', actor: 'L. Nakamura', action: 'Report Generated', resource: 'CASE-0090', ip: '10.0.2.45', result: 'PDF exported' },
  { id: 'a6', timestamp: '2026-08-10 11:20:38', actor: 'M. Okonkwo', action: 'Login', resource: 'Auth', ip: '10.0.4.22', result: 'Success' },
  { id: 'a7', timestamp: '2026-08-10 09:14:55', actor: 'S. Reyes', action: 'Case Modified', resource: 'CASE-0091', ip: '10.0.3.18', result: 'Status → Investigating' },
  { id: 'a8', timestamp: '2026-08-10 08:02:31', actor: 'System', action: 'Model Updated', resource: 'DetectionModel v2.4.1', ip: 'internal', result: 'Success' },
];
