export type KycDocType = "CNI" | "PASSPORT";

/** Données extraites du document par OCR — pré-remplissent le formulaire. */
export interface KycExtractedData {
  firstName?: string;
  lastName?: string;
  postName?: string;
  dateOfBirth?: string;
  docNumber?: string;
  address?: string;
  rawText?: string;
}

export interface KycFaceMatchResult {
  faceMatch: boolean;
  similarity: number;
}

export interface KycProvider {
  extractDocument(docPath: string): Promise<KycExtractedData>;
  compareFaces(docPath: string, selfiePath: string): Promise<KycFaceMatchResult>;
}
