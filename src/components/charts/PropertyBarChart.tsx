import { HorizontalChartBar } from "../../utils/StyledBarChart";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAppContext } from "../../providers/AppProvider";

export default function PropertyBarChart() {
  const { properties } = useAppContext();

  return (
    <Box
      sx={{
        height: "30vh",
        overflow: "auto",
        bgcolor: "#fff",
        p: 2,
      }}
    >
      {properties ? (
        <>
          {properties.map((p, k) => {
            const MAX_VALUE = properties[0].tcp;
            const progress = Math.abs((p.tcp / MAX_VALUE) * 100);
            // const averageRentalRate = p.tcp / p.total_units;

            return (
              <HorizontalChartBar
                key={k}
                percentage={progress}
                label={p.catname}
                value={p.tcp.toLocaleString()}
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
              Fetching property statistics...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
