import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { LicenseInfo } from "@mui/x-license";
import { useSearchParams } from "react-router-dom";
import type {
  RentManager,
  AreaStatistics,
  PropertyUnits,
  UnitInfo,
  Property,
  Team,
  DateRange,
  DateCutOff,
  User,
} from "../types";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getStoredUserData } from "../helpers";
import PageLoader from "../pages/PageLoader";

type PropertyUnitKey = keyof PropertyUnits;

type DateYear = number;

interface AppState {
  user: User | null;
  authToken: string | null;
  desktop: boolean;
  areaStatistics: AreaStatistics[] | null;
  rentManagers: RentManager[] | null;
  propertyUnits: Record<PropertyUnitKey, UnitInfo> | null;
  properties: Property[] | null;
  teams: Team[] | null;
  dateRange: DateRange;
  cutOffDates: DateCutOff[] | null;
  dateYear: number;
  setUser: (user: User | null) => void;
  setRentManagers: (rentManagers: RentManager[] | null) => void;
  setPropertyUnits: (
    propertyUnits: Record<PropertyUnitKey, UnitInfo> | null,
  ) => void;
  setTeams: (teams: Team[] | null) => void;
  setProperties: (properties: Property[] | null) => void;
  setAreaStatistics: (areaStatistics: AreaStatistics[] | null) => void;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  setDateYear: React.Dispatch<React.SetStateAction<DateYear>>;
  isAdmin: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

const MUIX_PRO_LICENSE_KEY = import.meta.env.VITE_MUIX_PRO_LICENSE_KEY;

LicenseInfo.setLicenseKey(MUIX_PRO_LICENSE_KEY);

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getLast30DaysRange = (): DateRange => {
  const today = new Date();

  const to = formatDate(today);

  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 30);
  const from = formatDate(fromDate);

  return { from, to };
};

const ADMINS = [
  "leuteriomay@gmail.com",
  "libresphilip14@gmail.com",
  "delacalzadavien@gmail.com",
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const storedUser = getStoredUserData();
  const [searchParams] = useSearchParams();
  const { from, to } = getLast30DaysRange();
  const allParams = Object.fromEntries(searchParams.entries());
  const currentYear = parseInt(
    allParams?.year ?? `${new Date().getFullYear()}`,
  );
  const [cutOffDates, setCutOffDates] = useState<DateCutOff[] | null>(null);
  const [propertyUnits, setPropertyUnits] = useState<Record<
    PropertyUnitKey,
    UnitInfo
  > | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [areaStatistics, setAreaStatistics] = useState<AreaStatistics[] | null>(
    null,
  );
  const [rentManagers, setRentManagers] = useState<RentManager[] | null>(null);
  const authToken = localStorage.getItem("authToken") ?? null;
  const [user, setUser] = useState<User | null>(null);
  const [dateYear, setDateYear] = useState<number>(currentYear);
  const [isAdmin, setIsAdmin] = useState(false);
  const fromDate = allParams?.from ?? from;
  const toDate = allParams?.to ?? to;
  // const _fromDate = allParams?.from
  //   ? `${dateYear}${allParams.from.slice(4)}`
  //   : `${dateYear}${from.slice(4)}`;
  // const _toDate = allParams?.to
  //   ? `${dateYear}${allParams.to.slice(4)}`
  //   : `${dateYear}${to.slice(4)}`;

  const [dateRange, setDateRange] = useState<DateRange>({
    from: fromDate,
    to: toDate,
  });
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authenticateAsync = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.leuteriorealty.com/lr/v2/public/api/authenticate`,
          {
            headers: {
              Authorization: `Bearer ${storedUser.auth_token}`,
            },
          },
        );

        const { data } = response.data;

        setUser(data.user_data);
      } catch (e) {
        // to do
      } finally {
        setLoading(false);
      }
    };

    const fetchCutOffDates = async () => {
      const response = await axios.get(
        `https://leuteriorealty.com/api/rental/sales-cutoff-dates`,
        {
          headers: {
            Authorization: `Bearer ${storedUser.auth_token}`,
          },
        },
      );
      const data = response.data;

      setCutOffDates(data);
    };

    authenticateAsync();
    fetchCutOffDates();
  }, []);

  useEffect(() => {
    if (user) {
      const isAdmin = ADMINS.some((e) => e === user?.email);

      setIsAdmin(isAdmin);
    }
  }, [user]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <GoogleOAuthProvider clientId="478246977904-cdcr130jpmsddrr54b0jmiknkk80nqof.apps.googleusercontent.com">
      <AppContext.Provider
        value={{
          user,
          isAdmin,
          authToken,
          desktop,
          rentManagers,
          areaStatistics,
          properties,
          propertyUnits,
          teams,
          dateRange,
          cutOffDates,
          dateYear,
          setUser,
          setTeams,
          setRentManagers,
          setPropertyUnits,
          setProperties,
          setAreaStatistics,
          setDateRange,
          setDateYear,
        }}
      >
        {children}
      </AppContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
