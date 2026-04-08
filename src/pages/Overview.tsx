import { Box, Container, Grid } from "@mui/material";
import PropertyCard from "../components/cards/PropertyCard";
import BedRoundedIcon from "@mui/icons-material/BedRounded";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import GarageOutlinedIcon from "@mui/icons-material/GarageOutlined";
import CountertopsOutlinedIcon from "@mui/icons-material/CountertopsOutlined";
import PropertyCardSkeleton from "../components/cards/PropertyCardSkeleton";
import WindowOutlinedIcon from "@mui/icons-material/WindowOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import OverviewInfoCardGroup from "../components/cards/OverviewInfoCardGroup";
import HolidayVillageOutlinedIcon from "@mui/icons-material/HolidayVillageOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import CottageOutlinedIcon from "@mui/icons-material/CottageOutlined";
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
    case "Townhouse":
      return HolidayVillageOutlinedIcon;
    case "Warehouse":
      return WarehouseOutlinedIcon;
    case "Commercial":
      return CorporateFareOutlinedIcon;
    case "House & Lot":
      return WindowOutlinedIcon;
    case "Office Space":
      return MeetingRoomOutlinedIcon;
    case "Beach House":
      return CottageOutlinedIcon;
    default:
      return BedRoundedIcon;
  }
};

export default function Overview() {
  const { propertyUnits } = useAppContext();

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 10 }}>
        <Box sx={{ mt: 2 }}>
          <OverviewInfoCardGroup />
          <Grid container spacing={2}>
            {propertyUnits ? (
              Object.entries(propertyUnits).map(([k, v]) => (
                <Grid size={{ lg: 4, md: 6, xs: 12 }} key={k}>
                  <PropertyCard
                    Icon={getPropertyUnitIcon(k)}
                    label={k}
                    rate={v.rate}
                    floorArea={v.floorArea}
                    lotArea={v.lotArea}
                    units={v.units}
                  />
                </Grid>
              ))
            ) : (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((r) => (
                  <Grid size={{ lg: 4, md: 6, xs: 12 }} key={r}>
                    <PropertyCardSkeleton />
                  </Grid>
                ))}
              </>
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
