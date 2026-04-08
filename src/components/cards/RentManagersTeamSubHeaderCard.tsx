import { Box, Divider, Typography } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material";

interface RentManagersTeamSubHeaderCardProps {
  title: string;
  leftValue: string | number;
  leftSubTitle: string;
  centerValue?: string | number;
  centerSubTitle?: string | number;
  rightValue?: string | number;
  rightSubTitle?: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
}

export default function RentManagersTeamSubHeaderCard({
  title,
  leftValue,
  leftSubTitle,
  centerValue,
  centerSubTitle,
  rightValue,
  rightSubTitle,
  Icon,
}: RentManagersTeamSubHeaderCardProps) {
  return (
    <Box sx={{ py: 1, px: 2, bgcolor: "#fff", height: "16vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Icon fontSize="large" sx={{ fontSize: 50, color: "#aaa" }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {leftValue.toLocaleString() ?? 0}
          </Typography>
          <Typography variant="caption" color="warning">
            {leftSubTitle}
          </Typography>
        </Box>
        {centerSubTitle && (
          <>
            <Divider orientation="vertical" sx={{ height: 50 }} />
            <Box>
              <Typography variant="h5" fontFamily="monospace">
                {centerValue?.toLocaleString() ?? "0"}
              </Typography>
              <Typography variant="caption" color="primary">
                {centerSubTitle}
              </Typography>
            </Box>
          </>
        )}
        {rightSubTitle && (
          <>
            <Divider orientation="vertical" sx={{ height: 50 }} />
            <Box>
              <Typography variant="h5" fontFamily="monospace">
                {rightValue?.toLocaleString() ?? "0"}
              </Typography>
              <Typography variant="caption" color="primary">
                {rightSubTitle}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
