import {
  Box,
  Typography,
  Stack,
  FormHelperText,
  Divider,
  Button,
} from "@mui/material";
import StyledAutocomplete from "../utils/StyledAutocomplete";
import StyledTextField from "../utils/StyledTextfield";
import { isActiveRoute } from "../helpers";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { LOCATIONS } from "../app-data";
import { appRoutes } from "../app-data";
import { hasRemittanceLevel, isValidDateRange } from "../helpers";
import type { RentManager, Team, AreaStatistics } from "../types";
import axios from "axios";
import { useAppContext } from "../providers/AppProvider";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

interface AutocompleteType {
  id: string | number;
  label: string;
}

interface DateRange {
  from: string;
  to: string;
}

export default function AppDataFilter() {
  const {
    setTeams,
    setAreaStatistics,
    setRentManagers,
    setProperties,
    setPropertyUnits,
  } = useAppContext();
  const loc = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const allParams = Object.fromEntries(searchParams.entries());
  const currentPath = loc.pathname;
  const locationsAutocomplete = LOCATIONS.map((loc) => ({
    id: loc.id,
    label: loc.name,
  }));
  const currentArea = locationsAutocomplete.find(
    (l) => l.id === allParams?.area
  );
  const [location, setLocation] = useState<AutocompleteType | null>({
    id: currentArea?.id ?? "nationwide",
    label: currentArea?.label ?? "Nationwide",
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: allParams?.from ?? "",
    to: allParams?.to ?? "",
  });
  const [enabledFilters, setEnabledFilters] = useState<boolean>(false);
  const [validDateRange, setValidDateRange] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const onChangeDateRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const k = e.target.name;
    const v = e.target.value;

    setDateRange((prev) => ({
      ...prev,
      [k]: v,
    }));
  };

  const createTeamStatistics = (rentManagers: RentManager[] | null) => {
    if (rentManagers) {
      const _tmpTeams: Team[] = rentManagers.map((r) => {
        return {
          id: r.team.id,
          name: r.team.name,
          leader: r.team.leader,
          leaderEmail: r.team.leaderEmail,
          totalRemittance: r.totalRemittance ?? 0,
          hasRemittanceLevel: r.hasRemittanceLevel,
          hasRemittanceLevelCount: 0,
        };
      });
      const teamStatistics = [
        ..._tmpTeams.reduce((map, team) => {
          const existing = map.get(team.id);

          if (existing) {
            existing.totalRemittance =
              (existing.totalRemittance ?? 0) + (team.totalRemittance ?? 0);
            existing.hasRemittanceLevelCount += team.hasRemittanceLevel ? 1 : 0;
          } else {
            map.set(team.id, {
              ...team,
              totalRemittance: team.totalRemittance ?? 0,
              hasRemittanceLevelCount: team.hasRemittanceLevel ? 1 : 0,
            });
          }

          return map;
        }, new Map<number, Team>()),
      ]
        .map(([, team]) => team)
        .sort((a, b) => b.totalRemittance - a.totalRemittance);

      const formattedTeamStatistics = teamStatistics.map((t) => ({
        ...t,
        totalRemittanceStr: t.totalRemittance.toLocaleString(),
      }));
      setTeams(formattedTeamStatistics);
    } else {
      setTeams(null);
    }
  };

  const fetchDataAsync = async () => {
    const hasSearchParams = loc?.search !== undefined;
    const withDateRange = enabledFilters || hasSearchParams;
    const { from, to } = dateRange;
    let query = enabledFilters
      ? `?from=${from}&to=${to}&area=${location?.id}`
      : "";

    if (enabledFilters) {
      setPropertyUnits(null);
      setProperties(null);
      setAreaStatistics(null);
      setRentManagers(null);
      createTeamStatistics(null);
      setLoading(true);
      navigate(`${loc.pathname}${query}`);
    } else {
      query = hasSearchParams ? loc?.search : "";
    }

    const fetchRentManagers = async (query: string) => {
      const response = await axios.get(
        `https://leuteriorealty.com/api/rental/rent-managers-sales${query}`
      );
      const { data } = response.data;
      const _rentManagers: RentManager[] = data;
      const rentManagersWithRemittances = _rentManagers.map((r) => {
        const totalRemittance = r.rentalSales.reduce(
          (total, sale) => total + sale.remittance,
          0
        );

        return {
          ...r,
          teamName: r.team.name,
          subTeamName: r.subTeam.name,
          areaName: LOCATIONS.find((l) => l.id === r.area)?.name ?? "",
          totalRemittance: totalRemittance,
          totalRemittanceStr: totalRemittance.toLocaleString(),
          hasRemittanceLevel: withDateRange
            ? hasRemittanceLevel(
                r.rentalSales,
                allParams?.from ?? dateRange.from,
                allParams?.to ?? dateRange.to
              )
            : hasRemittanceLevel(r.rentalSales),
        };
      });

      rentManagersWithRemittances.sort(
        (a, b) => b.totalRemittance - a.totalRemittance
      );

      const _tmpAreaStat: AreaStatistics[] = rentManagersWithRemittances.map(
        (r) => ({ id: r.area, name: r.areaName, value: r.totalRemittance })
      );

      const _areaStatistics = [
        ..._tmpAreaStat.reduce((map, { name, value }) => {
          map.set(name, (map.get(name) || 0) + value);
          return map;
        }, new Map()),
      ]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setAreaStatistics(_areaStatistics);
      setRentManagers(rentManagersWithRemittances);
      createTeamStatistics(rentManagersWithRemittances);
    };

    const fetchPropertyCondoUnits = async (query: string) => {
      const response = await axios.get(
        `https://leuteriorealty.com/api/rental/property-condo-overview${query}`
      );
      const data = response.data;

      setPropertyUnits(data);
    };

    const fetchProperties = async (query: string) => {
      const response = await axios.get(
        `https://leuteriorealty.com/api/rental/property-overview${query}`
      );
      const data = response.data;

      setProperties(data);
    };

    await fetchPropertyCondoUnits(query);
    await fetchProperties(query);
    await fetchRentManagers(query);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataAsync();
  }, []);

  useEffect(() => {
    const { from, to } = dateRange;
    const hasFilters = from !== "" && to !== "" && location !== null;

    if (hasFilters) {
      const isValid = isValidDateRange(from, to);
      setValidDateRange(isValid);
    } else {
      setValidDateRange(true);
    }

    setEnabledFilters(hasFilters);
  }, [location, dateRange]);

  return (
    <>
      <Box pl={1}>
        <Typography>Data Filters</Typography>
        <Stack spacing={1}>
          <Box>
            <FormHelperText>Location/Area</FormHelperText>
            <StyledAutocomplete
              options={locationsAutocomplete}
              value={location}
              renderInput={(params) => (
                <StyledTextField
                  params={params}
                  name="location"
                  value={location?.label ?? ""}
                />
              )}
              onChange={(_, v) => setLocation(v)}
              isOptionEqualToValue={(option, value) =>
                value === undefined || option.id === value.id
              }
            />
          </Box>
          <Box>
            <FormHelperText>Date From</FormHelperText>
            <StyledTextField
              type="date"
              name="from"
              value={dateRange.from ?? ""}
              handleChange={onChangeDateRange}
            />
          </Box>
          <Box>
            <FormHelperText>Date To</FormHelperText>
            <StyledTextField
              type="date"
              name="to"
              value={dateRange.to ?? ""}
              handleChange={onChangeDateRange}
            />
          </Box>
          {!validDateRange && (
            <FormHelperText sx={{ color: "error.main" }}>
              Invalid date range
            </FormHelperText>
          )}
          <Box>
            <Button
              fullWidth
              disableElevation
              variant="contained"
              size="small"
              sx={{ borderRadius: 0, textTransform: "none" }}
              endIcon={<SearchOutlinedIcon />}
              color="primary"
              disabled={!enabledFilters || !validDateRange}
              onClick={fetchDataAsync}
              loading={loading}
            >
              Search
            </Button>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Divider sx={{ my: 2 }} />
        {appRoutes.map((r) => {
          return (
            <Typography
              key={r.path}
              sx={{
                px: 2,
                py: 1,
                cursor: "pointer",
                color: isActiveRoute(currentPath, r.path)
                  ? "rgb(56, 116, 193)"
                  : "#555",
                backgroundColor: isActiveRoute(currentPath, r.path)
                  ? "rgba(181, 214, 249, 0.58)"
                  : "none",
                borderLeft: isActiveRoute(currentPath, r.path)
                  ? "5px solid rgb(56, 116, 193)"
                  : "5px solid transparent",
                transition: "0.2s",
                ":hover": {
                  backgroundColor: "#eee",
                },
                display: "flex",
                alignItems: "center",
                gap: 2,
                textDecoration: "none",
              }}
              component={Link}
              to={`${r.path}${loc?.search ?? ""}`}
              variant="body2"
            >
              <r.icon fontSize="small" /> {r.name}
            </Typography>
          );
        })}
      </Box>
    </>
  );
}
