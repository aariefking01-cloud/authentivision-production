export interface DetectorResult {
  available: boolean;
  providerName: string;
  label: string;
  score: number; // 0.0 to 1.0 (AI/synthetic score)
  details?: string;
}

export class SpecializedDetectorProvider {
  /** Runs spatial high-frequency residual analysis or checks external detector API */
  public static async analyze(
    buffer: Buffer,
    base64Data: string,
    mimeType: string,
    edgeNoiseVariance: number
  ): Promise<{
    specialized: DetectorResult;
    external: DetectorResult;
  }> {
    // 1. Local Spatial Edge Residual Analysis
    let localScore = 0.15;
    if (edgeNoiseVariance > 35) {
      localScore = 0.88;
    } else if (edgeNoiseVariance > 25) {
      localScore = 0.65;
    } else if (edgeNoiseVariance < 5) {
      localScore = 0.35; // smooth/degraded or heavily compressed
    }

    const specialized: DetectorResult = {
      available: true,
      providerName: 'Spatial High-Frequency Edge Residual Ensemble',
      label: localScore > 0.6 ? 'SYNTHETIC_SPATIAL_ANOMALY' : 'NATURAL_SENSOR_NOISE',
      score: localScore,
      details: `High-frequency spatial edge variance calculated at ${edgeNoiseVariance.toFixed(1)}σ.`,
    };

    // 2. Optional External Detector Integration (Reality Defender / Hive / HuggingFace)
    let external: DetectorResult = {
      available: false,
      providerName: 'External Commercial Detector API',
      label: 'NOT_CONFIGURED',
      score: 0,
      details: 'No external detector API key configured (e.g. REALITY_DEFENDER_API_KEY or HIVE_API_KEY).',
    };

    const rdKey = process.env.REALITY_DEFENDER_API_KEY;
    const hiveKey = process.env.HIVE_API_KEY;

    if (rdKey) {
      try {
        const res = await fetch('https://api.realitydefender.com/v1/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': rdKey,
          },
          body: JSON.stringify({ image_base64: base64Data }),
        });
        if (res.ok) {
          const data = await res.json();
          external = {
            available: true,
            providerName: 'Reality Defender API',
            label: data.status || 'SCANNED',
            score: typeof data.score === 'number' ? data.score : 0.5,
            details: 'Response received from Reality Defender Deepfake Inspection service.',
          };
        }
      } catch (err) {
        console.warn('Reality Defender API notice:', err);
      }
    } else if (hiveKey) {
      try {
        const res = await fetch('https://api.thehive.ai/v3.0/moderation/image/deepfake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hiveKey}`,
          },
          body: JSON.stringify({ image_base64: base64Data }),
        });
        if (res.ok) {
          const data = await res.json();
          external = {
            available: true,
            providerName: 'Hive AI Deepfake Detection',
            label: data.verdict || 'SCANNED',
            score: typeof data.score === 'number' ? data.score : 0.5,
            details: 'Response received from Hive AI Moderation API.',
          };
        }
      } catch (err) {
        console.warn('Hive API notice:', err);
      }
    }

    return { specialized, external };
  }
}
