import { Box, Chip } from "@mui/material";
import type { RentManager } from "../../types";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useAppContext } from "../../providers/AppProvider";

export default function RentManagersTable() {
  const { rentManagers } = useAppContext();
  const columns: GridColDef[] = [
    {
      field: "firstName",
      headerName: "Firstname",
      width: 200,
    },
    {
      field: "lastName",
      headerName: "Lastname",
      width: 100,
    },
    {
      field: "teamName",
      headerName: "Team",
      width: 150,
    },
    {
      field: "areaName",
      headerName: "Area",
      width: 110,
    },
    {
      field: "totalRemittanceStr",
      headerName: "Total Remittance (20%)",
      width: 180,
    },
    {
      field: "hasRemittanceLevel",
      headerName: "Level",
      width: 250,
      renderCell: (params: GridRenderCellParams<RentManager>) => {
        return (
          <>
            {params.row.hasRemittanceLevel ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Chip
                  label="Rent Manager"
                  size="small"
                  color="warning"
                  sx={{
                    backgroundColor: "rgba(240, 194, 138, 0.44)",
                    color: "warning.main",
                    border: "1px solid rgb(230, 136, 21)",
                  }}
                />
              </Box>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      <Box height="60vh" sx={{ p: 1 }}>
        <DataGridPro
          label="Rent Managers"
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
