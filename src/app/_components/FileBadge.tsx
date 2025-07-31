import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function FileBadge({
  fileUrl,
  fileName,
}: {
  fileUrl: string;
  fileName: string;
}) {
  return (
    <div className="flex gap-2 border rounded-xl p-1 w-full">
      <FileText width={80} height={80} />
      <div>
        <h1 className="font-semibold text-sm mt-1">{fileName}</h1>
        <a
          className="text-xs hover:underline hover:underline-offset-2"
          href={fileUrl}
        >
          Lihat File
        </a>
      </div>
    </div>
  );
}
