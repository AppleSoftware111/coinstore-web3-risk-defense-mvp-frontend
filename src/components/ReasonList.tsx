import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import GppBadIcon from "@mui/icons-material/GppBad";

interface Props {
  reason: string;
}

export function ReasonList({ reason }: Props) {
  const parts = reason
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Why
      </Typography>
      <List dense disablePadding>
        {parts.map((text, i) => (
          <ListItem key={i} alignItems="flex-start" sx={{ py: 0.5, pl: 0 }}>
            <GppBadIcon sx={{ fontSize: 18, mr: 1, mt: 0.25, opacity: 0.7 }} color="warning" />
            <ListItemText primary={text} primaryTypographyProps={{ variant: "body2" }} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
