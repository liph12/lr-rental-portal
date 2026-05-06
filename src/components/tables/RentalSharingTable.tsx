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

// interface TLSummaryRow {
//   id: string;
//   teamLeader: string;
//   totalRemittance: number;
//   totalShare: number;
// }

// interface UMSummaryRow {
//   id: string;
//   subTeamLeader: string;
//   totalRemittance: number;
//   totalShare: number;
// }

interface SubTeamCount {
  rentManager: number;
  rentManagerPro: number;
}

const formatPHP = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

export default function RentalSharingTable({
  qualifiedRentManagers,
  rentManagers,
}: {
  qualifiedRentManagers: QualifiedRentManager[];
  rentManagers: RentManager[];
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
    const qualifiedEmails = new Set(
      qualifiedRentManagers.map((qrm) => qrm.email),
    );
    const result: RentalSharingRow[] = [];

    rentManagers
      .filter((rm) => qualifiedEmails.has(rm.email))
      .forEach((rm) => {
        const qrm = qualifiedRentManagers
          .sort((a, b) => {
            if (a.pin === "Rent Manager Pro" && b.pin !== "Rent Manager Pro")
              return -1;
            if (a.pin !== "Rent Manager Pro" && b.pin === "Rent Manager Pro")
              return 1;
            return 0;
          })
          .find((q) => q.email === rm.email);
        const isAgent =
          rm.email !== rm.team.leaderEmail &&
          rm.email !== rm.subTeam.leaderEmail;
        if (!qrm || !isAgent) return;

        const subTeamKey = `${qrm.team}__${qrm.subTeam}`;
        const isQualifiedSubTeam = qualifiedSubTeams.has(subTeamKey);

        rm.rentalSales.forEach((sale) => {
          const base = sale.remittance / 2;
          const split = base / 2;

          result.push({
            id: `${rm.id}__${sale.id}`,
            teamLeader: qrm.teamLeader,
            subTeamLeader: qrm.subTeamLeader,
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

  //   const tlSummaryRows = useMemo<TLSummaryRow[]>(() => {
  //     const map: Record<string, TLSummaryRow> = {};
  //     rows.forEach((row) => {
  //       if (!map[row.teamLeader]) {
  //         map[row.teamLeader] = {
  //           id: row.teamLeader,
  //           teamLeader: row.teamLeader,
  //           totalRemittance: 0,
  //           totalShare: 0,
  //         };
  //       }
  //       map[row.teamLeader].totalRemittance += row.remittance;
  //       map[row.teamLeader].totalShare += row.teamLeaderShare;
  //     });
  //     return Object.values(map);
  //   }, [rows]);

  //   const umSummaryRows = useMemo<UMSummaryRow[]>(() => {
  //     const map: Record<string, UMSummaryRow> = {};
  //     rows.forEach((row) => {
  //       if (!row.subTeamLeader || row.subTeamLeaderShare === 0) return;
  //       if (!map[row.subTeamLeader]) {
  //         map[row.subTeamLeader] = {
  //           id: row.subTeamLeader,
  //           subTeamLeader: row.subTeamLeader,
  //           totalRemittance: 0,
  //           totalShare: 0,
  //         };
  //       }
  //       map[row.subTeamLeader].totalRemittance += row.remittance;
  //       map[row.subTeamLeader].totalShare += row.subTeamLeaderShare;
  //     });
  //     return Object.values(map);
  //   }, [rows]);

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

  //   const tlColumns: GridColDef[] = [
  //     { field: "teamLeader", headerName: "Team Leader", width: 250 },
  //     {
  //       field: "totalRemittance",
  //       headerName: "Total Remittance",
  //       width: 180,
  //       type: "number",
  //       valueFormatter: (value: number) => formatPHP(value),
  //     },
  //     {
  //       field: "totalShare",
  //       headerName: "Total TL Share",
  //       width: 180,
  //       type: "number",
  //       valueFormatter: (value: number) => formatPHP(value),
  //     },
  //   ];

  //   const umColumns: GridColDef[] = [
  //     { field: "subTeamLeader", headerName: "Unit Manager", width: 250 },
  //     {
  //       field: "totalRemittance",
  //       headerName: "Total Remittance",
  //       width: 180,
  //       type: "number",
  //       valueFormatter: (value: number) => formatPHP(value),
  //     },
  //     {
  //       field: "totalShare",
  //       headerName: "Total UM Share",
  //       width: 180,
  //       type: "number",
  //       valueFormatter: (value: number) => formatPHP(value),
  //     },
  //   ];

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

      {/* <Divider />
      <Stack direction="row" spacing={2} sx={{ p: 2 }}>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Team Leader Summary
          </Typography>
          <DataGridPro
            showCellVerticalBorder
            showColumnVerticalBorder
            showToolbar
            density="compact"
            rows={tlSummaryRows}
            columns={tlColumns}
            disableRowSelectionOnClick
            hideFooter
            sx={{ border: "none" }}
          />
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Unit Manager Summary
          </Typography>
          <DataGridPro
            showCellVerticalBorder
            showColumnVerticalBorder
            showToolbar
            density="compact"
            rows={umSummaryRows}
            columns={umColumns}
            disableRowSelectionOnClick
            hideFooter
            sx={{ border: "none" }}
          />
        </Box>
      </Stack> */}

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
