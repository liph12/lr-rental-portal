import { Box } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { GridColDef } from "@mui/x-data-grid";
import { useAppContext } from "../../providers/AppProvider";
import { useMemo } from "react";

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

    const grouped = new Map<string, number>();

    for (const manager of rentManagers) {
      const area = manager.areaName ?? "Unknown";
      const tcpSum = (manager.rentalSales ?? []).reduce(
        (acc, sale) => acc + (sale.tcp ?? 0),
        0,
      );
      grouped.set(area, (grouped.get(area) ?? 0) + tcpSum);
    }

    const rows = Array.from(grouped.entries())
      .map(([areaName, total]) => ({ areaName, total }))
      .sort((a, b) => b.total - a.total)
      .map(({ areaName, total }, index) => ({
        id: index,
        rank: index + 1,
        areaName,
        totalRemittanceStr: formatRemittance(total),
        total,
      }));

    const grandTotal = rows.reduce((acc, row) => acc + row.total, 0);

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
      headerName: "Total Sales",
      width: 180,
      sortComparator: (_a, _b, cellParamsA, cellParamsB) => {
        const totalA =
          (cellParamsA as any).api.getRow(cellParamsA.id)?.total ?? 0;
        const totalB =
          (cellParamsB as any).api.getRow(cellParamsB.id)?.total ?? 0;
        return totalA - totalB;
      },
    },
  ];

  const pinnedRows = {
    bottom: [
      {
        id: "grand-total",
        rank: null,
        areaName: "Grand Total",
        totalRemittanceStr: formatRemittance(grandTotal),
        total: grandTotal,
      },
    ],
  };

  return (
    <Box height="60vh" sx={{ p: 1 }}>
      <DataGridPro
        label="Rental Sales (City)"
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
