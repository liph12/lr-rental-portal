import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { type SvgIconTypeMap, Box, Typography, Divider } from "@mui/material";

interface PropertyStatProps {
  label: string;
  rate: number;
  units: number;
  lotArea: number | null;
  floorArea: number | null;
  Icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  img?: string;
}

export default function PropertyCard({
  label,
  rate,
  units,
  lotArea,
  floorArea,
}: PropertyStatProps) {
  const rentalRate = units === 0 ? 0 : rate / units;
  const numberOfUnits = units === 0 ? 0 : units;
  const averageFloorArea =
    floorArea === null
      ? 0
      : numberOfUnits > 0
      ? floorArea / numberOfUnits
      : floorArea;
  const averagePricePerSqm =
    floorArea === 0 || floorArea === null
      ? 0
      : (rentalRate / averageFloorArea).toFixed(2);

  return (
    <Box sx={{ py: 1, px: 2, bgcolor: "#fff", height: "16vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <>
          <Typography variant="body1" fontWeight={700} sx={{ fontSize: 18 }}>
            {label}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box>
              <Typography>
                {floorArea === null
                  ? "N/A"
                  : `${floorArea.toLocaleString()} m²`}
              </Typography>
              <Typography variant="caption" color="primary">
                Floor Area
              </Typography>
            </Box>
            <Divider sx={{ height: 30 }} orientation="vertical" />
            <Box>
              <Typography>
                {lotArea === null ? "N/A" : `${lotArea.toLocaleString()} m²`}
              </Typography>
              <Typography variant="caption" color="primary">
                Lot Area
              </Typography>
            </Box>
          </Box>
        </>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="h6" fontFamily="monospace">
            {rentalRate.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="warning">
            Ave. Rental Rate
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h6" fontFamily="monospace">
            {numberOfUnits.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="primary">
            Units
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {averagePricePerSqm.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="primary">
            Ave. Price / m²
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
