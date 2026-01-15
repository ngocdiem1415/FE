import React, { useMemo, useState } from "react";
import type { ChatMessage } from "../../types/chatType";
import { decodeMes } from "../../utils/messageCodec";

type Props = {
  messages: ChatMessage[];
};

type MediaItem = { url: string; name?: string };

const GroupMedia: React.FC<Props> = ({ messages }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [tab, setTab] = useState<"images" | "videos">("images");

  const { images, videos } = useMemo(() => {
    const imgs: MediaItem[] = [];
    const vids: MediaItem[] = [];

    for (const msg of messages) {
      const payload = decodeMes(msg.mes);

      if (payload.kind === "image") {
        imgs.push({ url: payload.url, name: payload.name });
      } else if (payload.kind === "video") {
        vids.push({ url: payload.url, name: payload.name });
      }
    }

    // newest first + remove duplicates
    const uniq = (arr: MediaItem[]) => {
      const seen = new Set<string>();
      const out: MediaItem[] = [];
      for (let i = arr.length - 1; i >= 0; i--) {
        const it = arr[i];
        if (!it?.url) continue;
        if (seen.has(it.url)) continue;
        seen.add(it.url);
        out.push(it);
      }
      return out;
    };

    return { images: uniq(imgs), videos: uniq(vids) };
  }, [messages]);

  return (
    <div className="rsb-section">
      <div className="rsb-section-title" onClick={() => setIsOpen(!isOpen)}>
        <span>Ảnh / Video</span>
        <i className={`fa-solid fa-chevron-${isOpen ? "down" : "right"}`}></i>
      </div>

      {isOpen && (
        <div className="rsb-section-content">
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => setTab("images")}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: tab === "images" ? "#f8e5fc" : "#fff",
                color: tab === "images" ? "#111" : "#696969",
                cursor: "pointer",
              }}
            >
              Ảnh ({images.length})
            </button>
            <button
              onClick={() => setTab("videos")}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: tab === "videos" ? "#f8e5fc" : "#fff",
                color: tab === "videos" ? "#111" : "#696969",
                cursor: "pointer",
              }}
            >
              Video ({videos.length})
            </button>
          </div>

          {tab === "images" ? (
            images.length === 0 ? (
              <p className="rsb-empty-text">Chưa có hình ảnh</p>
            ) : (
              <div className="rsb-media-grid">
                {images.map((it, idx) => (
                  <img
                    key={it.url + idx}
                    src={it.url}
                    alt={it.name || "image"}
                    className="rsb-media-img"
                    onClick={() => window.open(it.url, "_blank")}
                  />
                ))}
              </div>
            )
          ) : videos.length === 0 ? (
            <p className="rsb-empty-text">Chưa có video</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {videos.map((it, idx) => (
                <div key={it.url + idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{it.name || "Video"}</div>
                  <video
                      className="rsb-media-img"
                      src={it.url} controls
                      style={{ width: "100%", borderRadius: 10 }} />
                  <div style={{ marginTop: 8 }}>
                    <a href={it.url} target="_blank" rel="noreferrer">
                      Mở video
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupMedia;
