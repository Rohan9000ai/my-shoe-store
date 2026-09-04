import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Generates a short-lived signature so the browser can upload directly
// to Cloudinary (via the Upload Widget) without ever seeing the API secret.
// Used by an upload-signature API route we'll add when building the
// admin product form.
export function generateUploadSignature(paramsToSign: Record<string, unknown>) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not set");
  }

  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}