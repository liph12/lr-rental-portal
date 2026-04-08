import { Box, Divider, Typography } from "@mui/material";
import type { Team } from "../../types";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

export default function RentManagersTeamHeaderCard({ team }: { team: Team }) {
  return (
    <Box sx={{ py: 1, px: 2, bgcolor: "#fff", height: "16vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {team.name}
        </Typography>
        <GroupsOutlinedIcon
          fontSize="large"
          sx={{ fontSize: 50, color: "#aaa" }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {team.totalRemittanceStr?.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="warning">
            Total Remittance
          </Typography>
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h5" fontFamily="monospace">
            {team.hasRemittanceLevelCount.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="primary">
            Total Rent Managers
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
