import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import {
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
} from "@mui/icons-material";
import type { DateRange } from "../types";

interface Preset {
  label: string;
  range: DateRange;
}

interface Draft {
  from: string;
  to: string | null;
}

const ALL_TIME_START = "2025-01-01";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const RANGE_BG = "rgba(181, 214, 249, 0.58)";

const pad = (n: number) => String(n).padStart(2, "0");

const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatLabel = (s: string) =>
  parseISO(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const startOfMonth = (s: string) => {
  const d = parseISO(s);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const getPresets = (): Preset[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = toISO(now);

  return [
    {
      label: "This month",
      range: { from: toISO(new Date(y, m, 1)), to: today },
    },
    {
      label: "Last month",
      range: {
        from: toISO(new Date(y, m - 1, 1)),
        to: toISO(new Date(y, m, 0)),
      },
    },
    {
      label: "This year",
      range: { from: toISO(new Date(y, 0, 1)), to: today },
    },
    {
      label: "Last 12 months",
      range: { from: toISO(new Date(y, m - 12, now.getDate() + 1)), to: today },
    },
    {
      label: "Last year",
      range: {
        from: toISO(new Date(y - 1, 0, 1)),
        to: toISO(new Date(y - 1, 11, 31)),
      },
    },
    { label: "All time", range: { from: ALL_TIME_START, to: today } },
  ];
};

const sameRange = (a: DateRange, b: Draft) =>
  a.from === b.from && a.to === b.to;

export default function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<Draft>({ from: value.from, to: value.to });
  const [month, setMonth] = useState<Date>(
    startOfMonth(value.to || value.from),
  );

  const presets = getPresets();
  const activePreset = presets.find((p) => sameRange(p.range, value));

  const open = (e: React.MouseEvent<HTMLElement>) => {
    setDraft({ from: value.from, to: value.to });
    setMonth(startOfMonth(value.to || value.from));
    setAnchorEl(e.currentTarget);
  };

  const close = () => setAnchorEl(null);

  const apply = () => {
    if (draft.to) {
      onChange({ from: draft.from, to: draft.to });
    }
    close();
  };

  const pickPreset = (range: DateRange) => {
    setDraft({ from: range.from, to: range.to });
    setMonth(startOfMonth(range.to));
  };

  const pickDay = (iso: string) => {
    if (draft.to !== null) {
      setDraft({ from: iso, to: null });
    } else if (iso < draft.from) {
      setDraft({ from: iso, to: draft.from });
    } else {
      setDraft({ from: draft.from, to: iso });
    }
  };

  const shiftMonth = (by: number) =>
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + by, 1));

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toISO(new Date(year, monthIndex, i + 1)),
    ),
  ];

  const rangeEnd = draft.to ?? draft.from;

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        onClick={open}
        startIcon={<CalendarMonth fontSize="small" />}
        endIcon={<ExpandMore fontSize="small" />}
        sx={{
          justifyContent: "space-between",
          textTransform: "none",
          borderRadius: 0,
          borderColor: "divider",
          color: "text.primary",
          px: 1.5,
          py: 0.75,
        }}
      >
        <Box sx={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
            {activePreset?.label ?? "Custom range"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", lineHeight: 1.3 }}
          >
            {formatLabel(value.from)} – {formatLabel(value.to)}
          </Typography>
        </Box>
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: { sx: { mt: 1, borderRadius: 3, maxWidth: "95vw" } },
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }}>
          <Stack
            sx={{
              p: 1,
              minWidth: 190,
              borderRight: { sm: "1px solid" },
              borderBottom: { xs: "1px solid", sm: "none" },
              borderColor: "divider",
            }}
          >
            {presets.map((p) => (
              <Button
                key={p.label}
                onClick={() => pickPreset(p.range)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  py: 1.25,
                  color: "text.primary",
                  bgcolor: sameRange(p.range, draft)
                    ? "action.selected"
                    : "transparent",
                }}
              >
                {p.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ p: 3, width: { sm: 360 } }}>
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              {formatLabel(draft.from)}
              {" – "}
              {draft.to ? formatLabel(draft.to) : "…"}
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight={500}>
                {month.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              <Box>
                <IconButton size="small" onClick={() => shiftMonth(-1)}>
                  <ChevronLeft />
                </IconButton>
                <IconButton size="small" onClick={() => shiftMonth(1)}>
                  <ChevronRight />
                </IconButton>
              </Box>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "2px",
              }}
            >
              {WEEKDAYS.map((d, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  {d}
                </Typography>
              ))}
              {cells.map((iso, i) => {
                if (!iso) return <Box key={`blank-${i}`} />;

                const isEdge = iso === draft.from || iso === rangeEnd;
                const inRange = iso >= draft.from && iso <= rangeEnd;

                return (
                  <Box
                    key={iso}
                    component="button"
                    type="button"
                    onClick={() => pickDay(iso)}
                    sx={{
                      aspectRatio: "1",
                      border: "none",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: 14,
                      borderRadius: isEdge ? "50%" : 0,
                      bgcolor: isEdge
                        ? "primary.main"
                        : inRange
                          ? RANGE_BG
                          : "transparent",
                      color: isEdge ? "#fff" : "text.primary",
                      ":hover": {
                        bgcolor: isEdge ? "primary.dark" : "action.hover",
                      },
                    }}
                  >
                    {Number(iso.slice(8))}
                  </Box>
                );
              })}
            </Box>

            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={1}
              sx={{ mt: 3 }}
            >
              <Button
                onClick={close}
                color="inherit"
                sx={{ textTransform: "none", color: "text.secondary" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                disabled={!draft.to}
                onClick={apply}
                sx={{ textTransform: "none", borderRadius: 8, px: 4 }}
              >
                Apply
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
