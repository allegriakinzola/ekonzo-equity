import { mkdtemp, writeFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { ManualKycProvider } from "./providers/manual.provider";
import { AwsKycProvider } from "./providers/aws.provider";
import type { KycProvider, KycExtractedData } from "./kyc.types";

export function getKycProvider(): KycProvider {
  const provider = process.env.KYC_PROVIDER ?? "manual";
  switch (provider) {
    case "aws":
      return new AwsKycProvider();
    default:
      return new ManualKycProvider();
  }
}

export async function extractDocumentData(
  docPath: string,
): Promise<KycExtractedData> {
  return getKycProvider().extractDocument(docPath);
}

export async function extractDocumentFromBuffer(
  buffer: Buffer,
  ext = "jpg",
): Promise<KycExtractedData> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "eq-kyc-"));
  const file = path.join(dir, `doc.${ext}`);
  try {
    await writeFile(file, buffer);
    return await extractDocumentData(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
