import { Box } from "@mui/material";
import AppDataFilter from "./AppDataFilters";

export default function AppSideBar() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: 260,
        pr: 2,
        py: 2,
      }}
    >
      <Box sx={{ mt: 1 }}>
        <AppDataFilter />
      </Box>
    </Box>
  );
}
