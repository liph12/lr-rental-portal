import { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { getStoredUserData } from "../helpers";

export interface CommSlip {
  id: number;
  label: string;
  // Raw record from the API, for fields the dropdown doesn't show
  raw: Record<string, unknown>;
}

const pick = (item: Record<string, any>, keys: string[]) =>
  keys.map((k) => item[k]).find((v) => v !== undefined && v !== null && v !== "");

// The response shape isn't confirmed yet, so the label is built from the
// common field names; adjust here once the real payload is known.
const toCommSlip = (item: Record<string, any>): CommSlip => {
  const client = pick(item, ["client", "client_name", "clientName", "name"]);
  const amount = pick(item, ["amount", "commission", "total"]);
  const date = pick(item, ["date", "created_at", "remittance_date"]);

  return {
    id: item.id,
    label:
      [
        `#${item.id}`,
        client,
        amount !== undefined ? `₱${Number(amount).toLocaleString()}` : null,
        date ? String(date).slice(0, 10) : null,
      ]
        .filter(Boolean)
        .join(" · ") || `#${item.id}`,
    raw: item,
  };
};

export default function CommSlipSelect({
  value,
  onChange,
}: {
  value: CommSlip | null;
  onChange: (slip: CommSlip | null) => void;
}) {
  const [slips, setSlips] = useState<CommSlip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const response = await axios.get(
          "https://api.leuteriorealty.com/lr/v2/public/api/rm-rental-comm-slips",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getStoredUserData().auth_token}`,
            },
          },
        );
        const data = response.data?.data ?? response.data;

        setSlips(Array.isArray(data) ? data.map(toCommSlip) : []);
      } catch {
        // to do
      } finally {
        setLoading(false);
      }
    };

    fetchSlips();
  }, []);

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={slips}
      value={value}
      loading={loading}
      onChange={(_, slip) => onChange(slip)}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Commission slip"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
