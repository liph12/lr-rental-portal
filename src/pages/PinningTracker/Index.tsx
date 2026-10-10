import type { RentalSale } from "../../types";
import useQualifiedRentManagers from "../../hooks/useQualifiedRentManagers";
import { useEffect, useState } from "react";
import { Grid, Container, Box, Button } from "@mui/material";
import OverviewPinCard from "../../components/cards/OverviewPinCard";
import CertifiedRentManagersTable from "../../components/tables/CertifiedRentManagersTable";
import { ArrowBack } from "@mui/icons-material";
import rm from "../../assets/rentmanager.png";
import rph from "../../assets/rentph.png";
import rmpro from "../../assets/rmpro.png";
import { Link, Outlet, useParams } from "react-router-dom";

export type PinLabel = "Rent Manager" | "Rent PH" | "Rent Manager Pro" | "All";

export const THRESHOLDS = {
  RENT_MANAGER: 5000,
  RENT_PH: 20000,
  RENT_MANAGER_PRO: 50000,
};

type Pins = {
  RENT_MANAGER: PinLabel;
  RENT_PH: PinLabel;
  RENT_MANAGER_PRO: PinLabel;
};

const PINS: Pins = {
  RENT_MANAGER: "Rent Manager",
  RENT_PH: "Rent PH",
  RENT_MANAGER_PRO: "Rent Manager Pro",
};

export interface SalesCluster {
  start: {
    all: RentalSale[];
    covered: RentalSale[];
  };
  end: {
    all: RentalSale[];
    covered: RentalSale[];
  };
}

export interface RemittanceCluster {
  totalRemittance: number;
  remittanceDate: string | null;
}

export interface PinningCluster {
  cluster: string;
  startTotal: number;
  endTotal: number;
  all: RentalSale[];
  start: RentalSale[];
  end: RentalSale[];
  rentManagerCluster: RemittanceCluster[];
  rentManager: number;
  rentManagerDateQualified?: string | null;
  rentPhCluster: RemittanceCluster[];
  rentPh: number;
  rentPhDateQualified?: string | null;
  rentManagerProCluster: RemittanceCluster[];
  rentManagerPro: number;
  rentManagerProDateQualified?: string | null;
}

export interface PinningTrackerType {
  id: number;
  name: string;
  email: string;
  teamId: number;
  team: string;
  teamLeader: string;
  teamLeaderEmail: string;
  subTeamId: number;
  subTeam: string;
  subTeamLeader: string;
  subTeamLeaderEmail: string;
  area: string;
  pinningClusters: PinningCluster[];
}

export interface QualifiedRentManager {
  id: number;
  rmId: number;
  name: string;
  email: string;
  teamId: number;
  team: string;
  teamLeader: string;
  teamLeaderEmail: string;
  subTeamId: number;
  subTeam: string;
  subTeamLeader: string;
  subTeamLeaderEmail: string;
  area: string;
  cluster: string;
  dateQualified?: string | null;
  pin: PinLabel;
}

export default function PinningTracker() {
  const { rm_id } = useParams();
  const { rentManagers, trackedRows, qualifiedRentManagers } =
    useQualifiedRentManagers();
  const [selectedPin, setSelectedPin] = useState<PinLabel>("Rent Manager");
  const [selectedTrackedPinningRow, setSelectedTrackedPinningRow] =
    useState<PinningTrackerType | null>(null);

  useEffect(() => {
    if (rm_id) {
      const rmId = parseInt(rm_id);
      const rm = trackedRows.find((rm) => rm.id === rmId);

      if (rm) {
        setSelectedTrackedPinningRow(rm);
      }
    } else {
      setSelectedTrackedPinningRow(null);
    }
  }, [trackedRows, rm_id]);


  const toggleDataOutput = () =>
    setSelectedPin((prev) => (prev === "All" ? "Rent Manager" : "All"));

  const RenderSelectedPin = ({ pin }: { pin: PinLabel }) => (
    <CertifiedRentManagersTable
      loading={rentManagers === null}
      tableName={selectedPin}
      rentManagers={qualifiedRentManagers.filter(
        (q) => q.pin === pin || pin === "All",
      )}
    />
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 10 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
              <Box onClick={() => setSelectedPin(PINS.RENT_MANAGER)}>
                <OverviewPinCard
                  selected={selectedPin === PINS.RENT_MANAGER}
                  img={rm}
                  subTitle="Number of Pins"
                  title={PINS.RENT_MANAGER}
                  value={
                    qualifiedRentManagers.filter(
                      (q) => q.pin === PINS.RENT_MANAGER,
                    ).length
                  }
                  loading={rentManagers === null}
                />
              </Box>
            </Grid>
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
              <Box onClick={() => setSelectedPin(PINS.RENT_PH)}>
                <OverviewPinCard
                  selected={selectedPin === PINS.RENT_PH}
                  img={rph}
                  imgSize={60}
                  subTitle="Number of Pins"
                  title={PINS.RENT_PH}
                  value={
                    qualifiedRentManagers.filter((q) => q.pin === PINS.RENT_PH)
                      .length
                  }
                  loading={rentManagers === null}
                />
              </Box>
            </Grid>
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
              <Box onClick={() => setSelectedPin(PINS.RENT_MANAGER_PRO)}>
                <OverviewPinCard
                  selected={selectedPin === PINS.RENT_MANAGER_PRO}
                  img={rmpro}
                  subTitle="Number of Pins"
                  title={PINS.RENT_MANAGER_PRO}
                  value={
                    qualifiedRentManagers.filter(
                      (q) => q.pin === PINS.RENT_MANAGER_PRO,
                    ).length
                  }
                  loading={rentManagers === null}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mb: 2 }}>
          {selectedTrackedPinningRow ? (
            <Link to="/pinning-tracker">
              <Button
                disableElevation
                size="small"
                variant="outlined"
                color="error"
                sx={{ textTransform: "none", borderRadius: 0 }}
                onClick={toggleDataOutput}
                startIcon={<ArrowBack fontSize="small" />}
              >
                Back
              </Button>
            </Link>
          ) : (
            <Button
              disableElevation
              size="small"
              variant={selectedPin === "All" ? "contained" : "outlined"}
              sx={{ textTransform: "none", borderRadius: 0 }}
              onClick={toggleDataOutput}
            >
              Select all pins
            </Button>
          )}
        </Box>
        {selectedTrackedPinningRow ? (
          <Outlet context={{ selectedTrackedPinningRow }} />
        ) : (
          <RenderSelectedPin pin={selectedPin} />
        )}

        {/* <Grid container spacing={2}>
          {trackedPinningsRows.map((pt, k) => {
            return (
              <Grid size={{ lg: 12, md: 12, xs: 12 }} key={k}>
                <PinningTrackerCard pinningTracker={pt} />
              </Grid>
            );
          })}
        </Grid> */}
      </Box>
    </Container>
  );
}
