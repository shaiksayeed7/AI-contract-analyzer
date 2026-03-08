import Link from "next/link";
import { ArrowRight, Shield, Zap, MessageSquare, BarChart3, Upload, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">LexiScan <span className="text-indigo-600">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link>
          <Link href="/upload" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-sm text-indigo-700 font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Contract Analysis
        </div>
        <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
          Understand any contract<br />
          <span className="text-indigo-600">in under 2 minutes</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          LexiScan AI reads your contracts, highlights risks visually, extracts key clauses,
          and lets you chat with the document. No legal degree required.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            Upload Your Contract
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
        <p className="text-sm text-slate-400 mt-4">Free · No credit card required · 5 contracts/month</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Everything you need to understand contracts
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            From upload to insight in seconds. No lawyer needed.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: "Smart Upload",
                desc: "Upload PDF, DOCX, or image files. Our OCR engine extracts text from any format.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Shield,
                title: "Risk Analysis",
                desc: "AI assigns risk scores to each clause. Color-coded map shows exactly where to focus.",
                color: "bg-red-100 text-red-600",
              },
              {
                icon: BarChart3,
                title: "Visual Dashboard",
                desc: "Clean dashboard with risk score, key parties, payment terms, and obligations tracker.",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: MessageSquare,
                title: "Contract Chatbot",
                desc: "Ask any question about the contract in plain English. AI cites specific clauses.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: CheckCircle,
                title: "Clause Highlights",
                desc: "See every clause highlighted by risk level with plain-English explanations.",
                color: "bg-amber-100 text-amber-600",
              },
              {
                icon: Zap,
                title: "Compare Contracts",
                desc: "Upload two versions and instantly see what changed and whether it's better or worse.",
                color: "bg-indigo-100 text-indigo-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk map preview */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Visual risk map at a glance
            </h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Instead of reading 50 pages, see a color-coded risk breakdown in seconds.
              Know exactly which clauses need attention.
            </p>
            <Link href="/upload" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
              Try it now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
            <p className="text-sm font-semibold text-slate-700 mb-4">Risk Map</p>
            {[
              { label: "Liability", risk: "high", score: 85 },
              { label: "Termination", risk: "medium", score: 55 },
              { label: "Payment Terms", risk: "low", score: 20 },
              { label: "Confidentiality", risk: "low", score: 15 },
              { label: "IP Ownership", risk: "medium", score: 50 },
            ].map(({ label, risk, score }) => (
              <div key={label} className="flex items-center gap-3 py-2">
                <span>{risk === "high" ? "🔴" : risk === "medium" ? "🟡" : "🟢"}</span>
                <span className="text-sm text-slate-700 flex-1">{label}</span>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${risk === "high" ? "bg-red-400" : risk === "medium" ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${risk === "high" ? "text-red-600" : risk === "medium" ? "text-amber-600" : "text-emerald-600"}`}>
                  {risk === "high" ? "High" : risk === "medium" ? "Medium" : "Safe"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Simple pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Get started",
                features: ["5 contracts/month", "Basic analysis", "Risk score", "Dashboard"],
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$25",
                desc: "/month",
                features: ["100 contracts/month", "AI Chatbot", "Clause highlights", "Obligations tracker", "Contract comparison"],
                cta: "Start Pro",
                highlight: true,
              },
              {
                name: "Team",
                price: "$99",
                desc: "/month",
                features: ["Unlimited contracts", "Team collaboration", "Priority support", "API access", "Custom integrations"],
                cta: "Start Team",
                highlight: false,
              },
            ].map(({ name, price, desc, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 border ${highlight ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-900"}`}
              >
                <h3 className="font-bold text-lg">{name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold">{price}</span>
                  <span className={`text-sm ${highlight ? "text-indigo-200" : "text-slate-400"}`}>{desc}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${highlight ? "text-indigo-200" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/upload"
                  className={`mt-6 block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${highlight ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} LexiScan AI. Built for founders & teams.</p>
      </footer>
    </div>
  );
}
