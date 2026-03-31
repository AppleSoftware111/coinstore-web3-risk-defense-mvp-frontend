import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export function PipelineTiming(props: {
  components: { cacheMs: number; chainMs?: number; ruleMs: number; simulationMs: number; aiMs: number };
}) {
  const rows = [
    { label: "Cache", ms: props.components.cacheMs },
    { label: "Chain I/O", ms: props.components.chainMs ?? 0 },
    { label: "Rules", ms: props.components.ruleMs },
    { label: "Simulation", ms: props.components.simulationMs },
    { label: "AI", ms: props.components.aiMs },
  ];
  return (
    <div>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Pipeline timing (ms)
      </Typography>
      <Table size="small" sx={{ maxWidth: 480 }}>
        <TableHead>
          <TableRow>
            <TableCell>Stage</TableCell>
            <TableCell align="right">ms</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell>{row.label}</TableCell>
              <TableCell align="right">{row.ms.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
