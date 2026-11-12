import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Verified } from "@mui/icons-material";
import { formatDatePH } from "../../helpers";
import type { QualifiedRentManager } from "../../pages/PinningTracker/Index";
import { PIN_COLORS, PIN_ORDER } from "./pinStyles";

// One table row per agent per pin type (per agent only in the "All" view);
// entries are the individual pins earned
export interface PinSummary {
  id: string;
  rmId: number;
  name: string;
  email: string;
  team: string;
  subTeam: string;
  area: string;
  pin: QualifiedRentManager["pin"];
  pinLabels: string;
  pinCount: number;
  // 1 = most cycles; fixed by cycles so it stays the same when sorting
  rank: number;
  clusters: string;
  lastEarned: string | null;
  entries: QualifiedRentManager[];
}

const formatPHP = (value: number) =>
  value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const cellSx = { py: 0.5, px: 1, fontSize: "0.8rem", whiteSpace: "nowrap" };

export default function PinEarnedSalesCard({
  summary,
}: {
  summary: PinSummary;
}) {
  const combined = summary.pin === "All";

  // One section per pin earned (per cycle for RMPro Elite), in date order
  const sections = summary.entries.flatMap((entry, entryIndex) => {
    const groups = entry.earnedSales.filter((g) => g.sales.length > 0);
    const isEliteEntry = entry.pin === "RMPro Elite";
    // nth pin of this type earned by the agent
    const pinCycle =
      summary.entries.slice(0, entryIndex).filter((e) => e.pin === entry.pin)
        .length + 1;

    return groups.map((group, groupIndex) => {
      const earnedLabel = isEliteEntry
        ? groupIndex === groups.length - 1
          ? "RMPro Elite"
          : "RMPro"
        : entry.pin;
      const cycle = isEliteEntry ? groupIndex + 1 : pinCycle;

      return {
        key: `${entry.id}-${group.cluster}`,
        title: `${combined ? `${earnedLabel} · ` : ""}Cycle ${cycle} · ${group.cluster}`,
        earnedLabel,
        group,
      };
    });
  });

  const pinChips = PIN_ORDER.flatMap((pin) => {
    const entries = summary.entries.filter((e) => e.pin === pin);

    if (!entries.length) return [];

    const count =
      pin === "RMPro Elite"
        ? entries[0].earnedSales.filter((g) => g.sales.length > 0).length
        : entries.length;

    return [
      {
        pin,
        label: `${pin} · ${count}${pin === "RMPro Elite" ? "x" : ""} cycle${count !== 1 ? "s" : ""}`,
      },
    ];
  });

  return (
    <Box sx={{ p: 2, bgcolor: "#fafafa" }}>
      <Card
        variant="outlined"
        sx={{ p: 2, width: "fit-content", maxWidth: "100%" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          sx={{ mb: 1 }}
        >
          {pinChips.map(({ pin, label }) => (
            <Chip
              key={pin}
              size="small"
              variant="outlined"
              icon={<Verified />}
              label={label}
              sx={{
                color: PIN_COLORS[pin].main,
                borderColor: PIN_COLORS[pin].main,
                "& .MuiChip-icon": { color: PIN_COLORS[pin].main },
              }}
            />
          ))}
          <Typography variant="caption" color="text.secondary">
            A cycle is Rent Manager → Rent PH → RMPro, then it restarts. Only
            the sales that counted toward each pin are listed.
          </Typography>
        </Stack>

        {!sections.length ? (
          <Typography variant="body2" color="text.secondary">
            No qualifying sales found for this pin.
          </Typography>
        ) : (
          <Table size="small" sx={{ width: "auto" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={cellSx}>Remittance Date</TableCell>
                <TableCell sx={cellSx}>Client</TableCell>
                <TableCell sx={cellSx} align="right">
                  Remittance
                </TableCell>
                <TableCell sx={cellSx} align="right">
                  Running Total
                </TableCell>
                <TableCell sx={cellSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sections.map(({ key, title, earnedLabel, group }) => {
                const earnedDate =
                  group.sales[group.sales.length - 1].remittanceDate;
                const counted = Math.min(
                  group.sales.reduce((sum, s) => sum + s.remittance, 0) -
                    group.carriedIn,
                  group.threshold,
                );
                let running = -group.carriedIn;

                return [
                  <TableRow key={`${key}-header`}>
                    <TableCell
                      colSpan={5}
                      sx={{
                        ...cellSx,
                        bgcolor: PIN_COLORS[earnedLabel].bg,
                        borderLeft: `4px solid ${PIN_COLORS[earnedLabel].main}`,
                        fontWeight: 700,
                        whiteSpace: "normal",
                      }}
                    >
                      <Stack>
                        <span>
                          {title} · earned {formatDatePH(earnedDate)}
                        </span>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatPHP(counted)} of {formatPHP(group.threshold)}
                          {group.carriedIn > 0 &&
                            ` · ${formatPHP(group.carriedIn)} of the first sale was used by the previous pin`}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>,
                  ...group.sales.map((sale, i) => {
                    running += sale.remittance;
                    const earnedHere = i === group.sales.length - 1;

                    return (
                      <TableRow key={`${key}-${sale.id}`}>
                        <TableCell
                          sx={{ ...cellSx, fontWeight: earnedHere ? 700 : 400 }}
                        >
                          {sale.remittanceDate}
                        </TableCell>
                        <TableCell sx={cellSx}>{sale.client || "—"}</TableCell>
                        <TableCell sx={cellSx} align="right">
                          {formatPHP(sale.remittance)}
                        </TableCell>
                        <TableCell sx={cellSx} align="right">
                          {formatPHP(Math.min(running, group.threshold))}
                        </TableCell>
                        <TableCell sx={cellSx} align="right">
                          {earnedHere && (
                            <Chip
                              size="small"
                              label={`${earnedLabel} earned`}
                              sx={{
                                bgcolor: PIN_COLORS[earnedLabel].main,
                                color: "#fff",
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }),
                ];
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}
