import { Box, Typography, Link as MUILink } from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAppContext } from "../providers/AppProvider";

export default function ErrorPage() {
  const { user } = useAppContext();

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        {user ? (
          <>
            <WarningAmberRounded sx={{ fontSize: 100 }} color="action" />
            <Typography variant="h5" color="textSecondary">
              Oops! Resource not found.
            </Typography>
            <Typography>
              Return to the previous page or go back to your{" "}
              <MUILink
                component={Link}
                to="/"
                sx={{ textDecoration: "none", color: "primary.main" }}
              >
                dashboard.
              </MUILink>
            </Typography>
          </>
        ) : (
          <>
            <WarningAmberRounded sx={{ fontSize: 100 }} color="action" />
            <Typography variant="h5" color="textSecondary">
              Oops! Unauthorized page access.
            </Typography>
            <Typography>
              Return to the previous page or go back to{" "}
              <MUILink
                component={Link}
                to="/login"
                sx={{ textDecoration: "none", color: "primary.main" }}
              >
                login.
              </MUILink>
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
