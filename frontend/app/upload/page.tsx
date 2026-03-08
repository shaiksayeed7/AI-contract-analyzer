import { AppLayout } from "@/components/layout/AppLayout";
import { ContractUpload } from "@/components/contract/ContractUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Upload Contract – LexiScan AI",
};

export default function UploadPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Upload Contract</h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload a contract and get a full AI analysis in seconds
          </p>
        </div>

        <ContractUpload />
      </div>
    </AppLayout>
  );
}
