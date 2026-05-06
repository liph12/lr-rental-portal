import { useAppContext } from "../../providers/AppProvider";
import {
  generateBiMonthlyClusters,
  getCurrentDateFormatted,
} from "../../helpers";
import type {
  RentManager,
  RentalSale,
  DateRange,
  ClusteredRange,
} from "../../types";
import { useEffect, useState } from "react";
import { Grid, Container, Box, Button } from "@mui/material";
import OverviewPinCard from "../../components/cards/OverviewPinCard";
import CertifiedRentManagersTable from "../../components/tables/CertifiedRentManagersTable";
import TeamWithRentManagers from "../../components/tables/TeamWithRentManagersTable";
import SubTeamWithRentManagers from "../../components/tables/SubTeamWIthRentManagersTable";
import { ArrowBack } from "@mui/icons-material";
import rm from "../../assets/rentmanager.png";
import rph from "../../assets/rentph.png";
import rmpro from "../../assets/rmpro.png";
import { Link, Outlet, useParams } from "react-router-dom";

export type PinLabel = "Rent Manager" | "Rent PH" | "Rent Manager Pro" | "All";

const THRESHOLDS = {
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

interface SalesCluster {
  start: {
    all: RentalSale[];
    covered: RentalSale[];
  };
  end: {
    all: RentalSale[];
    covered: RentalSale[];
  };
}

interface RemittanceCluster {
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
  team: string;
  teamLeader: string;
  teamLeaderEmail: string;
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
  team: string;
  teamLeader: string;
  teamLeaderEmail: string;
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
  const { cutOffDates, rentManagers, dateYear } = useAppContext();
  const currentDate = getCurrentDateFormatted();
  const monthlyClusters = generateBiMonthlyClusters(dateYear);
  const [qualifiedRentManagers, setQualifiedRentManagers] = useState<
    QualifiedRentManager[]
  >([]);
  const [selectedPin, setSelectedPin] = useState<PinLabel>("Rent Manager");
  const [selectedTrackedPinningRow, setSelectedTrackedPinningRow] =
    useState<PinningTrackerType | null>(null);

  const filteredByReservationDate = (
    s: RentalSale,
    cutOff: string,
    from: string,
    to: string,
  ) => {
    const dateAdded = s.remittanceDateAdded;
    const dateRes = s.remittanceDate;

    return dateRes >= from && dateRes <= to && dateAdded <= cutOff;
  };

  const getDateRangeCutOff = (from: string, to: string): DateRange => {
    return {
      from: cutOffDates?.find((d) => d.month_year === from)?.date ?? "",
      to: cutOffDates?.find((d) => d.month_year === to)?.date ?? "",
    };
  };

  const getClusteredSales = (
    cluster: ClusteredRange,
    sales: RentalSale[],
  ): SalesCluster => {
    const dateRangeCutOff = getDateRangeCutOff(
      cluster.monthFrom,
      cluster.monthTo,
    );
    const dateToCutOff =
      dateRangeCutOff.to === "" ? currentDate : dateRangeCutOff.to;
    const rsFrom: RentalSale[] = sales.filter(
      (s) => s.remittanceMonth === cluster.monthFrom,
    );
    const rsTo: RentalSale[] = sales.filter(
      (s) => s.remittanceMonth === cluster.monthTo,
    );

    return {
      start: {
        all: rsFrom,
        covered: rsFrom.filter((s) =>
          filteredByReservationDate(
            s,
            dateRangeCutOff.from,
            cluster.from.start,
            cluster.from.end,
          ),
        ),
      },
      end: {
        all: rsTo,
        covered: rsTo.filter((s) =>
          filteredByReservationDate(
            s,
            dateToCutOff,
            cluster.to.start,
            cluster.to.end,
          ),
        ),
      },
    };
  };

  const getPinningPercentage = (value: number, max: number): number => {
    if (!max) return 0;

    const percentage = Math.round((value / max) * 100);
    return Math.min(100, Math.max(0, percentage));
  };

  const getPinDateQualified = (sales: RentalSale[], threshold: number) => {
    let totalRemittance = 0;

    for (const s of sales) {
      totalRemittance += s.remittance;

      if (totalRemittance >= threshold) {
        return s.remittanceDate;
      }
    }

    return null;
  };

  const getQualifiedClusteredSales = (
    sales: RentalSale[],
    threshold: number,
    clusters: RemittanceCluster[],
  ) => {
    let total = sales.reduce((sum, s) => sum + s.remittance, 0);
    let offset = total - threshold;

    if (offset > threshold) {
      const dateQualified = getPinDateQualified(sales, threshold);

      if (dateQualified) {
        const newSales = sales.filter((s) => s.remittanceDate > dateQualified);

        console.log(newSales);

        clusters.push({
          remittanceDate: dateQualified,
          totalRemittance: offset,
        });

        return getQualifiedClusteredSales(newSales, threshold, clusters);
      }
    }

    return clusters;
  };

  const trackPinnings = (rm: RentManager): PinningTrackerType => {
    const pinnings: PinningTrackerType = {
      id: rm.agentId,
      name: `${rm.firstName} ${rm.lastName}`,
      email: rm.email,
      team: rm.teamName,
      teamLeader: rm.team.leader,
      teamLeaderEmail: rm.team.leaderEmail,
      subTeam: rm.subTeamName,
      subTeamLeader: rm.subTeam.leader,
      subTeamLeaderEmail: rm.subTeam.leaderEmail,
      area: rm.areaName,
      pinningClusters: [],
    };

    monthlyClusters.forEach((m) => {
      const { start, end } = getClusteredSales(m, rm.rentalSales);
      const sumOfDeltaStart = start.covered.reduce(
        (total, sale) => total + sale.remittance,
        0,
      );
      const sumOfDeltaEnd = end.covered.reduce(
        (total, sale) => total + sale.remittance,
        0,
      );
      const overAll = [...start.covered, ...end.covered];
      const hasStartPin = sumOfDeltaStart >= THRESHOLDS.RENT_MANAGER;

      /* 

      check if start > threashold
      if assumption is true:
        -> get offset start - threashold

      filter start sales based on the date qualified 
        -> remittance date > qualified date
        -> push qualified sales

      iterate until the start > threshold becomes false

      otherwise:
        -> get end > threshold
        -> call the first iteration process (* recursion)

      implementation:
        getQualifiedSales (sales, threshold, cluster: PinningCluster = []) {
          ...
          offset = total - threashold;

          if(offset > threshold)
          {
            dateQualified = getPinDateQualified(sales, threshold)
            newSales = sales.filter((s) => s.remittanceDate > dateQualified);
            cluster.push(newSales);

            getQualifiedSales (newSales, threshold, cluster)
          }
        }
      
      */

      const sumOfStartToEnd = sumOfDeltaStart + sumOfDeltaEnd;
      const totalRemittance = hasStartPin
        ? sumOfStartToEnd
        : sumOfDeltaEnd < THRESHOLDS.RENT_MANAGER
          ? sumOfStartToEnd
          : sumOfDeltaEnd;
      const qualifiedSales = hasStartPin
        ? overAll
        : sumOfDeltaEnd < THRESHOLDS.RENT_MANAGER
          ? overAll
          : end.covered;

      const clusterDetail = {
        cluster: m.name,
        startTotal: sumOfDeltaStart,
        endTotal: sumOfDeltaEnd,
        all: [...start.all, ...end.all],
        start: start.covered,
        end: end.covered,
      };

      pinnings.pinningClusters.push({
        ...clusterDetail,
        rentManagerCluster: [],
        rentManager: getPinningPercentage(
          totalRemittance,
          THRESHOLDS.RENT_MANAGER,
        ),
        rentManagerDateQualified: getPinDateQualified(
          qualifiedSales,
          THRESHOLDS.RENT_MANAGER,
        ),
        rentPhCluster: [],
        rentPh: getPinningPercentage(totalRemittance, THRESHOLDS.RENT_PH),
        rentPhDateQualified: getPinDateQualified(
          qualifiedSales,
          THRESHOLDS.RENT_PH,
        ),
        rentManagerProCluster: [],
        rentManagerPro: getPinningPercentage(
          totalRemittance,
          THRESHOLDS.RENT_MANAGER_PRO,
        ),
        rentManagerProDateQualified: getPinDateQualified(
          qualifiedSales,
          THRESHOLDS.RENT_MANAGER_PRO,
        ),
      });
    });

    return pinnings;
  };

  useEffect(() => {
    if (rentManagers) {
      const BASE = 100;
      let qRm: QualifiedRentManager[] = [];
      const trackedRows: PinningTrackerType[] = rentManagers.map((rm) =>
        trackPinnings(rm),
      );

      trackedRows.forEach((r) => {
        r.pinningClusters.forEach((c) => {
          if (c.rentManager === BASE) {
            qRm = [
              ...qRm,
              {
                id: qRm.length + 1,
                name: r.name,
                email: r.email,
                rmId: r.id,
                teamLeader: r.teamLeader,
                teamLeaderEmail: r.teamLeaderEmail,
                team: r.team,
                subTeamLeader: r.subTeamLeader,
                subTeamLeaderEmail: r.subTeamLeaderEmail,
                subTeam: r.subTeam,
                area: r.area,
                cluster: c.cluster,
                dateQualified: c.rentManagerDateQualified,
                pin: "Rent Manager",
              },
            ];
          }

          if (c.rentPh === BASE) {
            qRm = [
              ...qRm,
              {
                id: qRm.length + 1,
                name: r.name,
                email: r.email,
                rmId: r.id,
                teamLeader: r.teamLeader,
                teamLeaderEmail: r.teamLeaderEmail,
                team: r.team,
                subTeamLeader: r.subTeamLeader,
                subTeamLeaderEmail: r.subTeamLeaderEmail,
                subTeam: r.subTeam,
                area: r.area,
                cluster: c.cluster,
                dateQualified: c.rentPhDateQualified,
                pin: "Rent PH",
              },
            ];
          }

          if (c.rentManagerPro === BASE) {
            qRm = [
              ...qRm,
              {
                id: qRm.length + 1,
                name: r.name,
                email: r.email,
                rmId: r.id,
                teamLeader: r.teamLeader,
                teamLeaderEmail: r.teamLeaderEmail,
                team: r.team,
                subTeamLeader: r.subTeamLeader,
                subTeamLeaderEmail: r.subTeamLeaderEmail,
                subTeam: r.subTeam,
                area: r.area,
                cluster: c.cluster,
                dateQualified: c.rentManagerProDateQualified,
                pin: "Rent Manager Pro",
              },
            ];
          }
        });
      });

      // const tmpRows = trackedRows.slice(0, 4);

      if (rm_id) {
        const rmId = parseInt(rm_id);
        const rm = trackedRows.find((rm) => rm.id === rmId);

        if (rm) {
          setSelectedTrackedPinningRow(rm);
        }
      } else {
        setSelectedTrackedPinningRow(null);
      }

      setQualifiedRentManagers(qRm);
      // setTrackedPinningsRows(tmpRows);
    }
  }, [rentManagers, rm_id]);

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

        <TeamWithRentManagers
          loading={rentManagers === null}
          rentManagers={rentManagers}
          qualifiedRentManagers={qualifiedRentManagers}
        />
        <SubTeamWithRentManagers
          loading={rentManagers === null}
          rentManagers={rentManagers}
          qualifiedRentManagers={qualifiedRentManagers}
        />

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
