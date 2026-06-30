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
    <div className="flex items-center gap-3 rounded-(--radius-md) bg-surface-muted px-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm) bg-surface text-muted-foreground">
        <FileIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{file.name}</span>
        <span className="block text-xs text-muted-foreground">
          {formatFileSize(file.size)}
          {file.status === "transferring" && ` · ${file.progress}%`}
          {file.status === "declined" && " · Declined"}
        </span>
        {file.status === "transferring" && (
          <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-border">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${file.progress}%` }}
            />
          </span>
        )}
      </span>
      {file.status === "transferring" && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
      {file.status === "done" && <CheckCircle2 className="size-4 shrink-0 text-success" />}
      {file.status === "declined" && <X className="size-4 shrink-0 text-destructive" />}
      {file.status === "done" && file.direction === "incoming" && (
        <Download className="size-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  );
}
