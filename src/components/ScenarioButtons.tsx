import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

export type ScenarioId = "malicious" | "suspicious" | "safe";

const scenarios: { id: ScenarioId; label: string; color: "error" | "warning" | "success" }[] = [
  { id: "malicious", label: "Malicious scenario", color: "error" },
  { id: "suspicious", label: "Suspicious scenario", color: "warning" },
  { id: "safe", label: "Safe scenario", color: "success" },
];

export function ScenarioButtons(props: { loading: ScenarioId | null; onRun: (id: ScenarioId) => void }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap flexWrap="wrap">
      {scenarios.map((scenario) => (
        <Button
          key={scenario.id}
          variant="contained"
          color={scenario.color}
          disabled={props.loading !== null}
          startIcon={props.loading === scenario.id ? <CircularProgress size={18} color="inherit" /> : null}
          onClick={() => props.onRun(scenario.id)}
        >
          {scenario.label}
        </Button>
      ))}
    </Stack>
  );
}
