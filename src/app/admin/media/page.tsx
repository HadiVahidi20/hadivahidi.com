"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface MediaFile {
  id: number;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  altText: string | null;
  createdAt: string | null;
}

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  function loadFiles() {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setFiles(res.data.files);
      })
      .finally(() => setLoading(false));
  }

  async function uploadFiles(fileList: FileList) {
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/admin/media", { method: "POST", body: formData });
    }
    setUploading(false);
    loadFiles();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-alt)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          Upload and manage your media files
        </p>
      </div>

      {/* Upload area */}
      <div
        className="rounded-xl p-8 text-center cursor-pointer transition-all"
        style={{
          backgroundColor: dragActive ? "rgba(var(--accent-rgb), 0.1)" : "var(--bg-alt)",
          border: `2px dashed ${dragActive ? "var(--accent)" : "var(--border-color)"}`,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <p className="text-lg font-medium mb-1">
          {uploading ? "Uploading..." : "Drop files here or click to upload"}
        </p>
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          Supports images, videos, PDFs, and documents
        </p>
      </div>

      {/* File grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="group rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}
          >
            <div className="relative aspect-square">
              {file.fileType.startsWith("image/") ? (
                <Image
                  src={file.filePath}
                  alt={file.altText || file.originalName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(var(--accent-rgb), 0.05)" }}>
                  <span className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    {file.fileType.split("/")[1]?.toUpperCase().slice(0, 3) || "FILE"}
                  </span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(file.filePath)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-black"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs truncate font-medium">{file.originalName}</p>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>
                {formatSize(file.fileSize)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-color)" }}>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            No files uploaded yet. Drag and drop to get started.
          </p>
        </div>
      )}
    </div>
  );
}
