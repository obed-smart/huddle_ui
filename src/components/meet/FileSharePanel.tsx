"use client";

import { useState } from "react";
import { DropZone } from "./DropZone";
import { FileItem } from "./FileItem";
import { Folder } from "@/components/ui/icons";
import type { SharedFile } from "@/types";

export function FileSharePanel() {
  const [files, setFiles] = useState<SharedFile[]>([]);

  function handleFiles(incoming: File[]) {
    const next: SharedFile[] = incoming.map((file) => ({
      id: `f-${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "transferring",
      direction: "outgoing",
    }));

    setFiles((prev) => [...next, ...prev]);
    next.forEach((file) => simulateTransfer(file.id, setFiles));
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <DropZone onFiles={handleFiles} />
      <div className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <Folder className="size-6 text-slate-500" />
            <p className="text-xs text-slate-400">No files shared yet</p>
          </div>
        ) : (
          files.map((file) => <FileItem key={file.id} file={file} />)
        )}
      </div>
    </div>
  );
}

function simulateTransfer(id: string, setFiles: React.Dispatch<React.SetStateAction<SharedFile[]>>) {
  const interval = setInterval(() => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== id || file.status !== "transferring") return file;
        const progress = Math.min(100, file.progress + 20);
        return progress >= 100 ? { ...file, progress: 100, status: "done" } : { ...file, progress };
      })
    );
  }, 300);

  setTimeout(() => clearInterval(interval), 2000);
}
