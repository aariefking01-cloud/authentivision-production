export interface ForensicModelEntry {
  id: string;
  name: string;
  version: string;
  provider: string;
  type: 'multimodal_reasoner' | 'face_morph_detector' | 'deepfake_detector' | 'face_detector' | 'face_quality' | 'image_forensics' | 'provenance';
  purpose: string;
  calibrationMethod: string;
  accuracyScore: number;
  precisionScore: number;
  recallScore: number;
  f1Score: number;
  status: 'active' | 'fallback' | 'experimental';
}

export const FORENSIC_MODELS: Record<string, ForensicModelEntry> = {
  PRIMARY_REASONER: {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (Forensic Reasoner)',
    version: '3.1.0-preview',
    provider: 'Google DeepMind',
    type: 'multimodal_reasoner',
    purpose: 'Multimodal evidentiary reasoning, cross-signal validation, and defensible forensic synthesis.',
    calibrationMethod: 'Platt Scaling + Evidentiary Prior Matrix',
    accuracyScore: 96.4,
    precisionScore: 95.8,
    recallScore: 94.2,
    f1Score: 95.0,
    status: 'active',
  },
  FAST_ANALYZER: {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash (Vision Forensics)',
    version: '3.7.0',
    provider: 'Google DeepMind',
    type: 'multimodal_reasoner',
    purpose: 'High-throughput visual anomaly triage and multi-scale region inspection.',
    calibrationMethod: 'Isotonic Regression',
    accuracyScore: 94.8,
    precisionScore: 93.9,
    recallScore: 92.5,
    f1Score: 93.2,
    status: 'active',
  },
  FACE_MORPH_DETECTOR: {
    id: 'av-morphnet-v3.2',
    name: 'AV-MorphNet (Biometric Fusion Detector)',
    version: '3.2.4',
    provider: 'AuthentiVision Core Lab',
    type: 'face_morph_detector',
    purpose: 'Facial landmark geometry drift, Poisson boundary seam analysis, identity embedding divergence, and dual-subject feature interpolation.',
    calibrationMethod: 'NIST FATE-Morph Aligned Decision Thresholding',
    accuracyScore: 95.1,
    precisionScore: 94.2,
    recallScore: 93.8,
    f1Score: 94.0,
    status: 'active',
  },
  DEEPFAKE_DETECTOR: {
    id: 'av-deepnet-v4.1',
    name: 'AV-DeepNet (Facial Manipulation Classifier)',
    version: '4.1.2',
    provider: 'AuthentiVision Core Lab',
    type: 'deepfake_detector',
    purpose: 'Synthetic facial texture forensics, corneal specular reflection coherence, teeth/hair geometry, and gaze vector consistency.',
    calibrationMethod: 'Temperature Scaling on FaceForensics++ / Celeb-DF',
    accuracyScore: 94.2,
    precisionScore: 91.8,
    recallScore: 88.4,
    f1Score: 90.1,
    status: 'active',
  },
  FACE_DETECTOR: {
    id: 'av-multiface-yolo-v8',
    name: 'AV-MultiFace (Multi-Subject Spatial Extractor)',
    version: '8.4.1',
    provider: 'AuthentiVision Core Lab',
    type: 'face_detector',
    purpose: 'High-precision multi-face localization, 68-point biometric landmark mesh extraction, and bounding box normalization.',
    calibrationMethod: 'IoU > 0.65 NMS Filter',
    accuracyScore: 99.1,
    precisionScore: 98.7,
    recallScore: 98.2,
    f1Score: 98.4,
    status: 'active',
  },
  FACE_QUALITY_ANALYZER: {
    id: 'av-qualityguard-v2',
    name: 'AV-QualityGuard (Forensic Viability Assessor)',
    version: '2.1.0',
    provider: 'AuthentiVision Core Lab',
    type: 'face_quality',
    purpose: 'Pixel resolution density, Laplacian blur variance, SNR noise estimation, and dynamic range evaluation to guard against false convictions on degraded inputs.',
    calibrationMethod: 'ISO/IEC 29794-5 Biometric Quality Standard',
    accuracyScore: 97.8,
    precisionScore: 96.5,
    recallScore: 97.1,
    f1Score: 96.8,
    status: 'active',
  },
  IMAGE_FORENSICS_ENGINE: {
    id: 'av-pixelforensics-v3',
    name: 'AV-PixelForensics (Spatial & Frequency Domain Ensemble)',
    version: '3.0.8',
    provider: 'AuthentiVision Core Lab',
    type: 'image_forensics',
    purpose: 'Spatial high-frequency edge residuals, Error Level Analysis (ELA), 2D-FFT frequency spectrum analysis, and chromatic aberration gradients.',
    calibrationMethod: 'Camera PRNU Noise Profile Matching',
    accuracyScore: 93.5,
    precisionScore: 92.1,
    recallScore: 91.0,
    f1Score: 91.5,
    status: 'active',
  },
  CONTAINER_PROVENANCE: {
    id: 'av-provenance-v2',
    name: 'AV-Provenance (C2PA & SynthID Inspector)',
    version: '2.3.0',
    provider: 'AuthentiVision Core Lab',
    type: 'provenance',
    purpose: 'C2PA Content Credentials cryptographic manifest inspection, SynthID frequency watermark validation, and EXIF software quantization audit.',
    calibrationMethod: 'Cryptographic Signature & Frequency Signature Matching',
    accuracyScore: 99.8,
    precisionScore: 99.9,
    recallScore: 99.5,
    f1Score: 99.7,
    status: 'active',
  },
};
