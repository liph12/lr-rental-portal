import { useEffect, useState } from "react";
import { useAppContext } from "../providers/AppProvider";
import {
  generateBiMonthlyClusters,
  getCurrentDateFormatted,
} from "../helpers";
import type {
  RentManager,
  RentalSale,
  DateRange,
  ClusteredRange,
} from "../types";
import {
  THRESHOLDS,
  type PinningTrackerType,
  type QualifiedRentManager,
  type RemittanceCluster,
  type SalesCluster,
} from "../pages/PinningTracker/Index";

export default function useQualifiedRentManagers() {
  const { cutOffDates, rentManagers, dateYear } = useAppContext();
  const currentDate = getCurrentDateFormatted();
  const monthlyClusters = generateBiMonthlyClusters(dateYear);
  const [trackedRows, setTrackedRows] = useState<PinningTrackerType[]>([]);
  const [qualifiedRentManagers, setQualifiedRentManagers] = useState<
    QualifiedRentManager[]
  >([]);


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
      teamId: rm.team.id,
      team: rm.teamName,
      teamLeader: rm.team.leader,
      teamLeaderEmail: rm.team.leaderEmail,
      subTeamId: rm.subTeam.id,
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

      iterate until the start <= threshold

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
                teamId: r.teamId,
                teamLeader: r.teamLeader,
                teamLeaderEmail: r.teamLeaderEmail,
                team: r.team,
                subTeamId: r.subTeamId,
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
                teamId: r.teamId,
                teamLeader: r.teamLeader,
                teamLeaderEmail: r.teamLeaderEmail,
                team: r.team,
                subTeamId: r.subTeamId,
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
                teamId: r.teamId,
                teamLeader: r.teamLeader,
                teamLeaderEmail: r.teamLeaderEmail,
                team: r.team,
                subTeamId: r.subTeamId,
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

      setTrackedRows(trackedRows);
      setQualifiedRentManagers(qRm);
    }
  }, [rentManagers]);

  return { rentManagers, trackedRows, qualifiedRentManagers };
}
