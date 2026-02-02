import { Box, Divider, Typography } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material";

interface RentManagersTeamSubHeaderCardProps {
  title: string;
  leftValue: string | number;
  leftSubTitle: string;
  rightValue: string | number;
  rightsubTitle: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
}

export default function RentManagersTeamSubHeaderCard({
  title,
  leftValue,
  leftSubTitle,
  rightValue,
  rightsubTitle,
  Icon,
}: RentManagersTeamSubHeaderCardProps) {
  return (
    <Box sx={{ py: 1, px: 2, border: "1px solid #ddd", height: "16vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Icon fontSize="large" sx={{ fontSize: 50, color: "#aaa" }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {leftValue}
          </Typography>
          <Typography variant="caption" color="warning">
            {leftSubTitle}
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {rightValue}
          </Typography>
          <Typography variant="caption" color="primary">
            {rightsubTitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
