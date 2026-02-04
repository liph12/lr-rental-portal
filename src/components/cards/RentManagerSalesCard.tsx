import { Typography, Box, Divider, Chip, IconButton } from "@mui/material";
import type { RentManager } from "../../types";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useState } from "react";
import ClosedRentalSaleCard from "./ClosedRentalSaleCard";

interface RentManagerSalesCardProps {
  rm: RentManager;
  qualified: boolean;
}

export default function RentManagerSalesCard({
  rm,
  qualified,
}: RentManagerSalesCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Box sx={{ py: 1, px: 2, border: "1px solid #ddd", height: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="body1">{`${rm.firstName} ${rm.lastName}`}</Typography>
            <Typography variant="body2">{rm.email}</Typography>
          </Box>
          <Box>
            <IconButton
              size="medium"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? (
                <KeyboardArrowUpOutlinedIcon fontSize="medium" />
              ) : (
                <KeyboardArrowDownOutlinedIcon fontSize="medium" />
              )}
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
          <Divider orientation="vertical" sx={{ height: 50 }} />
          <Box sx={{ mt: 2 }}>
            <Chip
              label={
                rm.subTeamName === "Direct"
                  ? "Direct"
                  : rm.email === rm.subTeam.leaderEmail
                  ? "Unit Manager"
                  : rm.subTeamName
              }
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
        </Box>
      </Box>
      {expanded && (
        <Box sx={{ mt: 2, pl: 2, borderLeft: "2px solid rgb(232, 161, 90)" }}>
          {rm.rentalSales?.map((s) => (
            <Box sx={{ mb: 2 }} key={s.id}>
              <ClosedRentalSaleCard rentalSale={s} qualified={qualified} />
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
