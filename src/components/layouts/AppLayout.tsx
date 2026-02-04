import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import AppNavbar from "../AppNavBar";
import AppSideBar from "../AppSideBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();
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
          {/* <Box sx={{ height: "15vh" }}>
            <Typography
              variant="body2"
              textAlign="center"
              color="textSecondary"
            >
              All Rights Reserved &copy; {year} | LR & RentPH
            </Typography>
          </Box> */}
        </Box>
      </Box>
    </>
  );
}
