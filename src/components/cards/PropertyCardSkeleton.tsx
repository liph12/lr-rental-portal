import { Box, Divider, Skeleton } from "@mui/material";

interface PropertyCardSkeletonProps {
  height?: string;
}

export default function PropertyCardSkeleton({
  height = "16vh",
}: PropertyCardSkeletonProps) {
  return (
    <Box sx={{ py: 1, px: 2, border: "1px solid #ddd", height: height }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <>
          <Skeleton sx={{ height: 50, width: 150 }} />
          <Skeleton sx={{ height: 50, width: 50 }} />
        </>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Skeleton sx={{ height: 50, width: 100 }} />
        </Box>
        <Divider orientation="vertical" sx={{ height: 50 }} />
        <Box>
          <Skeleton sx={{ height: 50, width: 100 }} />
        </Box>
      </Box>
    </Box>
  );
}
