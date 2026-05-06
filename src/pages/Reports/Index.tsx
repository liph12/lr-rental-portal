import { Chip, Box, Container } from "@mui/material";
import RentManagersTable from "../../components/tables/RentManagersTable";
import RentManagerTeamsTable from "../../components/tables/RentManagerTeamsTable";
import RentalRequirementsTable from "../../components/tables/RentalRequirementsTable";
import RentalPerCitiesTable from "../../components/tables/RentalPerCitiesTable";
import { useAppContext } from "../../providers/AppProvider";

export default function Reports() {
  const { isAdmin } = useAppContext();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 10 }}>
        <Box sx={{ mt: 2 }}>
          <Chip
            label="Rental Requirements"
            size="small"
            color="warning"
            sx={{
              mb: 2,
              backgroundColor: "rgba(181, 214, 249, 0.58)",
              color: "primary.main",
              border: "1px solid rgb(56, 116, 193)",
            }}
          />
          <RentalRequirementsTable />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Chip
            label="Rental Sales"
            size="small"
            color="warning"
            sx={{
              mb: 2,
              backgroundColor: "rgba(181, 214, 249, 0.58)",
              color: "primary.main",
              border: "1px solid rgb(56, 116, 193)",
            }}
          />
          <RentalPerCitiesTable />
        </Box>
        {isAdmin && (
          <>
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
          </>
        )}
      </Box>
    </Container>
  );
}
