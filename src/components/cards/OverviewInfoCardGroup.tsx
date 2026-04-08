import { Grid } from "@mui/material";
import { useAppContext } from "../../providers/AppProvider";
import OverviewInfoCard from "./OverviewInfoCard";
import OverviewInfoCardPropertyArea from "./OverviewInfoCardPropertyArea";
import Grid4x4Icon from "@mui/icons-material/Grid4x4";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useEffect, useState } from "react";

export type PropertyArea = {
  floorArea: 0;
  lotArea: 0;
};

export default function OverviewInfoCardGroup() {
  const { areaStatistics, rentManagers, propertyUnits } = useAppContext();
  const [propertyArea, setPropertyArea] = useState<PropertyArea>({
    lotArea: 0,
    floorArea: 0,
  });
  const totalRemittance = areaStatistics?.reduce(
    (total, sale) => total + sale.value,
    0
  );
  const totalCertifiedRentManagers = rentManagers?.filter(
    (rm) => rm.hasRemittanceLevel
  ).length;

  useEffect(() => {
    if (propertyUnits) {
      const areas: PropertyArea = {
        lotArea: 0,
        floorArea: 0,
      };

      Object.entries(propertyUnits).map(([_, v]) => {
        areas.floorArea += v.floorArea;
        areas.lotArea += v.lotArea;
      });

      setPropertyArea(areas);
    }
  }, [propertyUnits]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <OverviewInfoCard
          title="Grand Total"
          value={totalRemittance ?? 0}
          subTitle="Remittance"
          Icon={AccountBalanceIcon}
          iconColor="primary.main"
          loading={rentManagers === null}
        />
      </Grid>
      <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <OverviewInfoCard
          title="Certified Rent Managers"
          value={totalCertifiedRentManagers ?? 0}
          subTitle="Total Rent Managers"
          Icon={VerifiedIcon}
          iconColor="primary.main"
          loading={rentManagers === null}
        />
      </Grid>
      <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <OverviewInfoCardPropertyArea
          title="Cumulative Property Size"
          floorArea={propertyArea.floorArea}
          lotArea={propertyArea.lotArea}
          Icon={Grid4x4Icon}
          iconColor="primary.main"
          loading={propertyUnits === null}
        />
      </Grid>
    </Grid>
  );
}
