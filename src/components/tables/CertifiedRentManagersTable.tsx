import { Box, Button } from "@mui/material";
import { ChevronRightRounded } from "@mui/icons-material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { Link } from "react-router-dom";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { QualifiedRentManager } from "../../pages/PinningTracker/Index";

export default function CertifiedRentManagersTable({
  tableName,
  rentManagers,
}: {
  tableName: string;
  rentManagers: QualifiedRentManager[];
}) {
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Rent Manager",
      width: 240,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "team",
      headerName: "Team",
      width: 150,
    },
    {
      field: "subTeam",
      headerName: "Sub-Team",
      width: 150,
    },
    {
      field: "area",
      headerName: "Area",
      width: 110,
    },
    {
      field: "cluster",
      headerName: "Months",
      width: 100,
    },
    {
      field: "dateQualified",
      headerName: "Date",
      width: 100,
    },
    {
      field: "pin",
      headerName: "Pin",
      width: 180,
    },
    {
      field: "id",
      headerName: "Graph",
      width: 100,
      renderCell: (params: GridRenderCellParams<QualifiedRentManager>) => (
        <Link to={`/pinning-tracker/${params.row.rmId}`}>
          <Button
            variant="outlined"
            color={
              params.row.pin === "Rent Manager Pro" ? "warning" : "primary"
            }
            size="small"
            endIcon={<ChevronRightRounded />}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <Box height="60vh" sx={{ p: 1 }}>
        <DataGridPro
          label={tableName}
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={rentManagers ?? []}
          loading={rentManagers === null}
          columns={columns}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>
    </>
  );
}
