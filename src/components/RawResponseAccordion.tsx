import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  data: unknown;
}

export function RawResponseAccordion({ data }: Props) {
  return (
    <Accordion disableGutters variant="outlined">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">Technical details (raw JSON)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          component="pre"
          sx={{
            m: 0,
            p: 2,
            bgcolor: "background.default",
            borderRadius: 1,
            overflow: "auto",
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
