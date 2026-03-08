"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, GitCompare, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { listContracts, compareContracts } from "@/lib/api";
import type { Contract, ComparisonResult } from "@/types";

export default function ComparePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedId1, setSelectedId1] = useState("");
  const [selectedId2, setSelectedId2] = useState("");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listContracts().then((data) => setContracts(data.filter((c) => c.status === "ready")));
  }, []);

  const handleCompare = async () => {
    if (!selectedId1 || !selectedId2) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await compareContracts(selectedId1, selectedId2);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  const RiskChangeIcon = ({ change }: { change: string }) => {
    if (change === "better") return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (change === "worse") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Compare Contracts</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select two contracts to compare differences side by side
          </p>
        </div>

        {/* Contract selector */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Contract 1</label>
                <select
                  value={selectedId1}
                  onChange={(e) => setSelectedId1(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select contract…</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex-shrink-0 mt-5">
                <GitCompare className="w-5 h-5 text-slate-400" />
              </div>

              <div className="flex-1 min-w-48">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Contract 2</label>
                <select
                  value={selectedId2}
                  onChange={(e) => setSelectedId2(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select contract…</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex-shrink-0 mt-5">
                <Button
                  onClick={handleCompare}
                  disabled={!selectedId1 || !selectedId2 || selectedId1 === selectedId2}
                  loading={loading}
                >
                  Compare
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {contracts.length < 2 && (
              <p className="text-xs text-amber-600 mt-3">
                You need at least 2 analyzed contracts to use this feature.{" "}
                <Link href="/upload" className="underline">Upload contracts</Link>
              </p>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {result.comparison.summary}
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  result.comparison.risk_change === "improved"
                    ? "bg-emerald-100 text-emerald-700"
                    : result.comparison.risk_change === "worsened"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {result.comparison.risk_change === "improved" ? "📈" : result.comparison.risk_change === "worsened" ? "📉" : "➡️"}
                  Risk {result.comparison.risk_change}
                </div>
              </CardContent>
            </Card>

            {/* Differences */}
            <Card>
              <CardHeader>
                <CardTitle>Key Differences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.comparison.differences.map((diff, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                        <span className="text-sm font-semibold text-slate-700">{diff.section}</span>
                        <div className="flex items-center gap-1.5">
                          <RiskChangeIcon change={diff.risk_change} />
                          <span className={`text-xs font-medium ${
                            diff.risk_change === "better" ? "text-emerald-600" : diff.risk_change === "worse" ? "text-red-600" : "text-slate-500"
                          }`}>
                            {diff.risk_change}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-200">
                        <div className="p-4">
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            {result.contract1.title}
                          </p>
                          <p className="text-sm text-slate-700">{diff.version1}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            {result.contract2.title}
                          </p>
                          <p className="text-sm text-slate-700">{diff.version2}</p>
                        </div>
                      </div>
                      {diff.impact && (
                        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
                          <p className="text-xs text-amber-700">💡 {diff.impact}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {result.comparison.recommendation}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      {result.contract1.title} advantages
                    </p>
                    <ul className="space-y-1">
                      {result.comparison.version1_advantages.map((adv, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">✓</span> {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      {result.contract2.title} advantages
                    </p>
                    <ul className="space-y-1">
                      {result.comparison.version2_advantages.map((adv, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">✓</span> {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
