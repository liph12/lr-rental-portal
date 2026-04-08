import type { PinningTrackerType } from "../../pages/PinningTracker/Index";
import type { RentalSale } from "../../types";
import { generateBiMonthlyClusters } from "../../helpers";
import { Box, Typography, Divider } from "@mui/material";
import PinningTrackerBarChart from "../charts/PinningTrackerBarChart";
import { useState } from "react";

export default function PinningTrackerCard({
  pinningTracker,
}: {
  pinningTracker: PinningTrackerType;
}) {
  const year = 2025;
  const monthlyClusters = generateBiMonthlyClusters(year);
  const [todayMonthFormatted, setTodayMonthFormatted] =
    useState<string>("2025-01");

  const getCurrentClusteredSales = (
    trackedRow: PinningTrackerType
  ): {
    sales: RentalSale[];
    cluster: string;
  } => {
    const cluster = monthlyClusters.find(
      (c) =>
        todayMonthFormatted >= c.monthFrom && todayMonthFormatted <= c.monthTo
    )?.name;

    if (cluster) {
      return {
        sales:
          trackedRow.pinningClusters.find((r) => r.cluster === cluster)?.all ??
          [],
        cluster: cluster,
      };
    }

    return {
      sales: [],
      cluster: cluster ?? "",
    };
  };

  const handleSelectCluster = (cluster: string) => {
    const clusterObj = monthlyClusters.find((c) => c.name === cluster);

    setTodayMonthFormatted(clusterObj?.monthTo ?? "");
  };

  const { cluster, sales } = getCurrentClusteredSales(pinningTracker);
  const totalRemittance = sales.reduce(
    (total, sale) => total + sale.remittance,
    0
  );
  const startTotal = pinningTracker.pinningClusters
    .filter((c) => c.cluster === cluster)
    .reduce((total, sale) => total + sale.startTotal, 0);
  const endTotal = pinningTracker.pinningClusters
    .filter((c) => c.cluster === cluster)
    .reduce((total, sale) => total + sale.endTotal, 0);

  return (
    <>
      <Box
        sx={{
          height: "25vh",
          bgcolor: "#fff",
          display: "flex",
          py: 2,
          px: 3,
          gap: 2,
        }}
      >
        <Box sx={{ width: 300, position: "relative" }}>
          <Typography>{pinningTracker.name}</Typography>
          <Box sx={{ position: "absolute", bottom: 0 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box>
                <Typography
                  variant="body1"
                  fontWeight={700}
                  fontFamily="monospace"
                >
                  {(startTotal + endTotal).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="primary">
                  {cluster}
                </Typography>
              </Box>
              <Divider sx={{ height: 40 }} orientation="vertical" />
              <Box>
                <Typography
                  variant="body1"
                  fontWeight={700}
                  fontFamily="monospace"
                >
                  {totalRemittance.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="primary">
                  TOTAL
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ height: "100%", mx: 1 }} orientation="vertical" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PinningTrackerBarChart
            clusters={pinningTracker.pinningClusters}
            current={cluster}
            handleSelectCluster={handleSelectCluster}
          />
        </Box>
        <Box></Box>
      </Box>
    </>
  );
}
