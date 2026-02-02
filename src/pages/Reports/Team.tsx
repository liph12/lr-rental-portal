import { Container, Box, Chip, Grid, Button } from "@mui/material";
import { useAppContext } from "../../providers/AppProvider";
import { useParams } from "react-router-dom";
import type { RentManager, Team } from "../../types";
import { useState, useEffect } from "react";
import RentManagersTeamHeaderCard from "../../components/cards/RentManagersTeamHeaderCard";
import PropertyCardSkeleton from "../../components/cards/PropertyCardSkeleton";
import RentManagersTeamSubHeaderCard from "../../components/cards/RentManagersTeamSubHeaderCard";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { createSubTeamStatistics } from "../../helpers";
import UnitManagerTeamCard from "../../components/cards/UnitManagerTeamCard";
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
  const [directRentManagers, setDirectRentManagers] = useState<
    RentManager[] | null
  >(null);
  const [unitManagersWithSales, setUnitManagersWithSales] = useState<
    RentManager[] | null
  >(null);
  const [dataDisplay, setDataDisplay] = useState<DataDisplay>("um-network");

  const toggleDataOutput = () =>
    setDataDisplay((prev) =>
      prev === "um-network" ? "directs" : "um-network"
    );

  useEffect(() => {
    if (team_id) {
      const teamId = parseInt(team_id);
      const searchedTeam = teams?.find((t) => t.id === teamId);
      const _rentManagers = rentManagers?.filter(
        (r) => r.hasRemittanceLevel && r.team.id === teamId
      );

      if (searchedTeam) {
        setTeam(searchedTeam);

        if (_rentManagers) {
          const directs = _rentManagers.filter(
            (r) => r.subTeamName === "Direct"
          );
          const ums = _rentManagers.filter(
            (r) => r.email === r.subTeam.leaderEmail
          );
          const umNetwork = _rentManagers.filter(
            (r) =>
              r.subTeamName !== "Direct" && r.email !== r.subTeam.leaderEmail
          );
          const subTeamStatistics = createSubTeamStatistics(umNetwork);

          setUnitManagersWithSales(ums);
          setDirectRentManagers(directs);
          setAllDirectRentManagers([...directs, ...ums]);
          setUnitManagers(subTeamStatistics);
        }
      }
    }
  }, [teams]);

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ mb: 10 }}>
          <Box sx={{ mt: 2 }}>
            <Chip
              label={
                teams && team
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
              <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                {teams && team ? (
                  <>
                    <RentManagersTeamHeaderCard team={team} />
                  </>
                ) : (
                  <>
                    <PropertyCardSkeleton />
                  </>
                )}
              </Grid>
              <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                {teams && team ? (
                  <>
                    <RentManagersTeamSubHeaderCard
                      title="Team Directs"
                      leftValue={directRentManagers?.length ?? "0"}
                      leftSubTitle="Rent Managers"
                      rightValue={unitManagersWithSales?.length ?? "0"}
                      rightsubTitle="Unit Managers"
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
                variant={
                  dataDisplay === "um-network" ? "contained" : "outlined"
                }
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
                Directs
              </Button>
            </Box>
            <Box sx={{ overflow: "auto", height: "55vh" }}>
              {dataDisplay === "um-network" ? (
                <>
                  {unitManagers && (
                    <Grid container spacing={2}>
                      {unitManagers?.map((r) => (
                        <Grid size={{ lg: 6, md: 6, xs: 12 }} key={r.id}>
                          <UnitManagerTeamCard {...r} />
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
                          <RentManagerSalesCard rm={r} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
