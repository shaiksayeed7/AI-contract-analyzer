"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractChat } from "@/components/contract/ContractChat";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-2rem)]">
        <div className="mb-4">
          <Link
            href={`/contracts/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Contract
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[calc(100%-3rem)] flex flex-col overflow-hidden">
          <ContractChat contractId={id} />
        </div>
      </div>
    </AppLayout>
  );
}
