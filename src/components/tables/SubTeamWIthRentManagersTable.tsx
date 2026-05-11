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

interface SubTeam {
  subTeamLeader: string;
  subTeam: string;
  rentManager: number;
  rentManagerPro: number;
}

export default function SubTeamWithRentManagers({
  rentManagers,
  qualifiedRentManagers,
  loading = true,
}: {
  rentManagers: RentManager[] | null;
  qualifiedRentManagers: QualifiedRentManager[];
  loading: boolean;
}) {
  const [selectedSubTeam, setSelectedSubTeam] = useState<SubTeam | null>(null);

  const leaderEmails = new Set(
    (rentManagers ?? []).flatMap((rm) => [rm.subTeam.leaderEmail]),
  );

  const uniqueRentManagers = qualifiedRentManagers
    .filter((qrm) => !leaderEmails.has(qrm.email))
    .sort((a, b) => {
      if (a.pin === "Rent Manager Pro" && b.pin !== "Rent Manager Pro")
        return -1;
      if (a.pin !== "Rent Manager Pro" && b.pin === "Rent Manager Pro")
        return 1;
      return 0;
    })
    .filter(
      (rm, index, self) =>
        index === self.findIndex((r) => r.email === rm.email),
    );

  const groupedRentManagers: SubTeam[] = Object.values(
    uniqueRentManagers.reduce<Record<string, SubTeam>>((acc, rm) => {
      const key = `${rm.subTeam}`;
      if (!acc[key]) {
        acc[key] = {
          subTeamLeader: rm.subTeamLeader,
          subTeam: rm.subTeam,
          rentManager: 0,
          rentManagerPro: 0,
        };
      }
      if (rm.pin === "Rent Manager") acc[key].rentManager += 1;
      if (rm.pin === "Rent Manager Pro") acc[key].rentManagerPro += 1;
      return acc;
    }, {}),
  ).filter(
    (team) =>
      (team.rentManager >= 5 || team.rentManagerPro >= 1) &&
      team.subTeamLeader !== "",
  );

  const filteredQualifiedRentManagers = selectedSubTeam
    ? qualifiedRentManagers.filter(
        (qrm) => qrm.subTeam === selectedSubTeam.subTeam,
      )
    : [];

  const filteredRentManagers = selectedSubTeam
    ? (rentManagers ?? []).filter(
        (rm) => rm.subTeamName === selectedSubTeam.subTeam,
      )
    : [];

  const columns: GridColDef[] = [
    {
      field: "subTeamLeader",
      headerName: "Unit Manager",
      width: 350,
    },
    {
      field: "subTeam",
      headerName: "Sub-Team",
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
          onClick={() => setSelectedSubTeam(params.row as SubTeam)}
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
          label="Qualified Sub-Teams with Rent Managers/PROs"
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={groupedRentManagers}
          getRowId={(row) => `${row.subTeam}`}
          loading={loading}
          columns={columns}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>

      <Dialog
        open={selectedSubTeam !== null}
        onClose={() => setSelectedSubTeam(null)}
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
          Rental Sharing — {selectedSubTeam?.subTeamLeader} (
          {selectedSubTeam?.subTeam})
          <IconButton onClick={() => setSelectedSubTeam(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <RentalSharingTable
            qualifiedRentManagers={filteredQualifiedRentManagers}
            rentManagers={filteredRentManagers}
            isSubmTeam={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
