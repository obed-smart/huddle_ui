import { CheckCircle2, Download, File as FileIcon, Loader2, X } from "@/components/ui/icons";
import type { SharedFile } from "@/types";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileItemProps {
  file: SharedFile;
}

export function FileItem({ file }: FileItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-(--radius-md) bg-white/5 px-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm) bg-white/10 text-slate-300">
        <FileIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">{file.name}</span>
        <span className="block text-xs text-slate-400">
          {formatFileSize(file.size)}
          {file.status === "transferring" && ` · ${file.progress}%`}
          {file.status === "declined" && " · Declined"}
        </span>
        {file.status === "transferring" && (
          <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${file.progress}%` }}
            />
          </span>
        )}
      </span>
      {file.status === "transferring" && <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />}
      {file.status === "done" && <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />}
      {file.status === "declined" && <X className="size-4 shrink-0 text-rose-400" />}
      {file.status === "done" && file.direction === "incoming" && (
        <Download className="size-4 shrink-0 text-slate-400" />
      )}
    </div>
  );
}
