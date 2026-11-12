import { useMemo } from "react";
import { Box, Button } from "@mui/material";
import { ChevronRightRounded } from "@mui/icons-material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { Link } from "react-router-dom";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { QualifiedRentManager } from "../../pages/PinningTracker/Index";
import PinEarnedSalesCard, {
  type PinSummary,
} from "../cards/PinEarnedSalesCard";
import { PIN_ORDER } from "../cards/pinStyles";

export default function CertifiedRentManagersTable({
  tableName,
  rentManagers,
  loading = true,
}: {
  tableName: string;
  rentManagers: QualifiedRentManager[];
  loading: boolean;
}) {
  // "All" shows one row per agent with every pin in the expanded card; each
  // pin tab shows one row per agent for that pin
  const combined = tableName === "All";

  const rows = useMemo(() => {
    const groups = new Map<string, QualifiedRentManager[]>();

    [...rentManagers]
      .sort(
        (a, b) =>
          (a.dateQualified ?? "").localeCompare(b.dateQualified ?? "") ||
          PIN_ORDER.indexOf(a.pin as (typeof PIN_ORDER)[number]) -
            PIN_ORDER.indexOf(b.pin as (typeof PIN_ORDER)[number]),
      )
      .forEach((q) => {
        const key = combined ? `${q.rmId}` : `${q.rmId}__${q.pin}`;

        groups.set(key, [...(groups.get(key) ?? []), q]);
      });

    const summaries = [...groups.entries()].map(
      ([key, entries]): PinSummary => {
        const first = entries[0];
        const counts = PIN_ORDER.map((pin) => ({
          pin,
          count: entries.filter((e) => e.pin === pin).length,
        })).filter((c) => c.count > 0);

        return {
          id: key,
          rmId: first.rmId,
          name: first.name,
          email: first.email,
          team: first.team,
          subTeam: first.subTeam,
          area: first.area,
          pin: combined ? "All" : first.pin,
          pinLabels: combined
            ? counts
                .map((c) =>
                  c.pin === "RMPro Elite" ? c.pin : `${c.pin} ×${c.count}`,
                )
                .join(", ")
            : first.pin,
          // Cycles: the most times a pin was earned (a cycle starts at Rent
          // Manager). RMPro Elite is a single entry that already carries its own.
          pinCount: combined
            ? Math.max(
                0,
                ...counts
                  .filter((c) => c.pin !== "RMPro Elite")
                  .map((c) => c.count),
              )
            : first.pin === "RMPro Elite"
              ? first.pinCount
              : entries.length,
          clusters: [
            ...new Set(
              entries
                .filter((e) => !combined || e.pin !== "RMPro Elite")
                .map((e) => e.cluster),
            ),
          ].join(", "),
          rank: 0,
          lastEarned: entries[entries.length - 1].dateQualified ?? null,
          entries,
        };
      },
    );

    // Top = most cycles; ties go to who finished earlier, then by name
    summaries.sort(
      (a, b) =>
        b.pinCount - a.pinCount ||
        (a.lastEarned ?? "").localeCompare(b.lastEarned ?? "") ||
        a.name.localeCompare(b.name),
    );

    return summaries.map((summary, i) => ({ ...summary, rank: i + 1 }));
  }, [rentManagers, combined]);

  const columns: GridColDef[] = [
    {
      field: "rank",
      headerName: "#",
      width: 60,
      type: "number",
    },
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
      field: "clusters",
      headerName: "Months",
      width: 160,
    },
    {
      field: "lastEarned",
      headerName: "Last Earned",
      width: 120,
    },
    {
      field: "pinLabels",
      headerName: combined ? "Pins" : "Pin",
      width: combined ? 340 : 180,
    },
    {
      field: "pinCount",
      headerName: "Cycles",
      width: 100,
      type: "number",
    },
    {
      field: "rmId",
      headerName: "Graph",
      width: 100,
      renderCell: (params: GridRenderCellParams<PinSummary>) => (
        <Link to={`/pinning-tracker/${params.row.rmId}`}>
          <Button
            variant="outlined"
            color={
              params.row.pin === "RMPro" || params.row.pin === "RMPro Elite"
                ? "warning"
                : "primary"
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
          rows={rows}
          initialState={{
            sorting: {
              sortModel: [{ field: "pinCount", sort: "desc" }],
            },
          }}
          loading={loading}
          columns={columns}
          disableRowSelectionOnClick
          getDetailPanelContent={({ row }) => (
            <PinEarnedSalesCard summary={row} />
          )}
          getDetailPanelHeight={() => "auto"}
          sx={{ border: "none" }}
        />
      </Box>
    </>
  );
}
