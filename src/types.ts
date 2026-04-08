export interface User {
  id: number;
  name: string;
  email: string;
  auth_token: string;
  role: "ADMIN";
}

export interface RentalSale {
  id: number;
  client: string;
  tcp: number;
  actualCommissionReceived: number;
  remittance: number;
  remittanceDate: string;
  remittanceMonth: string;
  remittanceDateAdded: string;
}

export interface Team {
  id: number;
  name: string;
  leader: string;
  leaderEmail: string;
  totalRemittance: number;
  totalRemittanceStr?: string;
  hasRemittanceLevel: boolean;
  hasRemittanceLevelCount: number;
}

export interface RentManager {
  id: number;
  agentId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  state: string;
  area: string;
  areaName: string;
  city: string;
  birthdate: string;
  gender: "Male" | "Female" | string;
  team: Team;
  subTeam: Team;
  teamName: string;
  subTeamName: string;
  totalRemittance: number;
  totalRemittanceStr: string;
  hasRemittanceLevel: boolean;
  rentalSales: RentalSale[];
}

export interface AreaStatistics {
  name: string;
  value: number;
}

export interface UnitInfo {
  units: number;
  rate: number;
  floorArea: number;
  lotArea: number;
}

export interface PropertyUnits {
  "1 Bedroom": UnitInfo;
  "2 Bedrooms": UnitInfo;
  "3 Bedrooms": UnitInfo;
  Loft: UnitInfo;
  Parking: UnitInfo;
  Studio: UnitInfo;
  Penthouse: UnitInfo;
  Townhouse: UnitInfo;
  Warehouse: UnitInfo;
  Commercial: UnitInfo;
  "House & Lot": UnitInfo;
  "Beach House": UnitInfo;
  Apartment: UnitInfo;
  Dormitory: UnitInfo;
  "Office Space": UnitInfo;
}

export interface Property {
  id: number;
  tcp: number;
  catname: string;
  total_units: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface DateCutOff {
  id: number;
  month_year: string;
  date: string;
}

type DateRangeCluster = {
  start: string;
  end: string;
};

export type ClusteredRange = {
  name: string;
  monthFrom: string;
  monthTo: string;
  from: DateRangeCluster;
  to: DateRangeCluster;
};
