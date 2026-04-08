import { Box, CircularProgress, Typography } from "@mui/material";

export default function ({ title = "user data" }: { title?: string }) {
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
        <CircularProgress size={50} sx={{ mb: 3 }} />
        <Typography>Loading {title}...</Typography>
      </Box>
    </Box>
  );
}
