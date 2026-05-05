import { Box } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef } from "@mui/x-data-grid";
import type { QualifiedRentManager } from "../../pages/PinningTracker/Index";

interface Team {
  team: string;
  subTeam: string;
  rentManager: number;
  rentManagerPro: number;
}

export default function TeamWithRentManagers({
  rentManagers,
}: {
  rentManagers: QualifiedRentManager[];
}) {
  const groupedRentManagers: Team[] = Object.values(
    rentManagers.reduce<Record<string, Team>>((acc, rm) => {
      const key = `${rm.team}__${rm.subTeam}`;
      if (!acc[key]) {
        acc[key] = {
          team: rm.team,
          subTeam: rm.subTeam,
          rentManager: 0,
          rentManagerPro: 0,
        };
      }
      if (rm.pin === "Rent Manager") acc[key].rentManager += 1;
      if (rm.pin === "Rent Manager Pro") acc[key].rentManagerPro += 1;
      return acc;
    }, {}),
  );

  const columns: GridColDef[] = [
    {
      field: "team",
      headerName: "Team",
      width: 400,
    },
    {
      field: "subTeam",
      headerName: "Sub-Team",
      width: 400,
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
  ];

  return (
    <>
      <Box height="60vh" sx={{ p: 1 }}>
        <DataGridPro
          label="Qualified Teams (Has Rent Managers/PRO)"
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={groupedRentManagers}
          getRowId={(row) => `${row.team}__${row.subTeam}`}
          loading={rentManagers === null}
          columns={columns}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>
    </>
  );
}
