import { useEffect, useState } from "react";
import { useAppContext } from "../providers/AppProvider";
import { generateBiMonthlyClusters, getCurrentDateFormatted } from "../helpers";
import type {
  RentManager,
  RentalSale,
  DateRange,
  ClusteredRange,
} from "../types";
import {
  ELITE_MIN_CYCLES,
  THRESHOLDS,
  type EarnedPin,
  type PinLabel,
  type PinningCluster,
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
  const [eliteRentManagers, setEliteRentManagers] = useState<
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

    const percentage = Math.floor((value / max) * 100);
    return Math.min(100, Math.max(0, percentage));
  };

  // Pins rotate Rent Manager -> Rent PH -> RMPro, then restart. One
  // cycle is the RMPro amount (50k): within each cycle the pin
  // is earned once its `level` is reached (5k, 20k, 50k), so 100k is 2 cycles
  // (2 of each pin). Sales are taken in remittanceDate order; a sale that
  // straddles two pins counts toward both (carriedIn is the part used before).
  const getEarnedPins = (sales: RentalSale[], level: number): EarnedPin[] => {
    const cycle = THRESHOLDS.RENT_MANAGER_PRO;
    let cumulative = 0;
    const steps = [...sales]
      .sort((a, b) => a.remittanceDate.localeCompare(b.remittanceDate))
      .map((sale) => {
        const from = cumulative;
        cumulative += sale.remittance;

        return { sale, from, to: cumulative };
      });
    const count =
      cumulative >= level ? Math.floor((cumulative - level) / cycle) + 1 : 0;

    return Array.from({ length: count }, (_, i) => {
      const windowStart = i * cycle;
      const windowEnd = windowStart + level;
      const inWindow = steps.filter(
        (st) => st.to > windowStart && st.from < windowEnd,
      );

      if (!inWindow.length) return [];

      return [
        {
          dateQualified: inWindow[inWindow.length - 1].sale.remittanceDate,
          sales: inWindow.map((st) => st.sale),
          carriedIn: Math.max(0, windowStart - inWindow[0].from),
        },
      ];
    }).flat();
  };

  const getPinDateQualified = (sales: RentalSale[], threshold: number) =>
    getEarnedPins(sales, threshold)[0]?.dateQualified ?? null;

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

      // First-month sales only carry into the second month when they already
      // reached the Rent Manager pin. Otherwise the second month counts alone.
      const totalRemittance = hasStartPin
        ? sumOfDeltaStart + sumOfDeltaEnd
        : sumOfDeltaEnd;
      const qualifiedSales = hasStartPin ? overAll : end.covered;

      const clusterDetail = {
        cluster: m.name,
        startTotal: sumOfDeltaStart,
        endTotal: sumOfDeltaEnd,
        all: [...start.all, ...end.all],
        start: start.covered,
        end: end.covered,
      };

      const rentManagerPins = getEarnedPins(
        qualifiedSales,
        THRESHOLDS.RENT_MANAGER,
      );
      const rentPhPins = getEarnedPins(qualifiedSales, THRESHOLDS.RENT_PH);
      const rentManagerProPins = getEarnedPins(
        qualifiedSales,
        THRESHOLDS.RENT_MANAGER_PRO,
      );

      pinnings.pinningClusters.push({
        ...clusterDetail,
        rentManagerCluster: [],
        rentManager: getPinningPercentage(
          totalRemittance,
          THRESHOLDS.RENT_MANAGER,
        ),
        rentManagerDateQualified: rentManagerPins[0]?.dateQualified ?? null,
        rentManagerPins,
        rentPhCluster: [],
        rentPh: getPinningPercentage(totalRemittance, THRESHOLDS.RENT_PH),
        rentPhDateQualified: rentPhPins[0]?.dateQualified ?? null,
        rentPhPins,
        rentManagerProCluster: [],
        rentManagerPro: getPinningPercentage(
          totalRemittance,
          THRESHOLDS.RENT_MANAGER_PRO,
        ),
        rentManagerProDateQualified:
          rentManagerProPins[0]?.dateQualified ?? null,
        rentManagerProPins,
      });
    });

    return pinnings;
  };

  useEffect(() => {
    if (rentManagers) {
      const qRm: QualifiedRentManager[] = [];
      const trackedRows: PinningTrackerType[] = rentManagers.map((rm) =>
        trackPinnings(rm),
      );

      const rentManagerFields = (r: PinningTrackerType) => ({
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
      });

      // One entry per pin earned, so repeated pins add up (2 Rent Manager, ...)
      const addPins = (
        r: PinningTrackerType,
        c: PinningCluster,
        pin: PinLabel,
        pins: EarnedPin[],
        threshold: number,
      ) => {
        pins.forEach((p, i) => {
          qRm.push({
            id: qRm.length + 1,
            ...rentManagerFields(r),
            cluster: c.cluster,
            dateQualified: p.dateQualified,
            pin,
            pinNumber: i + 1,
            pinCount: pins.length,
            earnedSales: [
              {
                cluster: c.cluster,
                threshold,
                sales: p.sales,
                carriedIn: p.carriedIn,
              },
            ],
          });
        });
      };

      trackedRows.forEach((r) => {
        r.pinningClusters.forEach((c) => {
          addPins(
            r,
            c,
            "Rent Manager",
            c.rentManagerPins,
            THRESHOLDS.RENT_MANAGER,
          );
          addPins(r, c, "Rent PH", c.rentPhPins, THRESHOLDS.RENT_PH);
          addPins(
            r,
            c,
            "RMPro",
            c.rentManagerProPins,
            THRESHOLDS.RENT_MANAGER_PRO,
          );
        });
      });

      // RMPro Elite: ELITE_MIN_CYCLES completed cycles (RM Pro pins)
      // across the date range. Kept apart from qRm so the rental sharing
      // tables still see these people as RM Pro.
      const elite: QualifiedRentManager[] = [];

      trackedRows.forEach((r) => {
        const cycles = r.pinningClusters
          .flatMap((c) =>
            c.rentManagerProPins.map((pin) => ({ cluster: c.cluster, pin })),
          )
          .sort((a, b) =>
            a.pin.dateQualified.localeCompare(b.pin.dateQualified),
          );

        if (cycles.length >= ELITE_MIN_CYCLES) {
          const earned = cycles.slice(0, ELITE_MIN_CYCLES);

          elite.push({
            id: qRm.length + elite.length + 1,
            ...rentManagerFields(r),
            cluster: `${cycles.length}x cycles`,
            dateQualified: earned[ELITE_MIN_CYCLES - 1].pin.dateQualified,
            pin: "RMPro Elite",
            pinNumber: 1,
            pinCount: cycles.length,
            earnedSales: earned.map(({ cluster, pin }) => ({
              cluster,
              threshold: THRESHOLDS.RENT_MANAGER_PRO,
              sales: pin.sales,
              carriedIn: pin.carriedIn,
            })),
          });
        }
      });

      setTrackedRows(trackedRows);
      setQualifiedRentManagers(qRm);
      setEliteRentManagers(elite);
    }
  }, [rentManagers]);

  return {
    rentManagers,
    trackedRows,
    qualifiedRentManagers,
    eliteRentManagers,
  };
}
