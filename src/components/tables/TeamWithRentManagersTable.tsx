import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef } from "@mui/x-data-grid";
import type { QualifiedRentManager } from "../../pages/PinningTracker/Index";
import type { RentManager } from "../../types";
import RentalSharingTable from "./RentalSharingTable";
import { ChevronRight } from "@mui/icons-material";

interface Team {
  teamLeader: string;
  team: string;
  rentManager: number;
  rentManagerPro: number;
}

export default function TeamWithRentManagers({
  qualifiedRentManagers,
  rentManagers,
  loading = true,
}: {
  qualifiedRentManagers: QualifiedRentManager[];
  rentManagers: RentManager[] | null;
  loading: boolean;
}) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const leaderEmails = new Set(
    (rentManagers ?? []).flatMap((rm) => [rm.team.leaderEmail]),
  );

  const agentOnlyQualifiedRentManagers = qualifiedRentManagers
    .filter((qrm) => !leaderEmails.has(qrm.email))
    .sort((a, b) => {
      if (a.pin === "Rent Manager Pro" && b.pin !== "Rent Manager Pro")
        return -1;
      if (a.pin !== "Rent Manager Pro" && b.pin === "Rent Manager Pro")
        return 1;
      return 0;
    })
    .filter(
      (qrm, index, self) =>
        index === self.findIndex((q) => q.email === qrm.email),
    );

  const groupedRentManagers: Team[] = Object.values(
    agentOnlyQualifiedRentManagers.reduce<Record<string, Team>>((acc, rm) => {
      const key = rm.teamId;
      if (!acc[key]) {
        acc[key] = {
          teamLeader: rm.teamLeader,
          team: rm.team,
          rentManager: 0,
          rentManagerPro: 0,
        };
      }

      if (rm.pin === "Rent Manager") acc[key].rentManager += 1;
      if (rm.pin === "Rent Manager Pro") acc[key].rentManagerPro += 1;

      return acc;
    }, {}),
  ).filter((team) => team.rentManager >= 5 || team.rentManagerPro >= 1);

  const filteredQualifiedRentManagers = selectedTeam
    ? qualifiedRentManagers.filter((qrm) => qrm.team === selectedTeam.team)
    : [];

  const filteredRentManagers = selectedTeam
    ? (rentManagers ?? []).filter((rm) => rm.teamName === selectedTeam.team)
    : [];

  const columns: GridColDef[] = [
    {
      field: "teamLeader",
      headerName: "Team Leader",
      width: 350,
    },
    {
      field: "team",
      headerName: "Team",
      width: 300,
    },
    {
      field: "rentManager",
      headerName: "Rent Managers",
      width: 180,
    },
    {
      field: "rentManagerPro",
      headerName: "Rent Manager PROs",
      width: 180,
    },
    {
      field: "actions",
      headerName: "",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setSelectedTeam(params.row as Team)}
          sx={{ borderRadius: 0, textTransform: "none" }}
          endIcon={<ChevronRight />}
        >
          Share
        </Button>
      ),
    },
  ];

  return (
    <>
      <Box height="60vh" sx={{ p: 1 }}>
        <DataGridPro
          label="Qualified Teams with Rent Managers/PROs"
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={groupedRentManagers}
          getRowId={(row) => `${row.team}`}
          loading={loading}
          columns={columns}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>

      <Dialog
        open={selectedTeam !== null}
        onClose={() => setSelectedTeam(null)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Rental Sharing — {selectedTeam?.teamLeader} ({selectedTeam?.team})
          <IconButton onClick={() => setSelectedTeam(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <RentalSharingTable
            qualifiedRentManagers={filteredQualifiedRentManagers}
            rentManagers={filteredRentManagers}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
