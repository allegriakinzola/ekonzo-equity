import type {
  KycProvider,
  KycExtractedData,
  KycFaceMatchResult,
} from "../kyc.types";

export class ManualKycProvider implements KycProvider {
  async extractDocument(_docPath: string): Promise<KycExtractedData> {
    return {};
  }

  async compareFaces(): Promise<KycFaceMatchResult> {
    return { faceMatch: false, similarity: 0 };
  }
}
