import { Box } from "@mui/material";
import AppDataFilter from "./AppDataFilters";

export default function AppSideBar() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: 250,
        borderRight: "1px solid #ddd",
        pr: 1,
        py: 2,
      }}
    >
      <Box sx={{ mt: 1 }}>
        <AppDataFilter />
      </Box>
    </Box>
  );
}
