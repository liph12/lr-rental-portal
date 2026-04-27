import { Box, Button, Chip } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { Team } from "../../types";
import { ChevronRight } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { getStoredUserData } from "../../helpers";

type Role = "UNIT MANAGER" | "TEAM LEADER" | "AGENT" | "ADMIN";
type Status = "pending" | "reviewed";

interface Item {
  id: number;
  name: string;
  team: string;
  role: Role;
  cluster: string;
  status: Status;
  createdAt: string;
}

export default function RentalRequirementsTable() {
  const userData = getStoredUserData();
  const [submissions, setSubmissions] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "team",
      headerName: "Team",
      width: 200,
    },
    {
      field: "role",
      headerName: "Role",
      width: 100,
    },
    {
      field: "cluster",
      headerName: "Months",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params: GridRenderCellParams<Item>) => {
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
              {params.row.status === "reviewed" ? (
                <Chip
                  label={`Reviewed`}
                  size="small"
                  color="primary"
                  sx={{
                    backgroundColor: "rgba(181, 214, 249, 0.58)",
                    color: "primary.main",
                    border: "1px solid rgb(56, 116, 193)",
                  }}
                />
              ) : (
                <Chip label={`Pending`} size="small" />
              )}
            </Box>
          </>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Submitted At",
      width: 200,
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
            <Link to={`/reports/rental-submissions/${params.row.id}`}>
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

  useEffect(() => {
    const fetchSubmissionsAsync = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "https://api.leuteriorealty.com/lr/v2/public/api/rental-reports",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userData.auth_token}`,
            },
          },
        );

        const data = response.data?.data;
        const mappedData: Item[] = data.map((item: any) => {
          const role =
            item.agent.role.role === "SUPERVISOR"
              ? "TEAM LEADER"
              : item.agent.role.role;

          return {
            id: item.id,
            name: item.agent.name,
            team: item.agent.team.teamname,
            role: role,
            status: item.status,
            cluster: item.clustered_months,
            createdAt: item.created_at,
          };
        });

        setSubmissions(mappedData);
      } catch (e) {
        // to do
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionsAsync();
  }, []);

  return (
    <>
      <Box height="60vh" sx={{ p: 1 }}>
        <DataGridPro
          label="Rental Requirements Submissions"
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={submissions}
          loading={loading}
          columns={columns}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>
    </>
  );
}
