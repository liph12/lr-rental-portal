export interface RentalSale {
  id: number;
  client: string;
  tcp: number;
  actualCommissionReceived: number;
  remittance: number;
  remittanceDate: string;
  remittanceMonth: string;
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
  totalRemittance?: number;
  totalRemittanceStr?: string;
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
}

export interface PropertyUnits {
  "1 Bedroom": UnitInfo;
  "2 Bedrooms": UnitInfo;
  "3 Bedrooms": UnitInfo;
  Loft: UnitInfo;
  Parking: UnitInfo;
  Studio: UnitInfo;
  Penthouse: UnitInfo;
}

export interface Property {
  id: number;
  tcp: number;
  catname: string;
}
