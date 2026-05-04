import { Box } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef } from "@mui/x-data-grid";
import { useAppContext } from "../../providers/AppProvider";
import { useMemo } from "react";

function parseRemittance(value: string): number {
  return parseFloat((value ?? "0").replace(/,/g, "")) || 0;
}

function formatRemittance(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RentalPerCitiesTable() {
  const { rentManagers } = useAppContext();

  const { groupedRows, grandTotal } = useMemo(() => {
    if (!rentManagers) return { groupedRows: [], grandTotal: 0 };

    const grouped = new Map<string, { total: number; count: number }>();

    for (const row of rentManagers) {
      const area = row.areaName ?? "Unknown";
      const amount = parseRemittance(row.totalRemittanceStr);
      const existing = grouped.get(area);

      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        grouped.set(area, { total: amount, count: 1 });
      }
    }

    const rows = Array.from(grouped.entries())
      .map(([areaName, { total }]) => ({ areaName, total }))
      .sort((a, b) => b.total - a.total)
      .map(({ areaName, total }, index) => ({
        id: index,
        rank: index + 1,
        areaName,
        totalRemittanceStr: formatRemittance(total),
      }));

    const grandTotal = rows.reduce(
      (acc, row) => acc + parseRemittance(row.totalRemittanceStr),
      0,
    );

    return { groupedRows: rows, grandTotal };
  }, [rentManagers]);

  const columns: GridColDef[] = [
    {
      field: "rank",
      headerName: "Rank",
      width: 70,
    },
    {
      field: "areaName",
      headerName: "Area",
      width: 110,
    },
    {
      field: "totalRemittanceStr",
      headerName: "Total Remittance (20%)",
      width: 250,
      sortComparator: (a, b) => parseRemittance(a) - parseRemittance(b),
    },
  ];

  const pinnedRows = {
    bottom: [
      {
        id: "grand-total",
        rank: null,
        areaName: "Grand Total",
        totalRemittanceStr: formatRemittance(grandTotal),
      },
    ],
  };

  return (
    <Box height="60vh" sx={{ p: 1 }}>
      <DataGridPro
        label="Rental Remittance (City)"
        showCellVerticalBorder
        showColumnVerticalBorder
        showToolbar
        density="compact"
        rows={groupedRows}
        pinnedRows={pinnedRows}
        loading={rentManagers === null}
        columns={columns}
        disableRowSelectionOnClick
        sx={{
          border: "none",
          "& .grand-total-row": {
            fontWeight: "bold",
            backgroundColor: "action.hover",
          },
        }}
        getRowClassName={(params) =>
          params.id === "grand-total" ? "grand-total-row" : ""
        }
      />
    </Box>
  );
}
