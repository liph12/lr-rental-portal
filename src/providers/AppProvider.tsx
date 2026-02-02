import { createContext, useContext, useState, type ReactNode } from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { LicenseInfo } from "@mui/x-license";
import type {
  RentManager,
  AreaStatistics,
  PropertyUnits,
  UnitInfo,
  Property,
  Team,
} from "../types";

type PropertyUnitKey = keyof PropertyUnits;

interface User {
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  authToken: string | null;
  desktop: boolean;
  areaStatistics: AreaStatistics[] | null;
  rentManagers: RentManager[] | null;
  propertyUnits: Record<PropertyUnitKey, UnitInfo> | null;
  properties: Property[] | null;
  teams: Team[] | null;
  setUser: (user: User | null) => void;
  setRentManagers: (rentManagers: RentManager[] | null) => void;
  setPropertyUnits: (
    propertyUnits: Record<PropertyUnitKey, UnitInfo> | null
  ) => void;
  setTeams: (teams: Team[] | null) => void;
  setProperties: (properties: Property[] | null) => void;
  setAreaStatistics: (areaStatistics: AreaStatistics[] | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const MUIX_PRO_LICENSE_KEY = import.meta.env.VITE_MUIX_PRO_LICENSE_KEY;

LicenseInfo.setLicenseKey(MUIX_PRO_LICENSE_KEY);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [propertyUnits, setPropertyUnits] = useState<Record<
    PropertyUnitKey,
    UnitInfo
  > | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [areaStatistics, setAreaStatistics] = useState<AreaStatistics[] | null>(
    null
  );
  const [rentManagers, setRentManagers] = useState<RentManager[] | null>(null);
  const authToken = localStorage.getItem("authToken") ?? null;
  const [user, setUser] = useState<User | null>(null);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <AppContext.Provider
      value={{
        user,
        authToken,
        desktop,
        rentManagers,
        areaStatistics,
        properties,
        propertyUnits,
        teams,
        setUser,
        setTeams,
        setRentManagers,
        setPropertyUnits,
        setProperties,
        setAreaStatistics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
