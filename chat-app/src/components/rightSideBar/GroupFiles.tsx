import React, { useMemo, useState } from "react";
import type { ChatMessage } from "../../types/chatType";
import { decodeMes } from "../../utils/messageCodec";

type Props = {
  messages: ChatMessage[];
};

type FileItem = { url: string; name: string; bytes?: number; mime?: string };

const GroupFiles: React.FC<Props> = ({ messages }) => {
  const [isOpen, setIsOpen] = useState(true);

  const files = useMemo(() => {
    const list: FileItem[] = [];

    for (const msg of messages) {
      const payload = decodeMes(msg.mes);
      if (payload.kind === "file") {
        list.push({ url: payload.url, name: payload.name, bytes: payload.bytes, mime: payload.mime });
      }
    }

    // newest first + remove duplicates by url
    const seen = new Set<string>();
    const out: FileItem[] = [];
    for (let i = list.length - 1; i >= 0; i--) {
      const it = list[i];
      if (!it?.url) continue;
      if (seen.has(it.url)) continue;
      seen.add(it.url);
      out.push(it);
    }
    return out;
  }, [messages]);

  return (
    <div className="rsb-section">
      <div className="rsb-section-title" onClick={() => setIsOpen(!isOpen)}>
        <span>File đính kèm</span>
        <i className={`fa-solid fa-chevron-${isOpen ? "down" : "right"}`}></i>
      </div>

      {isOpen && (
        <div className="rsb-section-content">
          {files.length === 0 ? (
            <p className="rsb-empty-text">Chưa có file</p>
          ) : (
            <div>
              {files.map((it, idx) => (
                <div
                  key={it.url + idx}
                  className="rsb-file-item"
                  onClick={() => window.open(it.url, "_blank")}
                  title={it.url}
                >
                  <div className="rsb-file-icon">
                    <i className="fa-solid fa-paperclip"></i>
                  </div>
                  <div className="rsb-file-name">{it.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupFiles;
