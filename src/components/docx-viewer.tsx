"use client";

import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

interface DocxViewerProps {
  fileUrl: string;
}

export default function DocxViewer({ fileUrl }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fileUrl) return;

    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (containerRef.current) {
          renderAsync(blob, containerRef.current, undefined, {
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: true,
          });
        }
      });
  }, [fileUrl]);

  return <div ref={containerRef} className="prose max-w-full" />;
}
