import type { ReactNode } from "react";
import { Box } from "@mui/material";
import AppNavbar from "../AppNavBar";
import AppSideBar from "../AppSideBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppNavbar />
      <Box sx={{ display: "flex", gap: 2 }}>
        <AppSideBar />
        <Box
          sx={{
            height: "100vh",
            overflow: "auto",
            scrollBehavior: "smooth",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
