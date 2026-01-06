// src/services/cloudinaryUpload.ts

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw";
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number; // video
  original_filename?: string;
};

const CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || "";
const UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || "";

/**
 * Upload image/video/file to Cloudinary (unsigned preset).
 * Use endpoint: /auto/upload => Cloudinary auto-detect resource type.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  console.log("CLOUD_NAME", CLOUD_NAME);
  console.log("UPLOAD_PRESET", UPLOAD_PRESET);

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing env: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET.trim());
  form.append("folder", "chat_uploads");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME.trim()}/auto/upload`;

  const res = await fetch(url, { method: "POST", body: form });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  console.log("Cloudinary status:", res.status);
  console.log("Cloudinary response:", data);

  if (!res.ok) {
    throw new Error(data?.error?.message || `Upload failed (${res.status})`);
  }

  return data as CloudinaryUploadResult;
}
