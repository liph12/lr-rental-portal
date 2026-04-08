import { Typography, Box, Divider } from "@mui/material";
import type { RentalSale } from "../../types";
import { formatDatePH } from "../../helpers";

interface ClosedRentalSaleCardProps {
  rentalSale: RentalSale;
  qualified: boolean;
}

export default function ClosedRentalSaleCard({
  rentalSale,
  qualified,
}: ClosedRentalSaleCardProps) {
  const SHARE = rentalSale.remittance / 2;
  const ACTUAL_SHARE = qualified ? SHARE / 2 : SHARE;

  return (
    <Box sx={{ py: 1, px: 2, bgcolor: "#fff", height: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="body2">{rentalSale.client}</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="body1" fontFamily="monospace">
            {rentalSale.remittance.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="warning">
            Remittance
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 40 }} />
        <Box>
          <Typography variant="body1">
            {formatDatePH(rentalSale.remittanceDate)}
          </Typography>
          <Typography variant="caption" color="primary">
            Remittance Date
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 40 }} />
        <Box>
          <Typography variant="body1" fontFamily="monospace">
            {ACTUAL_SHARE.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="primary">
            TL Share {qualified ? "(5%)" : "(10%)"}
          </Typography>
        </Box>
        {qualified && (
          <>
            <Divider orientation="vertical" sx={{ height: 40 }} />
            <Box>
              <Typography variant="body1" fontFamily="monospace">
                {ACTUAL_SHARE.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="primary">
                UM Share {"(5%)"}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
