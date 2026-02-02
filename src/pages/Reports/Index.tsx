import { Chip, Box, Container } from "@mui/material";
import RentManagersTable from "../../components/tables/RentManagersTable";
import RentManagerTeamsTable from "../../components/tables/RentManagerTeamsTable";

export default function Reports() {
  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ mb: 10 }}>
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Rent Manager Teams (Total Remittance)"
              size="small"
              color="warning"
              sx={{
                mb: 2,
                backgroundColor: "rgba(181, 214, 249, 0.58)",
                color: "primary.main",
                border: "1px solid rgb(56, 116, 193)",
              }}
            />
            <RentManagerTeamsTable />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Rent Managers (Total Remittance)"
              size="small"
              color="warning"
              sx={{
                mb: 2,
                backgroundColor: "rgba(181, 214, 249, 0.58)",
                color: "primary.main",
                border: "1px solid rgb(56, 116, 193)",
              }}
            />
            <RentManagersTable />
          </Box>
        </Box>
      </Container>
    </>
  );
}
