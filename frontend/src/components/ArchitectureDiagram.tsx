import React from 'react';
import { 
  Bot, 
  Database, 
  Shield, 
  ArrowRight, 
  ArrowDown,
  Zap,
  CheckCircle,
  Link,
  Coins
} from 'lucide-react';

/**
 * ArchitectureDiagram - Visualizes the Three-Layer Architecture
 * 
 * Agent Layer: AI agents for evidence gathering and resolution
 * Knowledge Layer: OriginTrail DKG with Knowledge Assets
 * Trust Layer: x402 payments + NeuroWeb blockchain
 */
export function ArchitectureDiagram() {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-display font-semibold text-white mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent-400" />
        Three-Layer Architecture
      </h3>
      
      <div className="space-y-4">
        {/* Agent Layer */}
        <div className="glass-subtle rounded-lg p-4 border-l-4 border-cyan-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Agent Layer</h4>
              <p className="text-xs text-slate-400">AI-powered evidence gathering</p>
            </div>
          </div>
          <div className="ml-13 pl-3 border-l border-slate-700 mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Evidence Resolution Agent</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Guardian Ingest Agent</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>MCP Tool Integration</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-500" />
        </div>
        
        {/* Knowledge Layer */}
        <div className="glass-subtle rounded-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Knowledge Layer</h4>
              <p className="text-xs text-slate-400">OriginTrail DKG on NeuroWeb</p>
            </div>
          </div>
          <div className="ml-13 pl-3 border-l border-slate-700 mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Link className="w-3 h-3 text-purple-400" />
              <span>ContentAsset (JSON-LD)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Link className="w-3 h-3 text-purple-400" />
              <span>CaseAsset (Appeals)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Link className="w-3 h-3 text-purple-400" />
              <span>EvidenceAsset (Proofs)</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-500" />
        </div>
        
        {/* Trust Layer */}
        <div className="glass-subtle rounded-lg p-4 border-l-4 border-amber-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Trust Layer</h4>
              <p className="text-xs text-slate-400">Economic incentives & verification</p>
            </div>
          </div>
          <div className="ml-13 pl-3 border-l border-slate-700 mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>x402 Micropayments (USDC)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>NeuroWeb Parachain</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Polkadot Shared Security</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technology Stack */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center gap-4 text-xs">
          <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">DKG</span>
          <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-400">Polkadot</span>
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">x402</span>
          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">MCP</span>
        </div>
      </div>
    </div>
  );
}

/**
 * MCPToolsCard - Shows available MCP tools for AI agents
 */
export function MCPToolsCard() {
  const tools = [
    { name: 'query_flagged_content', desc: 'Search DKG for flagged items' },
    { name: 'verify_authenticity', desc: 'Verify content provenance' },
    { name: 'submit_appeal', desc: 'File new appeal via agent' },
    { name: 'gather_evidence', desc: 'Trigger evidence collection' },
    { name: 'get_trust_metrics', desc: 'Retrieve system analytics' },
    { name: 'sparql_query', desc: 'Query DKG with SPARQL' },
  ];
  
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-cyan-400" />
        MCP Tools for AI Agents
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Model Context Protocol integration allows AI agents to interact with the DKG
      </p>
      <div className="grid grid-cols-2 gap-3">
        {tools.map(tool => (
          <div key={tool.name} className="glass-subtle rounded-lg p-3 overflow-hidden">
            <code className="text-xs text-cyan-400 block truncate" title={tool.name}>{tool.name}</code>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tool.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * DataFlowDiagram - Shows how data flows through the system
 */
export function DataFlowDiagram() {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-display font-semibold text-white mb-4">
        Data Flow
      </h3>
      
      <div className="flex items-center justify-between text-center">
        <div className="flex-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-xs text-slate-400">Guardian AI</p>
          <p className="text-xs text-slate-500">Flags Content</p>
        </div>
        
        <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
        
        <div className="flex-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-xs text-slate-400">DKG</p>
          <p className="text-xs text-slate-500">Stores Assets</p>
        </div>
        
        <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
        
        <div className="flex-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">GAL Agent</p>
          <p className="text-xs text-slate-500">Gathers Evidence</p>
        </div>
        
        <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
        
        <div className="flex-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">Resolution</p>
          <p className="text-xs text-slate-500">Verified Decision</p>
        </div>
      </div>
    </div>
  );
}

export default ArchitectureDiagram;