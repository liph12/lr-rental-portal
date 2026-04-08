import { Typography, Box, type SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";

interface OverViewInfoCardProps {
  title: string;
  value: number;
  subTitle: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  iconColor?: "warning.main" | "primary.main" | "error.main" | "info.main";
  loading?: boolean;
}

export default function OverviewInfoCard({
  title,
  value,
  subTitle,
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
      <Typography variant="h5" fontFamily="monospace">
        {loading ? "---" : value.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="primary">
        {subTitle}
      </Typography>
    </Box>
  );
}
