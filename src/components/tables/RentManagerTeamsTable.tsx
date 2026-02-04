import { Box, Button, Chip } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { Team } from "../../types";
import { useAppContext } from "../../providers/AppProvider";
import { ChevronRight } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

export default function RentManagerTeamsTable() {
  const { teams } = useAppContext();
  const location = useLocation();

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Team",
      width: 200,
    },
    {
      field: "leader",
      headerName: "Leader",
      width: 200,
    },
    {
      field: "totalRemittanceStr",
      headerName: "Total Remittance (20%)",
      width: 200,
    },
    {
      field: "hasRemittanceLevelCount",
      headerName: "Total Rent Managers",
      width: 200,
      renderCell: (params: GridRenderCellParams<Team>) => {
        return (
          <>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {params.row.hasRemittanceLevelCount >= 5 ? (
                <Chip
                  label={`Qualified (${params.row.hasRemittanceLevelCount})`}
                  size="small"
                  color="primary"
                  sx={{
                    backgroundColor: "rgba(181, 214, 249, 0.58)",
                    color: "primary.main",
                    border: "1px solid rgb(56, 116, 193)",
                  }}
                />
              ) : (
                <Chip
                  label={`Not qualified (${params.row.hasRemittanceLevelCount})`}
                  size="small"
                />
              )}
            </Box>
          </>
        );
      },
    },
    {
      field: "id",
      headerName: "Action",
      width: 100,
      renderCell: (params: GridRenderCellParams<Team>) => {
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <Link to={`/reports/${params.row.id}${location?.search ?? ""}`}>
              <Button
                disableElevation
                variant="outlined"
                size="small"
                sx={{ borderRadius: 0, textTransform: "none" }}
                endIcon={<ChevronRight />}
                color="warning"
              >
                View
              </Button>
            </Link>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Box height="60vh" sx={{ border: "1px solid #ddd", p: 1 }}>
        <DataGridPro
          label="Rent Manager Teams"
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={teams ?? []}
          loading={teams === null}
          columns={columns}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>
    </>
  );
}
