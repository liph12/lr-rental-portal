import { useMemo } from "react";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef } from "@mui/x-data-grid";
import { type QualifiedRentManager } from "../../pages/PinningTracker/Index";
import { type RentManager } from "../../types";

interface RentalSharingRow {
  id: string;
  teamLeader: string;
  subTeamLeader: string;
  rentManager: string;
  remittanceDate: string;
  remittance: number;
  teamLeaderShare: number;
  subTeamLeaderShare: number;
  rate: "10%" | "5%";
  unitType: string;
}

interface SubTeamCount {
  rentManager: number;
  rentManagerPro: number;
}

const formatPHP = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

export default function RentalSharingTable({
  qualifiedRentManagers,
  rentManagers,
  isSubmTeam = false,
}: {
  qualifiedRentManagers: QualifiedRentManager[];
  rentManagers: RentManager[];
  isSubmTeam?: boolean;
}) {
  const qualifiedSubTeams = useMemo(() => {
    const subTeamCounts: Record<string, SubTeamCount> = {};

    const uniqueQualifiedRentManagers = qualifiedRentManagers
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

    uniqueQualifiedRentManagers.forEach((rm) => {
      const key = `${rm.team}__${rm.subTeam}`;

      if (rm.subTeamLeader !== "") {
        if (!subTeamCounts[key])
          subTeamCounts[key] = { rentManager: 0, rentManagerPro: 0 };
        if (rm.pin === "Rent Manager") subTeamCounts[key].rentManager += 1;
        if (rm.pin === "Rent Manager Pro")
          subTeamCounts[key].rentManagerPro += 1;
      }
    });

    return new Set(
      Object.entries(subTeamCounts)
        .filter(
          ([, counts]) => counts.rentManager >= 5 || counts.rentManagerPro >= 1,
        )
        .map(([key]) => key),
    );
  }, [qualifiedRentManagers]);

  const rows = useMemo(() => {
    const result: RentalSharingRow[] = [];

    rentManagers.forEach((rm) => {
      const isTeamLeader = rm.email === rm.team.leaderEmail;
      if (isTeamLeader) return;

      const qrm = qualifiedRentManagers
        .sort((a, b) => {
          if (a.pin === "Rent Manager Pro" && b.pin !== "Rent Manager Pro")
            return -1;
          if (a.pin !== "Rent Manager Pro" && b.pin === "Rent Manager Pro")
            return 1;
          return 0;
        })
        .find((q) => q.email === rm.email);

      const subTeamKey = qrm
        ? `${qrm.team}__${qrm.subTeam}`
        : `${rm.team.name}__${rm.subTeam.name}`;

      const isSubTeamLeader = rm.email === rm.subTeam.leaderEmail;
      const isQualifiedSubTeam =
        qualifiedSubTeams.has(subTeamKey) && !isSubTeamLeader;

      if (isSubmTeam && isSubTeamLeader) return;

      rm.rentalSales.forEach((sale) => {
        const base = sale.remittance / 2;
        const split = base / 2;

        result.push({
          id: `${rm.id}__${sale.id}`,
          teamLeader: rm.team.leader,
          subTeamLeader: rm.subTeam.leader,
          rentManager: `${rm.firstName} ${rm.lastName}`,
          remittanceDate: sale.remittanceDate,
          remittance: sale.remittance,
          teamLeaderShare: isQualifiedSubTeam ? split : base,
          subTeamLeaderShare: isQualifiedSubTeam ? split : 0,
          rate: isQualifiedSubTeam ? "5%" : "10%",
          unitType: sale.unitType,
        });
      });
    });

    return result;
  }, [rentManagers, qualifiedRentManagers, qualifiedSubTeams]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          remittance: acc.remittance + row.remittance,
          teamLeaderShare: acc.teamLeaderShare + row.teamLeaderShare,
          subTeamLeaderShare: acc.subTeamLeaderShare + row.subTeamLeaderShare,
          totalShare:
            acc.totalShare + row.teamLeaderShare + row.subTeamLeaderShare,
        }),
        {
          remittance: 0,
          teamLeaderShare: 0,
          subTeamLeaderShare: 0,
          totalShare: 0,
        },
      ),
    [rows],
  );

  const mainColumns: GridColDef[] = [
    { field: "teamLeader", headerName: "Team Leader", width: 250 },
    { field: "subTeamLeader", headerName: "Unit Manager", width: 250 },
    { field: "rentManager", headerName: "Rent Manager", width: 250 },
    { field: "remittanceDate", headerName: "Remittance Date", width: 130 },
    {
      field: "remittance",
      headerName: "Remittance",
      width: 150,
      type: "number",
      valueFormatter: (value: number) => formatPHP(value),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 80,
      renderCell: (params) => (
        <>
          {params.value === "" ? (
            <></>
          ) : (
            <Chip
              label={params.value}
              size="small"
              color={params.value === "5%" ? "warning" : "success"}
            />
          )}
        </>
      ),
    },
    {
      field: "teamLeaderShare",
      headerName: "TL Share",
      width: 150,
      type: "number",
      valueFormatter: (value: number) => formatPHP(value),
    },
    {
      field: "subTeamLeaderShare",
      headerName: "UM Share",
      width: 150,
      type: "number",
      valueFormatter: (value: number) => formatPHP(value),
    },
    { field: "unitType", headerName: "Unit Type", width: 200 },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box height="70vh" sx={{ p: 1 }}>
        <DataGridPro
          showCellVerticalBorder
          showColumnVerticalBorder
          showToolbar
          density="compact"
          rows={rows}
          columns={mainColumns}
          disableRowSelectionOnClick
          pinnedRows={{
            bottom: [
              {
                id: "__total__",
                teamLeader: "Total",
                subTeamLeader: "",
                rentManager: "",
                remittanceDate: "",
                remittance: totals.remittance,
                teamLeaderShare: totals.teamLeaderShare,
                subTeamLeaderShare: totals.subTeamLeaderShare,
                rate: "",
                unitType: "",
              },
            ],
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-pinnedRows": { fontWeight: "bold" },
          }}
        />
      </Box>

      <Divider />

      <Stack
        direction="row"
        spacing={4}
        sx={{ p: 2, justifyContent: "flex-end" }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total Remittance
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatPHP(totals.remittance)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total TL Share
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {formatPHP(totals.teamLeaderShare)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total UM Share
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="warning.main">
            {formatPHP(totals.subTeamLeaderShare)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total Share
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatPHP(totals.totalShare)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
