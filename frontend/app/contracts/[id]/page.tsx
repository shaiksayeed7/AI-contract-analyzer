"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Calendar, Users, FileText, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { RiskMap } from "@/components/contract/RiskMap";
import { ClauseCard } from "@/components/contract/ClauseCard";
import { getContract, getContractStatus } from "@/lib/api";
import { getRiskColor, formatDate, formatFileSize } from "@/lib/utils";
import type { Contract } from "@/types";

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContract();
  }, [id]);

  // Poll while processing
  useEffect(() => {
    if (!contract) return;
    if (contract.status === "processing" || contract.status === "uploading") {
      const timer = setTimeout(async () => {
        const status = await getContractStatus(id);
        if (status.status === "ready") {
          loadContract();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [contract?.status, id]);

  const loadContract = async () => {
    try {
      const data = await getContract(id);
      setContract(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Contract not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Loading contract…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !contract) {
    return (
      <AppLayout>
        <div className="p-6 max-w-2xl mx-auto text-center py-20">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Contract not found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Processing state
  if (contract.status === "processing" || contract.status === "uploading") {
    return (
      <AppLayout>
        <div className="p-6 max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Analyzing your contract…
          </h2>
          <p className="text-slate-500 mb-2">
            Our AI is extracting clauses, assessing risks, and building your dashboard.
          </p>
          <p className="text-sm text-indigo-500">This typically takes 10–30 seconds</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const highRiskClauses = contract.clauses?.filter((c) => c.risk_level === "high") || [];
  const mediumRiskClauses = contract.clauses?.filter((c) => c.risk_level === "medium") || [];

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back + header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
                <Badge className={getRiskColor(contract.risk_level)}>
                  {contract.risk_level} risk
                </Badge>
                {contract.contract_type && (
                  <Badge variant="outline" className="text-slate-500">
                    {contract.contract_type}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                <span>{contract.file_name}</span>
                <span>{formatFileSize(contract.file_size)}</span>
                <span>Uploaded {formatDate(contract.created_at)}</span>
              </div>
            </div>
            <Link
              href={`/contracts/${id}/chat`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              Ask AI
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            {contract.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 leading-relaxed">{contract.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Clause Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Clause Breakdown</CardTitle>
                  <div className="flex items-center gap-2 text-xs">
                    {highRiskClauses.length > 0 && (
                      <span className="text-red-600 font-medium">
                        {highRiskClauses.length} high risk
                      </span>
                    )}
                    {mediumRiskClauses.length > 0 && (
                      <span className="text-amber-600 font-medium">
                        {mediumRiskClauses.length} medium risk
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!contract.clauses || contract.clauses.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No clauses extracted. Configure OpenAI API key to enable AI analysis.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* High risk first */}
                    {[...contract.clauses]
                      .sort((a, b) => b.risk_score - a.risk_score)
                      .map((clause) => (
                        <ClauseCard key={clause.id} clause={clause} />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Obligations */}
            {contract.obligations && contract.obligations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Obligations Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contract.obligations.map((ob, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-indigo-600 font-bold">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{ob.party}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{ob.obligation}</p>
                          {ob.deadline && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due: {ob.deadline}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Risk score */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-2">
                <RiskGauge score={contract.risk_score} size="lg" />
              </CardContent>
            </Card>

            {/* Risk Map */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Map</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMap clauses={contract.clauses} />
              </CardContent>
            </Card>

            {/* Key details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Key Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contract.effective_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Effective Date</span>
                      <span className="font-medium text-slate-700">{contract.effective_date}</span>
                    </div>
                  )}
                  {contract.expiry_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Expiry Date</span>
                      <span className="font-medium text-amber-600">{contract.expiry_date}</span>
                    </div>
                  )}
                  {contract.parties && contract.parties.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Parties
                      </p>
                      {contract.parties.map((party, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span className="font-medium text-slate-700">{party.name}</span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {party.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key terms */}
            {contract.key_terms && contract.key_terms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contract.key_terms.map((term, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-slate-500 flex-shrink-0 w-28 truncate">{term.term}</span>
                        <span className="text-slate-700 font-medium flex-1">{term.value}</span>
                        <Badge className={`${getRiskColor(term.risk)} flex-shrink-0`}>
                          {term.risk}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ask AI CTA */}
            <Link href={`/contracts/${id}/chat`}>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-semibold">Ask LexiScan AI</span>
                </div>
                <p className="text-sm text-indigo-100">
                  &ldquo;Can the vendor increase the price?&rdquo;
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-200">
                  Chat with your contract <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
