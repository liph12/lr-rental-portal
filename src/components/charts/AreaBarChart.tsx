import { HorizontalChartBar } from "../../utils/StyledBarChart";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { AreaStatistics } from "../../types";

interface PropertyBarChartProps {
  areaStatistics: AreaStatistics[] | null;
}

export default function AreaBarChart({
  areaStatistics,
}: PropertyBarChartProps) {
  return (
    <Box
      sx={{
        height: "30vh",
        overflow: "auto",
        bgcolor: "#fff",
        p: 2,
      }}
    >
      {areaStatistics ? (
        <>
          {areaStatistics.map((a, k) => {
            const MAX_VALUE = areaStatistics[0].value;
            const progress = Math.abs((a.value / MAX_VALUE) * 100);

            return (
              <HorizontalChartBar
                key={k}
                percentage={progress}
                label={a.name}
                value={a.value.toLocaleString()}
              />
            );
          })}
        </>
      ) : (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} color="primary" />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Fetching area statistics...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
