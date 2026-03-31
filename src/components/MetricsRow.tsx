import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { DecisionStatus, PolicyAction } from "../types";

export function MetricsRow(props: {
  status: DecisionStatus;
  action: PolicyAction;
  confidence: number;
  score: number;
  cached: boolean;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Chip label={`Status: ${props.status}`} variant="outlined" color="primary" />
        <Chip label={`Action: ${props.action}`} variant="outlined" color="secondary" />
        <Chip label={`Score: ${props.score}`} variant="outlined" />
        <Chip label={`Confidence: ${props.confidence}%`} variant="outlined" />
        {props.cached ? <Chip label="Cached result" size="small" color="info" /> : null}
      </Stack>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Confidence
        </Typography>
        <LinearProgress variant="determinate" value={Math.min(100, props.confidence)} sx={{ mt: 0.5, height: 8, borderRadius: 1 }} />
      </Box>
    </Stack>
  );
}
