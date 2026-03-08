export interface Contract {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: "uploading" | "processing" | "ready" | "failed";
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "unknown";
  summary: string | null;
  contract_type: string | null;
  parties: Party[];
  effective_date: string | null;
  expiry_date: string | null;
  obligations: Obligation[];
  key_terms: KeyTerm[];
  clauses?: Clause[];
  created_at: string;
  updated_at: string | null;
}

export interface Party {
  name: string;
  role: string;
}

export interface Obligation {
  party: string;
  obligation: string;
  deadline: string | null;
}

export interface KeyTerm {
  term: string;
  value: string;
  risk: "low" | "medium" | "high";
}

export interface Clause {
  id: string;
  clause_type: string;
  title: string;
  content: string;
  risk_level: "low" | "medium" | "high" | "unknown";
  risk_score: number;
  explanation: string | null;
  suggestion: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  risk_level?: string | null;
  cited_clauses?: string[];
  created_at?: string;
}

export interface ComparisonResult {
  contract1: { id: string; title: string };
  contract2: { id: string; title: string };
  comparison: {
    summary: string;
    risk_change: "improved" | "worsened" | "neutral";
    differences: ComparisonDifference[];
    version1_advantages: string[];
    version2_advantages: string[];
    recommendation: string;
  };
}

export interface ComparisonDifference {
  section: string;
  version1: string;
  version2: string;
  impact: string;
  risk_change: "better" | "worse" | "neutral";
}
