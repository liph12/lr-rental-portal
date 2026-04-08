import { Typography, Box } from "@mui/material";
import { LazyImage } from "../../utils/LazyImage";

interface OverViewInfoCardProps {
  title: string;
  value: number;
  subTitle: string;
  img: string;
  imgSize?: number;
  loading?: boolean;
  selected?: boolean;
}

export default function OverviewPinCard({
  title,
  value,
  subTitle,
  img,
  imgSize = 100,
  loading = true,
  selected = false,
}: OverViewInfoCardProps) {
  return (
    <Box
      sx={{
        py: 1,
        px: 2,
        mb: 2,
        bgcolor: "#fff",
        height: 120,
        position: "relative",
        borderBottom: selected
          ? "5px solid rgb(71, 116, 206)"
          : "5px solid transparent",
        cursor: "pointer",
        ":hover": {
          backgroundColor: "rgb(244, 245, 248)",
          transition: "0.2s",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <LazyImage src={img} size={imgSize} />
        </>
      </Box>
      <Box sx={{ position: "absolute", bottom: 10 }}>
        <Typography variant="h5" fontFamily="monospace">
          {loading ? "---" : value.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="primary">
          {subTitle}
        </Typography>
      </Box>
    </Box>
  );
}
