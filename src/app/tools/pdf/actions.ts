'use server';

import { headers } from "next/headers";
import { pdfRateLimit, getIp } from "@/lib/ratelimit";

export async function validatePdfServerSide(formData: FormData) {
  const headersList = await headers();
  const ip = getIp(headersList);
  const { success } = await pdfRateLimit.limit(ip);
  if (!success) {
    return { success: false, error: "Too many requests. Please try again later.", field: "rate_limit" };
  }

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided", field: "file" };
  
  if (file.size > 50 * 1024 * 1024) {
    return { success: false, error: "File exceeds 50MB limit", field: "file" };
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, error: "Invalid file type. Only PDF allowed.", field: "file" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const arr = new Uint8Array(arrayBuffer.slice(0, 4));
  
  // PDF: %PDF (25 50 44 46)
  if (arr.length < 4 || arr[0] !== 0x25 || arr[1] !== 0x50 || arr[2] !== 0x44 || arr[3] !== 0x46) {
    return { success: false, error: "Invalid PDF magic bytes", field: "file" };
  }

  return { success: true };
}
