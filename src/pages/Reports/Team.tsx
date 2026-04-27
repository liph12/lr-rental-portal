import { Container, Box, Chip, Grid, Button } from "@mui/material";
import { useAppContext } from "../../providers/AppProvider";
import { useParams } from "react-router-dom";
import type { RentalSale, RentManager, Team } from "../../types";
import { useState, useEffect } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PropertyCardSkeleton from "../../components/cards/PropertyCardSkeleton";
import RentManagersTeamSubHeaderCard from "../../components/cards/RentManagersTeamSubHeaderCard";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { createSubTeamStatistics } from "../../helpers";
import RentManagerSalesCard from "../../components/cards/RentManagerSalesCard";

type DataDisplay = "um-network" | "directs";

export default function Team() {
  const { team_id } = useParams();
  const { rentManagers, teams } = useAppContext();
  const [team, setTeam] = useState<Team | null>(null);
  const [unitManagers, setUnitManagers] = useState<Team[] | null>(null);
  const [allDirectRentManagers, setAllDirectRentManagers] = useState<
    RentManager[] | null
  >(null);
  const [unitManagersNetwork, setUnitManagersNetwork] = useState<
    RentManager[] | null
  >(null);
  const [dataDisplay, setDataDisplay] = useState<DataDisplay>("um-network");
  const [totalTLShares, setTotalTLShares] = useState(0);
  const [totalDirectShares, setTotalDirectShares] = useState(0);

  const toggleDataOutput = () =>
    setDataDisplay((prev) =>
      prev === "um-network" ? "directs" : "um-network",
    );

  const calculateTotalShares = (sales: RentalSale[], qualified: boolean) => {
    let totalShare = 0;

    sales.forEach((s) => {
      const SHARE = s.remittance / 2;
      const ACTUAL_SHARE = qualified ? SHARE / 2 : SHARE;

      totalShare += ACTUAL_SHARE;
    });

    return totalShare;
  };

  const getTLTotalSharesUMNetwork = (
    st: Team[],
    rentManagers: RentManager[],
  ) => {
    let sumOfRentalShares = 0;

    if (st) {
      st.forEach((st) => {
        const network = rentManagers?.filter(
          (rm) =>
            rm.hasRemittanceLevel &&
            rm.subTeam.id === st.id &&
            rm.email !== st.leaderEmail,
        );
        network?.forEach((rm) => {
          sumOfRentalShares += calculateTotalShares(
            rm.rentalSales,
            st.hasRemittanceLevelCount >= 5,
          );
        });
      });
    }

    return sumOfRentalShares;
  };

  const getTLTotalSharesDirects = (directs: RentManager[]) => {
    let sumOfRentalShares = 0;

    if (directs) {
      directs?.forEach((rm) => {
        sumOfRentalShares += calculateTotalShares(rm.rentalSales, false);
      });
    }

    return sumOfRentalShares;
  };

  useEffect(() => {
    if (team_id) {
      setTeam(null);

      const teamId = parseInt(team_id);
      const searchedTeam = teams?.find((t) => t.id === teamId);
      const _rentManagers = rentManagers?.filter(
        (r) => r.hasRemittanceLevel && r.team.id === teamId,
      );

      if (searchedTeam) {
        setTeam(searchedTeam);

        if (_rentManagers) {
          const directs = _rentManagers.filter(
            (r) => r.subTeamName === "Direct",
          );
          const ums = _rentManagers.filter(
            (r) => r.email === r.subTeam.leaderEmail,
          );
          const _umNetwork = _rentManagers.filter(
            (r) =>
              r.subTeamName !== "Direct" &&
              r.email !== r.subTeam.leaderEmail &&
              r.hasRemittanceLevel,
          );
          const subTeamStatistics = createSubTeamStatistics(_umNetwork);
          const sortedRmDirects = [...directs, ...ums].sort(
            (a, b) => (b.totalRemittance ?? 0) - (a.totalRemittance ?? 0),
          );
          const _totalTLShares = getTLTotalSharesUMNetwork(
            subTeamStatistics,
            _umNetwork,
          );
          const totalDirectShares = getTLTotalSharesDirects(sortedRmDirects);

          setUnitManagersNetwork(_umNetwork);
          setAllDirectRentManagers(sortedRmDirects);
          setUnitManagers(subTeamStatistics);
          setTotalTLShares(_totalTLShares);
          setTotalDirectShares(totalDirectShares);
        }
      }
    }
  }, [teams]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 10 }}>
        <Box sx={{ mt: 2 }}>
          <Chip
            label={
              team
                ? `Team Reports (${team?.name} - ${team?.leader})`
                : "Team Reports (Fetching team data...)"
            }
            size="small"
            color="warning"
            sx={{
              mb: 2,
              backgroundColor: "rgba(181, 214, 249, 0.58)",
              color: "primary.main",
              border: "1px solid rgb(56, 116, 193)",
            }}
          />
          <Grid container spacing={2}>
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
              {team ? (
                <>
                  <RentManagersTeamSubHeaderCard
                    title={team.name}
                    centerValue={totalTLShares + totalDirectShares}
                    centerSubTitle="Total Share"
                    leftValue={team.hasRemittanceLevelCount}
                    leftSubTitle="Rent Managers"
                    Icon={GroupsOutlinedIcon}
                  />
                </>
              ) : (
                <>
                  <PropertyCardSkeleton />
                </>
              )}
            </Grid>
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
              {team ? (
                <>
                  <RentManagersTeamSubHeaderCard
                    title="UM Network"
                    leftValue={unitManagersNetwork?.length ?? "0"}
                    leftSubTitle="Rent Managers"
                    centerValue={totalTLShares}
                    centerSubTitle="Total Share"
                    Icon={AccountTreeOutlinedIcon}
                  />
                </>
              ) : (
                <>
                  <PropertyCardSkeleton />
                </>
              )}
            </Grid>
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
              {team ? (
                <>
                  <RentManagersTeamSubHeaderCard
                    title="Team Directs"
                    leftValue={allDirectRentManagers?.length ?? 0}
                    leftSubTitle="Rent Managers"
                    centerValue={totalDirectShares}
                    centerSubTitle="Total Share"
                    Icon={AccountTreeOutlinedIcon}
                  />
                </>
              ) : (
                <>
                  <PropertyCardSkeleton />
                </>
              )}
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 2, mx: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Button
              disableElevation
              size="small"
              variant={dataDisplay === "um-network" ? "contained" : "outlined"}
              sx={{ textTransform: "none", borderRadius: 0 }}
              onClick={toggleDataOutput}
            >
              UM Network
            </Button>
            <Button
              disableElevation
              size="small"
              variant={dataDisplay === "directs" ? "contained" : "outlined"}
              sx={{ textTransform: "none", borderRadius: 0 }}
              onClick={toggleDataOutput}
            >
              Team Directs
            </Button>
          </Box>
          <Box sx={{ overflow: "auto", height: "55vh" }}>
            {team ? (
              <>
                {dataDisplay === "um-network" ? (
                  <>
                    {unitManagers && (
                      <Grid container spacing={2}>
                        {unitManagers?.map((r) => (
                          <Grid size={{ lg: 6, md: 6, xs: 12 }} key={r.id}>
                            {/* <UnitManagerTeamCard
                              team={r}
                              rentManagers={unitManagersNetwork}
                            /> */}
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                ) : (
                  <>
                    {allDirectRentManagers && (
                      <Grid container spacing={2}>
                        {allDirectRentManagers?.map((r) => (
                          <Grid size={{ lg: 6, md: 6, xs: 12 }} key={r.id}>
                            <RentManagerSalesCard rm={r} qualified={false} />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                )}
              </>
            ) : (
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5, 6].map((r) => (
                  <Grid size={{ lg: 6, md: 6, xs: 12 }} key={r}>
                    <PropertyCardSkeleton height="auto" />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
