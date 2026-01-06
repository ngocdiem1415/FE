// src/utils/messageCodec.ts

export type MediaPayload =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string; name?: string; bytes?: number; width?: number; height?: number }
  | { kind: "video"; url: string; name?: string; bytes?: number; duration?: number }
  | { kind: "file"; url: string; name: string; bytes?: number; mime?: string };

export function b64EncodeUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function b64DecodeUtf8(b64: string): string {
  try {
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    // nếu không phải base64 hợp lệ thì trả nguyên
    return b64;
  }
}

/**
 * Encode to ChatMessage.mes:
 * - text: base64(text)
 * - media/file: base64(JSON(payload))
 */
export function encodeMes(payload: MediaPayload): string {
  if (payload.kind === "text") return b64EncodeUtf8(payload.text);
  return b64EncodeUtf8(JSON.stringify(payload));
}

/**
 * Decode ChatMessage.mes:
 * - decode base64 -> string
 * - try JSON parse to detect media/file
 * - else => text
 */
export function decodeMes(mes: string): MediaPayload {
  const decoded = b64DecodeUtf8(mes);

  try {
    const obj = JSON.parse(decoded);
    if (obj?.kind === "image" && typeof obj.url === "string") return obj as MediaPayload;
    if (obj?.kind === "video" && typeof obj.url === "string") return obj as MediaPayload;
    if (obj?.kind === "file" && typeof obj.url === "string") return obj as MediaPayload;
  } catch {
    // not JSON
  }

  return { kind: "text", text: decoded };
}
