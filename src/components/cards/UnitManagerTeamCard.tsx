import type { Team, RentManager } from "../../types";
import { Typography, Box, Divider, Chip, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useAppContext } from "../../providers/AppProvider";
import RentManagerSalesCard from "./RentManagerSalesCard";

const MAX_QUALIFIED_LEVELS = 5;

export default function UnitManagerTeamCard(team: Team) {
  const { rentManagers } = useAppContext();
  const [expanded, setExpanded] = useState(false);
  const [umNetwork, setUmNetwork] = useState<RentManager[] | null>(null);

  useEffect(() => {
    if (rentManagers) {
      const umNetwork = rentManagers?.filter(
        (r) =>
          r.subTeamName !== "Direct" &&
          r.email !== team.leaderEmail &&
          r.subTeam.id === team.id
      );

      setUmNetwork(umNetwork);
    }
  }, []);

  return (
    <>
      <Box sx={{ py: 1, px: 2, border: "1px solid #ddd", height: "16vh" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="body1">{team.name}</Typography>
            <Typography variant="body2">{team.leader}</Typography>
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
              {team.totalRemittanceStr}
            </Typography>
            <Typography variant="caption" color="warning">
              Total Remittance
            </Typography>
          </Box>
          <Divider orientation="vertical" sx={{ height: 50 }} />
          <Box>
            <Typography variant="h6" fontFamily="monospace">
              {team.hasRemittanceLevelCount}
            </Typography>
            <Typography variant="caption" color="primary">
              Rent Managers
            </Typography>
          </Box>
          <Divider orientation="vertical" sx={{ height: 50 }} />
          <Box sx={{ mt: 3 }}>
            {team.hasRemittanceLevelCount >= MAX_QUALIFIED_LEVELS ? (
              <Chip
                label="Qualified"
                size="small"
                color="warning"
                sx={{
                  backgroundColor: "rgba(181, 214, 249, 0.58)",
                  color: "primary.main",
                  border: "1px solid rgb(56, 116, 193)",
                }}
              />
            ) : (
              <Chip label="Not qualified" size="small" />
            )}
          </Box>
        </Box>
      </Box>
      {expanded && (
        <Box sx={{ mt: 2, pl: 2, borderLeft: "2px solid rgb(56, 116, 193)" }}>
          {umNetwork?.map((rm) => (
            <Box sx={{ mb: 2 }} key={rm.id}>
              <RentManagerSalesCard rm={rm} />
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
