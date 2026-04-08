import type { PinningCluster } from "../../pages/PinningTracker/Index";
import { Box, Typography } from "@mui/material";
import { LazyImage } from "../../utils/LazyImage";
import rm from "../../assets/rentmanager.png";
import rph from "../../assets/rentph.png";
import rmpro from "../../assets/rmpro.png";

const VerticalBarProgress = ({
  progress,
  img,
}: {
  progress: number;
  img: string;
}) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <Box
      sx={{
        width: 30,
        height: 100,
        backgroundColor: "grey.100",
        display: "flex",
        alignItems: "flex-end",
        // overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: `${progress}%`,
          backgroundColor:
            progress < 100
              ? "rgba(233, 143, 78, 0.58)"
              : "rgba(78, 153, 233, 0.58)",
          border:
            progress < 100
              ? "1px solid rgb(223, 112, 33)"
              : "1px solid rgb(56, 116, 193)",
          transition: "height 0.6s ease",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      />
    </Box>
    <Typography variant="caption" color="#000" sx={{ fontSize: 10 }}>
      {progress}%
    </Typography>
    <Box
      sx={{
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // mt: 2,
      }}
    >
      <LazyImage src={img} />
    </Box>
  </Box>
);

export default function PinningTrackerBarChart({
  clusters,
  current,
  handleSelectCluster,
}: {
  clusters: PinningCluster[];
  current: string;
  handleSelectCluster: (month: string) => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {clusters.map((c, k) => {
        return (
          <Box
            key={k}
            onClick={() => handleSelectCluster(c.cluster)}
            sx={{
              cursor: "pointer",
              p: 1,
              transition: "0.3s ease",
              borderBottom:
                current === c.cluster ? "5px solid #1976d2" : "5px solid #fff",
              backgroundColor: current === c.cluster ? "#f1f1f1" : "#fff",
              "&:hover": {
                borderBottom: "5px solid rgba(38, 93, 197, 0.58)",
                backgroundColor: "#f1f1f1",
              },
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <VerticalBarProgress progress={c.rentManager} img={rm} />
              <VerticalBarProgress progress={c.rentPh} img={rph} />
              <VerticalBarProgress progress={c.rentManagerPro} img={rmpro} />
            </Box>
            <Typography
              variant="caption"
              component="div"
              textAlign="center"
              sx={{ mt: 1 }}
            >
              {c.cluster}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
