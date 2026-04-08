import { Typography, Box, type SvgIconTypeMap, Divider } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";

interface OverViewInfoCardProps {
  title: string;
  floorArea: number;
  lotArea: number;
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  iconColor?: "warning.main" | "primary.main" | "error.main" | "info.main";
  loading?: boolean;
}

export default function OverviewInfoCardPropertyArea({
  title,
  floorArea,
  lotArea,
  Icon,
  iconColor,
  loading = true,
}: OverViewInfoCardProps) {
  return (
    <Box sx={{ py: 1, px: 2, mb: 2, bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Icon
            fontSize="large"
            sx={{ fontSize: 50, color: iconColor ?? "#aaa" }}
          />
        </>
      </Box>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Box>
          <Typography variant="h6" fontFamily="monospace">
            {loading ? "---" : `${floorArea.toLocaleString()} m²`}
          </Typography>
          <Typography variant="caption" color="primary">
            Floor Area
          </Typography>
        </Box>
        <Divider sx={{ height: 35 }} orientation="vertical" />
        <Box>
          <Typography variant="h6" fontFamily="monospace">
            {loading ? "---" : `${lotArea.toLocaleString()} m²`}
          </Typography>
          <Typography variant="caption" color="primary">
            Lot Area
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
