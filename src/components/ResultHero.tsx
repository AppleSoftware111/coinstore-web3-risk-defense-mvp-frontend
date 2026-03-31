import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import type { PolicyAction } from "../types";

function headlineForAction(action: PolicyAction, ms: number): string {
  const t = `${Math.round(ms)}ms`;
  switch (action) {
    case "BLOCK":
      return `Scam blocked in ${t}`;
    case "STRONG_WARNING":
      return `Strong warning in ${t}`;
    case "ALLOW":
      return `Allowed in ${t}`;
    default:
      return `Decision in ${t}`;
  }
}

function colorForAction(action: PolicyAction): "error" | "warning" | "success" {
  switch (action) {
    case "BLOCK":
      return "error";
    case "STRONG_WARNING":
      return "warning";
    default:
      return "success";
  }
}

interface Props {
  action: PolicyAction;
  elapsedMs: number;
}

export function ResultHero({ action, elapsedMs }: Props) {
  const color = colorForAction(action);
  return (
    <Paper
      elevation={0}
      sx={{
        px: 3,
        py: 2.5,
        border: 1,
        borderColor: `${color}.main`,
        bgcolor:
          color === "error"
            ? "rgba(244, 67, 54, 0.08)"
            : color === "warning"
              ? "rgba(255, 152, 0, 0.08)"
              : "rgba(76, 175, 80, 0.08)",
      }}
    >
      <Typography variant="h4" component="h2" color={`${color}.main`}>
        {headlineForAction(action, elapsedMs)}
      </Typography>
    </Paper>
  );
}
