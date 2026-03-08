"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { cn, getRiskColor, getRiskEmoji } from "@/lib/utils";
import { Clause } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface ClauseCardProps {
  clause: Clause;
}

export function ClauseCard({ clause }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const RiskIcon =
    clause.risk_level === "high"
      ? AlertTriangle
      : clause.risk_level === "medium"
      ? AlertCircle
      : CheckCircle;

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden transition-all",
        clause.risk_level === "high"
          ? "border-red-200 bg-red-50/30"
          : clause.risk_level === "medium"
          ? "border-amber-200 bg-amber-50/30"
          : "border-emerald-200 bg-emerald-50/30"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-black/[0.02] transition-colors"
      >
        <RiskIcon
          className={cn(
            "w-4 h-4 flex-shrink-0",
            getRiskColor(clause.risk_level, "text")
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">
              {clause.title}
            </span>
            <Badge className={getRiskColor(clause.risk_level)}>
              {getRiskEmoji(clause.risk_level)}{" "}
              {clause.risk_level.charAt(0).toUpperCase() + clause.risk_level.slice(1)} Risk
            </Badge>
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {clause.clause_type}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          {/* Clause text */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Contract Text</p>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              &ldquo;{clause.content}&rdquo;
            </p>
          </div>

          {/* AI explanation */}
          {clause.explanation && (
            <div className="flex gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">ℹ</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-0.5">Explanation</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {clause.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Suggestion */}
          {clause.suggestion && (
            <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-lg p-3">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">
                  Suggested Change
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {clause.suggestion}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
