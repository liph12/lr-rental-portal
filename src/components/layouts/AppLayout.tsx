import { Box } from "@mui/material";
import AppNavbar from "../AppNavBar";
import AppSideBar from "../AppSideBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <>
      <AppNavbar />
      <Box sx={{ display: "flex" }}>
        <AppSideBar />
        <Box
          sx={{
            height: "100vh",
            overflow: "auto",
            scrollBehavior: "smooth",
            width: "100%",
            bgcolor: "#f1f1f1",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
