import React, { useEffect, useMemo, useRef, useState } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import "./mainChat.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import type { ChatMessage } from "../../types/chatType";
import { chatService } from "../../services/chatService";
import { formatToLocalTime } from "../../utils/dateUtil";

import { uploadToCloudinary } from "../../services/cloudinaryUpload";
import { decodeMes, encodeMes } from "../../utils/messageCodec";

type ChatMode = "people" | "room";

type Props = {
  me: string;
  mode: ChatMode;
  target: string | null;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  isOnline: boolean;
};

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileIcon(mime?: string, name?: string) {
  const n = (name || "").toLowerCase();
  const m = (mime || "").toLowerCase();

  if (m.includes("pdf") || n.endsWith(".pdf")) return "📄";
  if (m.includes("word") || n.endsWith(".doc") || n.endsWith(".docx")) return "📝";
  if (m.includes("excel") || n.endsWith(".xls") || n.endsWith(".xlsx")) return "📊";
  if (m.includes("powerpoint") || n.endsWith(".ppt") || n.endsWith(".pptx")) return "📽️";
  if (m.includes("zip") || n.endsWith(".zip") || n.endsWith(".rar") || n.endsWith(".7z")) return "🗜️";
  return "📎";
}

const MainChat: React.FC<Props> = ({ me, mode, target, messages, onSendMessage, isOnline }) => {
  const [text, setText] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const title = useMemo(() => {
    if (!target) return "";
    return mode === "people" ? target : `Room: ${target}`;
  }, [mode, target]);

  const renderStatus = () => {
    // CASE 1: NẾU LÀ ROOM -> Hiển thị text tĩnh
    if (mode === "room") {
      return <p style={{ color: "#666", fontWeight: "400" }}></p>;
    }

    // CASE 2: NẾU LÀ PEOPLE -> Hiển thị trạng thái Online/Offline dựa vào props
    return (
        <p style={{ color: isOnline ? "#4caf50" : "#999", fontWeight: isOnline ? "600" : "400" }}>
          {isOnline ? (
              <>
                <i className="fa-solid fa-circle" style={{fontSize: 8, marginRight: 5}}></i>
                Đang hoạt động
              </>
          ) : "Ngoại tuyến"}
        </p>
    );
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showEmoji = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const sendText = async () => {
    if (!target) return;

    const m = text.trim();
    if (!m) return;

    const encoded = encodeMes({ kind: "text", text: m });

    if (mode === "people") await chatService.sendToPeople(target, encoded);
    else await chatService.sendToRoom(target, encoded);

    const nowISO = new Date().toISOString();
    const serverStyleTime = nowISO.replace("T", " ").split(".")[0];

    onSendMessage({
      id: Date.now(),
      name: me,
      type: mode === "people" ? 0 : 1,
      to: target,
      mes: encoded,
      createAt: serverStyleTime,
    });

    setText("");
    setOpenEmoji(false);
  };

  const sendAnyFile = async (file: File) => {
    if (!target) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    // giới hạn size (tuỳ bạn chỉnh)
    const maxMb = isVideo ? 50 : isImage ? 10 : 20;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`File quá lớn. Giới hạn ${maxMb}MB`);
      return;
    }

    setUploading(true);
    setOpenEmoji(false);

    try {
      const up = await uploadToCloudinary(file);

       const payload = isVideo
        ? ({
            kind: "video",
            url: up.secure_url,
            name: file.name,
            bytes: up.bytes ?? file.size,
            duration: up.duration,
          } as const)
        : isImage
        ? ({
            kind: "image",
            url: up.secure_url,
            name: file.name,
            bytes: up.bytes ?? file.size,
            width: up.width,
            height: up.height,
          } as const)
        : ({
            kind: "file",
            url: up.secure_url,
            name: file.name,
            bytes: up.bytes ?? file.size,
            mime: file.type,
          } as const);


      const encoded = encodeMes(payload);

      if (mode === "people") await chatService.sendToPeople(target, encoded);
      else await chatService.sendToRoom(target, encoded);

      const nowISO = new Date().toISOString();
      const serverStyleTime = nowISO.replace("T", " ").split(".")[0];

      onSendMessage({
        id: Date.now(),
        name: me,
        type: mode === "people" ? 0 : 1,
        to: target,
        mes: encoded,
        createAt: serverStyleTime,
      });
    } catch (e: any) {
        // Bắt lỗi chỗ này thành thông báo tự viết
      alert(e?.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  if (!target) {
    return (
      <div className="mainChat">
        <p className="noConversation">Hãy chọn một cuộc trò chuyện</p>
      </div>
    );
  }

  return (
    <div className="mainChat">
      <React.Fragment>
        <div className="topChat">
          <div className="user">
            <img
                src={mode === "room" ? "/img/avt_group.jpg" : "/img/anotherAvatar.jpg"}
                alt="Avatar"
                className="rsb-avatar"
            />
            <div className="texts">
              <span>{title}</span>
              {renderStatus()}
            </div>
          </div>
          <div className="icon">
            <i className="fa-solid fa-circle-info fa-xl" style={{ color: "#333333" }}></i>
          </div>
        </div>

        <div className="centerChat">
          {messages.map((msg) => {
            const isOwn = msg.name === me;
            const payload = decodeMes(msg.mes);

            return (
              <div
                key={`${msg.id}-${msg.createAt ?? ""}-${msg.mes.slice(0, 12)}`}
                className={`messages ${isOwn ? "own" : ""}`}
              >
                {!isOwn && <img src="/img/anotherAvatar.jpg" alt="avatar" className="avatar" />}
                <div className="texts">
                  {!isOwn && <span className="sender-name">{msg.name}</span>}
                  {payload.kind === "text" && <p className="content">{payload.text}</p>}

                  {payload.kind === "image" && (
                    <img
                      src={payload.url}
                      alt={payload.name ?? "image"}
                      style={{ maxWidth: 280, borderRadius: 12 }}
                    />
                  )}

                  {payload.kind === "video" && (
                    <video
                      src={payload.url}
                      controls
                      style={{ maxWidth: 320, borderRadius: 12 }}
                    />
                  )}

                  {payload.kind === "file" && (
                    <a
                      href={payload.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: 12,
                        background: "#f2f2f2",
                        maxWidth: 320,
                        textDecoration: "none",
                        color: "#111",
                      }}
                      title={payload.name}
                    >
                      <span style={{ fontSize: 18 }}>📎</span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {payload.name}
                        {payload.bytes ? ` • ${formatBytes(payload.bytes)}` : ""}
                      </span>
                    </a>
                  )}
                  <span>{formatToLocalTime(msg.createAt) ?? ""}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
        </div>

        <div className="bottomChat">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void sendAnyFile(f);
              e.currentTarget.value = "";
            }}
          />

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ marginRight: 8 }}
            title="Gửi ảnh/video/tệp"
          >
            {uploading ? "Uploading..." : "📎"}
          </button>

          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void sendText()}
            disabled={uploading}
          />

          <div className="emoji">
            <i
              className="fa-regular fa-face-smile fa-xl"
              onClick={() => setOpenEmoji((prev) => !prev)}
              style={{ cursor: "pointer" }}
              title="Emoji"
            ></i>

            {openEmoji && (
              <div className="emojiPicker">
                <EmojiPicker onEmojiClick={showEmoji} />
              </div>
            )}
          </div>

          <button className="sendButton" onClick={() => void sendText()} disabled={uploading}>
            Gửi
          </button>
        </div>
      </React.Fragment>
    </div>
  );
};

export default MainChat;
