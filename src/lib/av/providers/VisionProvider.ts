import { GoogleGenAI } from '@google/genai';
import type { Verdict, SuspiciousRegion, ClassificationBreakdown } from '../types';

export interface VisionResult {
  verdict: Verdict;
  confidence: number;
  uncertainty: number;
  quality: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  classification: ClassificationBreakdown;
  analysisSummary: string;
  evidence: Array<{
    category: string;
    finding: string;
    severity: string;
    confidence: number;
    detail: string;
  }>;
  suspiciousRegions: SuspiciousRegion[];
  limitations: string[];
}

export class VisionProvider {
  public static async analyzeImage(
    apiKey: string,
    base64Data: string,
    mimeType: string,
    provenanceDetails: string
  ): Promise<VisionResult> {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a Senior Digital Media Forensics Expert and Computer Vision Researcher performing a rigorous authenticity examination on an uploaded image.
Analyze the actual pixels of this image with scientific precision across these 6 core categories:

1. FACE AND IDENTITY REGION: Examine facial geometry, pupil circularity, corneal specular reflections, eye symmetry, teeth structure, ear contours, hair boundaries, skin pore texture, facial/neck blending seams, and identity consistency.
2. LIGHTING & ILLUMINATION: Inspect light source vectors, shadow consistency between subject and background, specular highlights, skin reflectivity, and ambient lighting alignment.
3. PHYSICAL & GEOMETRIC CONSISTENCY: Analyze perspective geometry, anatomical structures (hands, fingers, limbs), reflections, depth of field consistency, and spatial overlap.
4. SYNTHETIC AI GENERATION ARTIFACTS: Check for unnatural fine-detail over-smoothing, high-frequency spatial noise repetition, hallucinated background geometries, unreadable synthetic text, painterly texture transitions, or AI generator signatures (Midjourney, DALL-E, Stable Diffusion, Flux, Imagen, Sora, etc.).
5. MANIPULATION & DEEPFAKE INDICATORS: Look for boundary warping, Poisson blending seams, color space discontinuities, local JPEG re-quantization anomalies, or face-swap halos.
6. METADATA & PROVENANCE: Container inspection note: ${provenanceDetails}.

CRITICAL FORENSIC INSTRUCTIONS:
- You MUST be objective, evidence-driven, and scientifically defensible.
- Do NOT fabricate or invent findings that are not visible in the pixels.
- If the image is a genuine photograph with natural camera sensor noise, uniform lighting, and consistent geometry, select "LIKELY_AUTHENTIC".
- If you observe clear synthetic AI generation artifacts, unreadable text, or unnatural textures, select "LIKELY_AI_GENERATED".
- If you observe clear face-swapping, boundary warping, or selective editing, select "LIKELY_MANIPULATED" or "LIKELY_DEEPFAKE".
- If the image resolution is degraded, compressed, or evidence is conflicting or insufficient, select "INCONCLUSIVE".

Respond strictly with a JSON object matching this schema (NO markdown code fence outside, raw JSON only):
{
  "verdict": "LIKELY_AUTHENTIC" | "LIKELY_AI_GENERATED" | "LIKELY_DEEPFAKE" | "LIKELY_MANIPULATED" | "INCONCLUSIVE",
  "confidence": number (0 to 100),
  "uncertainty": number (0 to 25),
  "quality": "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT",
  "classification": {
    "aiGenerated": number (0.0 to 1.0),
    "manipulated": number (0.0 to 1.0),
    "authentic": number (0.0 to 1.0)
  },
  "analysisSummary": "Concise 2-3 sentence executive forensic summary explaining why this verdict was reached based on pixel evidence.",
  "evidence": [
    {
      "category": "FACE" | "LIGHTING" | "PHYSICAL_GEOMETRY" | "ARTIFACTS" | "PROVENANCE" | "COMPRESSION",
      "finding": "Short title describing finding",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "confidence": number (0.0 to 1.0),
      "detail": "Detailed technical explanation of what was observed in the pixels."
    }
  ],
  "suspiciousRegions": [
    {
      "description": "What anomaly exists in this bounding box",
      "x": number (0-100 percentage from left),
      "y": number (0-100 percentage from top),
      "width": number (0-100 percentage width),
      "height": number (0-100 percentage height),
      "severity": "critical" | "high" | "medium" | "low"
    }
  ],
  "limitations": [
    "AI authenticity detection is probabilistic and evaluates observed pixel heuristics.",
    "Absence of provenance metadata does not independently guarantee authenticity."
  ]
}`;

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.5-flash-lite',
    ];
    let responseText = '';
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        });
        responseText = response.text || '';
        if (responseText) {
          break; // Success
        }
      } catch (err: any) {
        lastError = err;
        const errDesc = err?.status || err?.code || (err?.message ? String(err.message).slice(0, 100) : 'unavailable');
        console.info(`VisionProvider model ${model} attempt notice (${errDesc}), trying next model...`);
      }
    }

    if (!responseText) {
      const errMsg = lastError?.message || 'Empty response received from Gemini API';
      throw new Error(`Gemini Multimodal Vision API call failed (${errMsg}). Verify GEMINI_API_KEY environment variable and quota.`);
    }

    let parsedJson: any = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('Failed to parse Gemini Vision JSON output:', err);
    }

    if (!parsedJson) {
      throw new Error('Gemini Multimodal Vision API returned non-JSON structured response. Please retry analysis.');
    }

    return {
      verdict: parsedJson.verdict || 'INCONCLUSIVE',
      confidence: typeof parsedJson.confidence === 'number' ? parsedJson.confidence : 75,
      uncertainty: typeof parsedJson.uncertainty === 'number' ? parsedJson.uncertainty : 5,
      quality: parsedJson.quality || 'HIGH',
      classification: parsedJson.classification || { aiGenerated: 0.33, manipulated: 0.33, authentic: 0.34 },
      analysisSummary: parsedJson.analysisSummary || 'Gemini Vision analysis completed.',
      evidence: parsedJson.evidence || [],
      suspiciousRegions: parsedJson.suspiciousRegions || [],
      limitations: parsedJson.limitations || [
        'AI image detection is probabilistic.',
        'Absence of metadata does not prove or disprove authenticity.',
      ],
    };
  }
}
