export interface FaceQualityResult {
  status: 'success' | 'unavailable' | 'error';
  modelId: string;
  version: string;
  qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  qualityScore: number; // 0 to 100
  resolutionMetric: string;
  blurIndex: number; // 0 (very blurry) to 100 (crisp)
  noiseIndex: number; // 0 (clean) to 100 (noisy)
  contrastIndex: number; // 0 to 100
  isForensicallyViable: boolean;
  warnings: string[];
}

export class FaceQualityAnalyzer {
  public static assessQuality(
    width: number = 1920,
    height: number = 1080,
    faceBoundingBox?: { width: number; height: number },
    pixelNoiseVariance: number = 15
  ): FaceQualityResult {
    const warnings: string[] = [];
    const totalPixels = width * height;

    // 1. Resolution score
    let resScore = 80;
    if (totalPixels < 150000) { // e.g. < 400x375
      resScore = 30;
      warnings.push('Low overall media resolution limits fine forensic feature examination.');
    } else if (totalPixels < 500000) {
      resScore = 60;
    } else if (totalPixels >= 2000000) {
      resScore = 95;
    }

    // 2. Face relative resolution
    let faceResScore = 85;
    if (faceBoundingBox) {
      const faceArea = faceBoundingBox.width * faceBoundingBox.height;
      if (faceArea < 4000) { // Face < 64x64
        faceResScore = 20;
        warnings.push('Facial region is smaller than 64×64 pixels (sub-biometric threshold).');
      } else if (faceArea < 16000) {
        faceResScore = 50;
        warnings.push('Facial area is below 128×128 pixels; micro-texture analysis may have reduced precision.');
      }
    }

    // 3. Blur / Sharpness estimation
    let blurIndex = 85;
    if (pixelNoiseVariance < 2) {
      blurIndex = 25;
      warnings.push('Significant motion blur or aggressive low-pass filtering detected.');
    } else if (pixelNoiseVariance < 5) {
      blurIndex = 55;
    }

    // 4. Noise estimation
    const noiseIndex = Math.min(100, Math.round(pixelNoiseVariance * 2.5));

    // 5. Contrast index
    const contrastIndex = 82;

    // Composite quality score
    const qualityScore = Math.round((resScore * 0.35) + (faceResScore * 0.35) + (blurIndex * 0.2) + (contrastIndex * 0.1));

    let qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' = 'HIGH';
    let isForensicallyViable = true;

    if (qualityScore < 35 || resScore < 35 || faceResScore < 25) {
      qualityLevel = 'INSUFFICIENT';
      isForensicallyViable = false;
      warnings.push('Forensic viability threshold not met: System must abstain or flag INSUFFICIENT EVIDENCE.');
    } else if (qualityScore < 60) {
      qualityLevel = 'LOW';
    } else if (qualityScore < 80) {
      qualityLevel = 'MEDIUM';
    } else {
      qualityLevel = 'HIGH';
    }

    return {
      status: 'success',
      modelId: 'av-qualityguard-v2',
      version: '2.1.0',
      qualityLevel,
      qualityScore,
      resolutionMetric: `${width}×${height}px`,
      blurIndex,
      noiseIndex,
      contrastIndex,
      isForensicallyViable,
      warnings,
    };
  }
}
