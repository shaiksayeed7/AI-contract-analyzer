"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { uploadContract } from "@/lib/api";
import { useRouter } from "next/navigation";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "text/plain": [".txt"],
};

export function ContractUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setError(null);
      // Auto-fill title from filename
      const baseName = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(baseName);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === "file-too-large") {
        setError("File is too large. Maximum size is 50MB.");
      } else if (err?.code === "file-invalid-type") {
        setError("Unsupported file type. Please upload PDF, DOCX, PNG, or JPG.");
      } else {
        setError("Invalid file. Please try again.");
      }
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadContract(file, title || file.name);
      router.push(`/contracts/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle("");
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Drop zone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                isDragActive ? "bg-indigo-100" : "bg-slate-100"
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8",
                  isDragActive ? "text-indigo-600" : "text-slate-400"
                )}
              />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">
                {isDragActive ? "Drop your contract here" : "Upload your contract"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Drag & drop or{" "}
                <span className="text-indigo-600 font-medium">browse files</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["PDF", "DOCX", "PNG", "JPG", "TXT"].map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400">Max file size: 50MB</p>
          </div>
        </div>
      ) : (
        /* File selected state */
        <div className="border border-slate-200 rounded-xl p-5 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={removeFile}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contract title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vendor Agreement with Acme Corp"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Upload button */}
      {file && (
        <Button
          onClick={handleUpload}
          loading={uploading}
          size="lg"
          className="w-full"
        >
          {uploading ? (
            "Uploading & analyzing…"
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Analyze Contract
            </>
          )}
        </Button>
      )}

      {/* Info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Text extraction", desc: "PDF, DOCX, images" },
          { label: "AI analysis", desc: "Risk scoring & clauses" },
          { label: "RAG chatbot", desc: "Ask anything about it" },
        ].map(({ label, desc }) => (
          <div key={label} className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
