import { Typography, Box, Divider, Chip, IconButton } from "@mui/material";
import type { RentManager } from "../../types";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

export default function RentManagerSalesCard({ rm }: { rm: RentManager }) {
  return (
    <Box sx={{ py: 1, px: 2, border: "1px solid #ddd", height: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="body1">{`${rm.firstName} ${rm.lastName}`}</Typography>
          <Typography variant="body2">{rm.email}</Typography>
          <Chip
            label={rm.subTeamName === "Direct" ? "Direct" : "Unit Manager"}
            size="small"
            color="warning"
            sx={{
              mt: 1,
              backgroundColor: "rgba(240, 194, 138, 0.44)",
              color: "warning.main",
              border: "1px solid rgb(230, 136, 21)",
            }}
          />
        </Box>
        <Box>
          <IconButton size="medium">
            <KeyboardArrowDownOutlinedIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="h6" fontFamily="monospace">
            {rm.totalRemittanceStr}
          </Typography>
          <Typography variant="caption" color="warning">
            Total Remittance
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h6" fontFamily="monospace">
            {rm.rentalSales.length}
          </Typography>
          <Typography variant="caption" color="primary">
            Number of Closed Rentals
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
