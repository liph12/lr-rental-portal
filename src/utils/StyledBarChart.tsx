import { Box, Typography, Tooltip } from "@mui/material";

interface BarChartProps {
  value: string;
  label: string;
  percentage: number;
}

export const HorizontalChartBar = ({
  value,
  label,
  percentage,
}: BarChartProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%",
        mb: 2,
        cursor: "pointer",
      }}
    >
      <Typography sx={{ width: 140, flexShrink: 0 }} variant="body2">
        {label}
      </Typography>
      <Tooltip title={`${value.toLocaleString()}`} arrow placement="top">
        <Box
          sx={{
            flexGrow: 1,
            height: 20,
            backgroundColor: "grey.100",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${percentage}%`,
              backgroundColor: "rgba(78, 153, 233, 0.58)",
              border: "1px solid rgb(56, 116, 193)",
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Tooltip>

      {/* <Typography sx={{ width: 40, textAlign: "right" }}>
        {percentage}%
      </Typography> */}
    </Box>
  );
};

export const VerticalChartBar = () => <Box />;
