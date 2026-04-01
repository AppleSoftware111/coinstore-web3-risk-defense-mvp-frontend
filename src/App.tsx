import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ScenarioButtons, type ScenarioId } from "./components/ScenarioButtons";
import { ResultHero } from "./components/ResultHero";
import { MetricsRow } from "./components/MetricsRow";
import { ReasonList } from "./components/ReasonList";
import { PipelineTiming } from "./components/PipelineTiming";
import { RawResponseAccordion } from "./components/RawResponseAccordion";
import { useRiskWebSocket } from "./hooks/useRiskWebSocket";
import { getApiBaseUrl, withApiHeaders } from "./lib/apiBase";
import type { AnalyzeRequest, DemoPostResponse, NetworkInfo, RiskDecision, WsMessage } from "./types";

type ViewModel = {
  scenario?: string;
  request: AnalyzeRequest;
  decision: RiskDecision;
  source: string;
};

const defaultAnalyze: AnalyzeRequest = {
  tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  chainId: 1,
  action: "BUY",
  amount: "1",
};

function wsToView(msg: WsMessage): ViewModel | null {
  if (msg.type === "demo") return { scenario: msg.scenario, request: msg.request, decision: msg.decision, source: "WebSocket (demo)" };
  if (msg.type === "analysis") return { request: msg.request, decision: msg.decision, source: "WebSocket (analysis)" };
  return null;
}

export default function App() {
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [loading, setLoading] = useState<ScenarioId | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [form, setForm] = useState<AnalyzeRequest>(defaultAnalyze);
  const [view, setView] = useState<ViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/networks`, { headers: withApiHeaders() })
      .then((res) => res.json())
      .then((json: { networks: NetworkInfo[] }) => {
        setNetworks(json.networks);
        if (json.networks.length > 0 && !json.networks.some((network) => network.chainId === form.chainId)) {
          setForm((current) => ({ ...current, chainId: json.networks[0]!.chainId }));
        }
      })
      .catch(() => setError("Failed to load supported networks"));
  }, [form.chainId]);

  const networkMap = useMemo(() => new Map(networks.map((network) => [network.chainId, network])), [networks]);
  const currentNetwork = networkMap.get(form.chainId);

  const onWs = useCallback((msg: WsMessage) => {
    const next = wsToView(msg);
    if (next) setView(next);
  }, []);
  const wsStatus = useRiskWebSocket(onWs);

  const runCustomAnalyze = async () => {
    setAnalyzeLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/analyze`, {
        method: "POST",
        headers: withApiHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
      }
      const decision = (await response.json()) as RiskDecision;
      setView({ request: form, decision, source: "API (/api/analyze)" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const runScenario = async (id: ScenarioId) => {
    setLoading(id);
    setError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/demo/${id}`, {
        method: "POST",
        headers: withApiHeaders(),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as DemoPostResponse;
      setView({ scenario: data.scenario, request: data.request, decision: data.decision, source: "API" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(null);
    }
  };

  const selectedViewNetwork = view ? networkMap.get(view.request.chainId) : undefined;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Coinstore Web3 Wallet MVP
          </Typography>
          <Chip
            size="small"
            label={wsStatus === "connected" ? "Live stream connected" : wsStatus === "connecting" ? "Connecting..." : "Live stream offline"}
            color={wsStatus === "connected" ? "success" : wsStatus === "connecting" ? "warning" : "default"}
            variant={wsStatus === "connected" ? "filled" : "outlined"}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Multi-chain risk screening with user-friendly network names. The API still uses numeric chain IDs internally, but the UI only shows supported networks.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          {currentNetwork
            ? `${currentNetwork.name} (${currentNetwork.chainId}) selected. RPC ${currentNetwork.rpcConfigured ? "configured" : "not configured"}; ${
                currentNetwork.simulationSupported ? "router simulation supported" : "router simulation limited"
              }.`
            : "Loading supported networks..."}
        </Alert>

        <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Custom analyze
          </Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Token address" fullWidth size="small" value={form.tokenAddress} onChange={(e) => setForm((v) => ({ ...v, tokenAddress: e.target.value }))} />
              <TextField label="Wallet address" fullWidth size="small" value={form.walletAddress} onChange={(e) => setForm((v) => ({ ...v, walletAddress: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Network"
                size="small"
                sx={{ minWidth: 220 }}
                value={form.chainId}
                onChange={(e) => setForm((v) => ({ ...v, chainId: Number(e.target.value) }))}
              >
                {networks.map((network) => (
                  <MenuItem key={network.chainId} value={network.chainId}>
                    {network.name} ({network.chainId})
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Action" size="small" sx={{ minWidth: 160 }} value={form.action} onChange={(e) => setForm((v) => ({ ...v, action: e.target.value as AnalyzeRequest["action"] }))}>
                <MenuItem value="BUY">BUY</MenuItem>
                <MenuItem value="SELL">SELL</MenuItem>
                <MenuItem value="TRANSFER">TRANSFER</MenuItem>
              </TextField>
              <TextField label={`Amount (${currentNetwork?.nativeSymbol ?? "native"})`} size="small" value={form.amount ?? ""} onChange={(e) => setForm((v) => ({ ...v, amount: e.target.value }))} />
            </Stack>
            <Button variant="outlined" disabled={analyzeLoading} onClick={runCustomAnalyze}>
              {analyzeLoading ? "Analyzing..." : "Run analyze"}
            </Button>
          </Stack>
        </Paper>

        <ScenarioButtons loading={loading} onRun={runScenario} />

        <Box sx={{ mt: 4 }}>
          {!view ? (
            <Paper sx={{ p: 3, textAlign: "center" }} variant="outlined">
              <Typography color="text.secondary">Run a scenario to see verdict, confidence, network label, and pipeline timing.</Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              <Typography variant="caption" color="text.secondary">
                Source: {view.source}
                {view.scenario ? ` · Scenario: ${view.scenario}` : ""}
              </Typography>

              <ResultHero action={view.decision.action} elapsedMs={view.decision.elapsedMs} />

              <Paper sx={{ p: 3 }} variant="outlined">
                <MetricsRow
                  status={view.decision.status}
                  action={view.decision.action}
                  confidence={view.decision.confidence}
                  score={view.decision.score}
                  cached={view.decision.cached}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Request
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip size="small" label={`Token: ${view.request.tokenAddress}`} variant="outlined" />
                  <Chip size="small" label={`Wallet: ${view.request.walletAddress}`} variant="outlined" />
                  <Chip size="small" label={`Network: ${selectedViewNetwork?.name ?? `Chain ${view.request.chainId}`}`} variant="outlined" />
                  <Chip size="small" label={`Chain ID: ${view.request.chainId}`} variant="outlined" />
                  <Chip size="small" label={view.request.action} variant="outlined" />
                </Stack>
                <ReasonList reason={view.decision.reason} />
                <Divider sx={{ my: 2 }} />
                <PipelineTiming components={view.decision.components} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Trace: {view.decision.traceId} · Ruleset: {view.decision.rulesetVersion}
                  {view.decision.codeHash ? ` · Code hash: ${view.decision.codeHash.slice(0, 18)}...` : ""}
                </Typography>
                <RawResponseAccordion data={{ scenario: view.scenario, request: view.request, decision: view.decision }} />
              </Paper>
            </Stack>
          )}
        </Box>
      </Container>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setError(null)} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
