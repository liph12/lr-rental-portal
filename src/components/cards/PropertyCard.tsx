import type { OverridableComponent } from "@mui/material/OverridableComponent";
import {
  type SvgIconTypeMap,
  Box,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";

interface PropertyStatProps {
  label: string;
  rate: number;
  units: number;
  Icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  img?: string;
}

export default function PropertyCard({
  label,
  rate,
  units,
  Icon,
  img,
}: PropertyStatProps) {
  return (
    <Box sx={{ py: 1, px: 2, border: "1px solid #ddd", height: "16vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <>
          <Typography variant="h6" fontWeight={700}>
            {label}
          </Typography>
          {Icon && (
            <Icon fontSize="large" sx={{ fontSize: 50, color: "#aaa" }} />
          )}
          {img && <Avatar src={img} sx={{ height: "auto", width: 60 }} />}
        </>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {units === 0 ? 0 : (rate / units).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="warning">
            Average Rental Rate
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {units === 0 ? 0 : units?.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="primary">
            Number of Units
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
