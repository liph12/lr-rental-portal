import { Box, Container, Grid, Chip } from "@mui/material";
import PropertyCard from "../components/cards/PropertyCard";
import BedRoundedIcon from "@mui/icons-material/BedRounded";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import GarageOutlinedIcon from "@mui/icons-material/GarageOutlined";
import CountertopsOutlinedIcon from "@mui/icons-material/CountertopsOutlined";
import PropertyCardSkeleton from "../components/cards/PropertyCardSkeleton";
import PropertyBarChart from "../components/charts/PropertyBarChart";
import WindowOutlinedIcon from "@mui/icons-material/WindowOutlined";
import AreaBarChart from "../components/charts/AreaBarChart";
import { useAppContext } from "../providers/AppProvider";

const getPropertyUnitIcon = (k: string) => {
  switch (k) {
    case "Loft":
      return WeekendOutlinedIcon;
    case "Parking":
      return GarageOutlinedIcon;
    case "Studio":
      return CountertopsOutlinedIcon;
    case "Penthouse":
      return WindowOutlinedIcon;
    default:
      return BedRoundedIcon;
  }
};

export default function Overview() {
  const { areaStatistics, propertyUnits } = useAppContext();

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ mb: 10 }}>
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Condominium Units Overview (Ave. Rate)"
              size="small"
              color="warning"
              sx={{
                mb: 2,
                backgroundColor: "rgba(240, 194, 138, 0.44)",
                color: "warning.main",
                border: "1px solid rgb(230, 136, 21)",
              }}
            />
            <Grid container spacing={2}>
              {propertyUnits ? (
                Object.entries(propertyUnits).map(([k, v]) => (
                  <Grid size={{ lg: 4, md: 6, xs: 12 }} key={k}>
                    <PropertyCard
                      Icon={getPropertyUnitIcon(k)}
                      label={k}
                      rate={v.rate}
                      units={v.units}
                    />
                  </Grid>
                ))
              ) : (
                <>
                  {[1, 2, 3, 4, 5, 6, 7].map((r) => (
                    <Grid size={{ lg: 4, md: 6, xs: 12 }} key={r}>
                      <PropertyCardSkeleton />
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                <Chip
                  label="Properties Overview (TCP)"
                  size="small"
                  color="warning"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(240, 194, 138, 0.44)",
                    color: "warning.main",
                    border: "1px solid rgb(230, 136, 21)",
                  }}
                />
                <PropertyBarChart />
              </Grid>
              <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                <Chip
                  label="Area Overview (Total Remittance)"
                  size="small"
                  color="warning"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(240, 194, 138, 0.44)",
                    color: "warning.main",
                    border: "1px solid rgb(230, 136, 21)",
                  }}
                />
                <AreaBarChart areaStatistics={areaStatistics} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
}
