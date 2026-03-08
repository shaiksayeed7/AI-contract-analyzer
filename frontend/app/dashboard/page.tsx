"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { listContracts, deleteContract } from "@/lib/api";
import { getRiskColor, formatDate, formatFileSize } from "@/lib/utils";
import type { Contract } from "@/types";

function StatusIcon({ status }: { status: string }) {
  if (status === "ready") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-500" />;
  if (status === "processing" || status === "uploading")
    return <Loader className="w-4 h-4 text-indigo-500 animate-spin" />;
  return <Clock className="w-4 h-4 text-slate-400" />;
}

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  // Poll for status updates every 5s only when contracts are actively processing
  useEffect(() => {
    const hasProcessing = contracts.some(
      (c) => c.status === "processing" || c.status === "uploading"
    );
    if (!hasProcessing) return;
    const interval = setInterval(loadContracts, 5000);
    return () => clearInterval(interval);
  }, [contracts]);

  const loadContracts = async () => {
    try {
      const data = await listContracts();
      setContracts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this contract?")) return;
    setDeletingId(id);
    try {
      await deleteContract(id);
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: contracts.length,
    highRisk: contracts.filter((c) => c.risk_level === "high").length,
    ready: contracts.filter((c) => c.status === "ready").length,
    avgScore:
      contracts.filter((c) => c.risk_score > 0).length > 0
        ? Math.round(
            contracts.filter((c) => c.risk_score > 0).reduce((s, c) => s + c.risk_score, 0) /
              contracts.filter((c) => c.risk_score > 0).length
          )
        : 0,
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contract Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and analyze your contracts
            </p>
          </div>
          <Link href="/upload">
            <Button>
              <Plus className="w-4 h-4" /> New Contract
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Contracts", value: stats.total, color: "text-slate-900" },
            { label: "Analyzed", value: stats.ready, color: "text-emerald-600" },
            { label: "High Risk", value: stats.highRisk, color: "text-red-600" },
            { label: "Avg Risk Score", value: stats.avgScore, color: stats.avgScore >= 70 ? "text-red-600" : stats.avgScore >= 40 ? "text-amber-600" : "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="py-4">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contracts list */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No contracts yet</h3>
              <p className="text-sm text-slate-500 mb-6">
                Upload your first contract to get started
              </p>
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4" /> Upload Contract
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <Link
                key={contract.id}
                href={contract.status === "ready" ? `/contracts/${contract.id}` : "#"}
                className={contract.status === "ready" ? "block" : "block cursor-default"}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Risk gauge for ready contracts */}
                      {contract.status === "ready" && contract.risk_score > 0 && (
                        <div className="flex-shrink-0">
                          <RiskGauge score={contract.risk_score} size="sm" />
                        </div>
                      )}

                      {/* Contract info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon status={contract.status} />
                          <h3 className="font-semibold text-slate-800 truncate">
                            {contract.title}
                          </h3>
                          {contract.status === "ready" && (
                            <Badge className={getRiskColor(contract.risk_level)}>
                              {contract.risk_level}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{contract.file_name}</span>
                          <span>{formatFileSize(contract.file_size)}</span>
                          <span>{formatDate(contract.created_at)}</span>
                          {contract.contract_type && (
                            <span className="text-indigo-500">{contract.contract_type}</span>
                          )}
                        </div>
                        {contract.summary && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                            {contract.summary}
                          </p>
                        )}
                        {(contract.status === "processing" || contract.status === "uploading") && (
                          <p className="text-xs text-indigo-500 mt-1">
                            Analyzing contract… this may take a moment
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={(e) => handleDelete(contract.id, e)}
                        disabled={deletingId === contract.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        {deletingId === contract.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
