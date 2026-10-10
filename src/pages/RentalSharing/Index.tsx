import { Box, Container } from "@mui/material";
import TeamWithRentManagers from "../../components/tables/TeamWithRentManagersTable";
import SubTeamWithRentManagers from "../../components/tables/SubTeamWIthRentManagersTable";
import useQualifiedRentManagers from "../../hooks/useQualifiedRentManagers";

export default function RentalSharing() {
  const { rentManagers, qualifiedRentManagers } = useQualifiedRentManagers();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 10 }}>
        <TeamWithRentManagers
          loading={rentManagers === null}
          rentManagers={rentManagers}
          qualifiedRentManagers={qualifiedRentManagers}
        />
        <SubTeamWithRentManagers
          loading={rentManagers === null}
          rentManagers={rentManagers}
          qualifiedRentManagers={qualifiedRentManagers}
        />
      </Box>
    </Container>
  );
}
