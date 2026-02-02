import { Box, Avatar, IconButton, Divider } from "@mui/material";
import APP_LOGO from "../assets/logos/lr-logo.svg";
import RENT_LOGO from "../assets/logos/rentph-logo.png";
import { MenuRounded } from "@mui/icons-material";

export default function AppNavbar() {
  return (
    <>
      <Box
        sx={{
          width: "100%",
          pt: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 1.5,
            px: 2,
          }}
        >
          <IconButton>
            <MenuRounded />
          </IconButton>
          <Avatar
            src={APP_LOGO}
            variant="square"
            sx={{ height: "auto", width: 60 }}
          />
          <Divider orientation="vertical" sx={{ height: 35 }} />
          <Avatar
            src={RENT_LOGO}
            variant="square"
            sx={{ height: "auto", width: 80 }}
          />
        </Box>
        <Divider />
      </Box>
    </>
  );
}
