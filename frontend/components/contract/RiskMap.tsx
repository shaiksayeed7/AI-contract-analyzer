"use client";
import { getRiskColor, getRiskEmoji, getRiskLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface RiskMapProps {
  riskBreakdown?: Record<string, { risk: string; score: number }>;
  clauses?: Array<{
    clause_type: string;
    risk_level: string;
    risk_score: number;
  }>;
}

const DEFAULT_CATEGORIES = [
  "Payment Terms",
  "Termination",
  "Liability / Indemnification",
  "Confidentiality / NDA",
  "IP Ownership",
  "Data Ownership",
];

export function RiskMap({ riskBreakdown, clauses }: RiskMapProps) {
  // Build risk data from either riskBreakdown or clauses
  const items: Array<{ category: string; risk: string; score: number }> = [];

  if (riskBreakdown && Object.keys(riskBreakdown).length > 0) {
    for (const [category, data] of Object.entries(riskBreakdown)) {
      items.push({ category, risk: data.risk, score: data.score });
    }
  } else if (clauses && clauses.length > 0) {
    // Group by clause_type and pick highest risk
    const grouped: Record<string, { risk: string; score: number }> = {};
    for (const clause of clauses) {
      const existing = grouped[clause.clause_type];
      if (!existing || clause.risk_score > existing.score) {
        grouped[clause.clause_type] = {
          risk: clause.risk_level,
          score: clause.risk_score,
        };
      }
    }
    for (const [category, data] of Object.entries(grouped)) {
      items.push({ category, risk: data.risk, score: data.score });
    }
  } else {
    // Placeholder
    DEFAULT_CATEGORIES.forEach((cat) =>
      items.push({ category: cat, risk: "unknown", score: 0 })
    );
  }

  return (
    <div className="space-y-2">
      {items.map(({ category, risk, score }) => (
        <div
          key={category}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <span className="text-base">{getRiskEmoji(risk)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-700 truncate">
                {category}
              </span>
              <Badge className={getRiskColor(risk)}>
                {getRiskLabel(risk)}
              </Badge>
            </div>
            {score > 0 && (
              <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    risk === "high"
                      ? "bg-red-400"
                      : risk === "medium"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
