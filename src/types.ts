export type DecisionStatus = "MALICIOUS" | "SUSPICIOUS" | "SAFE";
export type PolicyAction = "BLOCK" | "STRONG_WARNING" | "ALLOW";

export interface AnalyzeRequest {
  tokenAddress: string;
  walletAddress: string;
  chainId: number;
  action: "BUY" | "SELL" | "TRANSFER";
  amount?: string;
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  slug: string;
  rpcConfigured: boolean;
  simulationSupported: boolean;
  nativeSymbol: string;
}

export interface RiskDecision {
  status: DecisionStatus;
  action: PolicyAction;
  confidence: number;
  score: number;
  reason: string;
  elapsedMs: number;
  cached: boolean;
  traceId: string;
  rulesetVersion: string;
  codeHash?: string;
  evidence?: Record<string, unknown>;
  components: {
    cacheMs: number;
    chainMs?: number;
    ruleMs: number;
    simulationMs: number;
    aiMs: number;
  };
}

export interface DemoPostResponse {
  scenario: string;
  request: AnalyzeRequest;
  decision: RiskDecision;
}

export type WsMessage =
  | { type: "connected"; ts: number; message: string }
  | { type: "demo"; scenario: string; request: AnalyzeRequest; decision: RiskDecision }
  | { type: "analysis"; request: AnalyzeRequest; decision: RiskDecision };
