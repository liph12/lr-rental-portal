import type {
  RentalSale,
  RentManager,
  Team,
  DateRange,
  ClusteredRange,
  User,
} from "./types";

export const getStoredUserData = () =>
  JSON.parse(localStorage.getItem("user_data") ?? "{}");

export const storeUserData = (user: User) =>
  localStorage.setItem("user_data", JSON.stringify(user));

export const getMonthsBetween = (from?: string, to?: string) => {
  const result = [];

  if (!from || !to) {
    const today = new Date();
    const prev = new Date();
    prev.setMonth(today.getMonth() - 1);

    from = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    to = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  const normalize = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  };

  const start = normalize(from);
  const end = normalize(to);

  let current = new Date(start);

  while (current <= end) {
    result.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}`
    );
    current.setMonth(current.getMonth() + 1);
  }

  return result;
};

export const hasRemittanceLevel = (
  sales: RentalSale[],
  from?: string,
  to?: string
): boolean => {
  const MAX_REMITTANCE = 5000;
  const months = getMonthsBetween(from, to);

  return months.some((month) => {
    const totalRemittance = sales
      .filter((s) => s.remittanceMonth === month)
      .reduce((sum, s) => sum + s.remittance, 0);

    return totalRemittance >= MAX_REMITTANCE;
  });
};

export const isActiveRoute = (currentPath: string, routePath: string) => {
  if (routePath === "/") {
    return currentPath === "/";
  }

  return currentPath === routePath || currentPath.startsWith(routePath + "/");
};

export const isValidDateRange = (from: string, to: string): boolean => {
  if (!from || !to) return false;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return false;
  }

  return fromDate.getTime() <= toDate.getTime();
};

export const createSubTeamStatistics = (
  rentManagers: RentManager[]
): Team[] => {
  const _tmpTeams: Team[] = rentManagers.map((r) => {
    return {
      id: r.subTeam.id,
      name: r.subTeam.name,
      leader: r.subTeam.leader,
      leaderEmail: r.subTeam.leaderEmail,
      totalRemittance: r.totalRemittance ?? 0,
      hasRemittanceLevel: r.hasRemittanceLevel,
      hasRemittanceLevelCount: 0,
    };
  });
  const teamStatistics = [
    ..._tmpTeams.reduce((map, subTeam) => {
      const existing = map.get(subTeam.id);

      if (existing) {
        existing.totalRemittance =
          (existing.totalRemittance ?? 0) + (subTeam.totalRemittance ?? 0);
        existing.hasRemittanceLevelCount += subTeam.hasRemittanceLevel ? 1 : 0;
      } else {
        map.set(subTeam.id, {
          ...subTeam,
          totalRemittance: subTeam.totalRemittance ?? 0,
          hasRemittanceLevelCount: subTeam.hasRemittanceLevel ? 1 : 0,
        });
      }

      return map;
    }, new Map<number, Team>()),
  ]
    .map(([, subTeam]) => subTeam)
    .sort((a, b) => b.totalRemittance - a.totalRemittance);

  const formattedStat = teamStatistics.map((t) => ({
    ...t,
    totalRemittanceStr: t.totalRemittance.toLocaleString(),
  }));

  return formattedStat;
};

export const formatDatePH = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

const formatNumber = (month: number) => {
  const actualMonth = month < 10 ? `0${month}` : month;

  return actualMonth;
};

export const getMappedPinningDates = (): DateRange[] => {
  const CURRENT_YEAR = new Date().getFullYear();
  const MONTHS = 12;
  const mappedDates: DateRange[] = [];
  let itr = 0;

  for (let i = 0; i < MONTHS; i++) {
    if (itr < 1) {
      const month = i + 1;
      const actualMonth = formatNumber(month);
      itr++;

      mappedDates.push({
        from: `${CURRENT_YEAR}-${actualMonth}`,
        to: `${CURRENT_YEAR}-${formatNumber(month + 1)}`,
      });
    } else {
      itr = 0;
    }
  }

  return mappedDates;
};

const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function generateBiMonthlyClusters(year: number): ClusteredRange[] {
  const result: ClusteredRange[] = [];

  for (let month = 1; month <= 12; month += 2) {
    const nextMonth = month + 1;

    const firstMonthStr = String(month).padStart(2, "0");
    const secondMonthStr = String(nextMonth).padStart(2, "0");

    const firstMonthLastDay = getLastDayOfMonth(year, month);
    const secondMonthLastDay = getLastDayOfMonth(year, nextMonth);

    result.push({
      name: `${MONTH_NAMES[month - 1]}-${MONTH_NAMES[nextMonth - 1]}`,
      monthFrom: `${year}-${firstMonthStr}`,
      monthTo: `${year}-${secondMonthStr}`,
      from: {
        start: `${year}-${firstMonthStr}-01`,
        end: `${year}-${firstMonthStr}-${String(firstMonthLastDay).padStart(
          2,
          "0"
        )}`,
      },
      to: {
        start: `${year}-${secondMonthStr}-01`,
        end: `${year}-${secondMonthStr}-${String(secondMonthLastDay).padStart(
          2,
          "0"
        )}`,
      },
    });
  }

  return result;
}

export const getCurrentDateFormatted = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTodayMonthFormatted = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};
