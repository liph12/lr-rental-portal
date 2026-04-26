import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Article,
  CalendarMonth,
  CameraAlt,
  Close,
  Email,
  Groups,
  LocationOn,
  Person,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getStoredUserData } from "../../helpers";

// --- Types ---
interface RentManager {
  name: string;
  type: string;
  certifiedAt: string;
}

interface Secretary {
  name: string;
  email: string;
}

interface OfficeSecretary {
  id: number;
  rental_report_id: number;
  office_photos: string[];
  secretarial_documents: string[];
  secretaries: Secretary[];
  address: string;
}

interface Activity {
  id: number;
  rental_report_id: number;
  month: string;
  date: string;
  title: string;
  description: string;
  documents: string[];
}

interface SocialMediaActivity {
  id: number;
  rental_report_id: number;
  month: string;
  date: string;
  documents: string[];
}

interface SubmissionData {
  id: number;
  agent: {
    id: number;
    name: string;
    email: string;
    team: { id: number; teamname: string; status: string };
    role: { id: number; role: string };
  };
  rent_managers: RentManager[];
  rent_ph_account: string;
  clustered_months: string;
  status: string;
  office_secretary: OfficeSecretary;
  participated_activities: Activity[];
  social_media_activities: SocialMediaActivity[];
}

// --- Helpers ---
const MONTHS = ["January", "February", "March"];

const statusColor = (
  status: string,
): "warning" | "success" | "error" | "default" => {
  if (status === "pending") return "warning";
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "default";
};

// --- Lightbox ---
function Lightbox({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!src}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ backdrop: { sx: { backdropFilter: "blur(4px)" } } }}
    >
      <DialogContent sx={{ p: 0, position: "relative", bgcolor: "black" }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
        {src && (
          <Box
            component="img"
            src={src}
            alt="Preview"
            sx={{
              width: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Photo Strip ---
function PhotoStrip({ urls, size = 56 }: { urls: string[]; size?: number }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!urls.length) return null;

  return (
    <>
      <Stack direction="row" flexWrap="wrap" gap={0.75} mt={0.5}>
        {urls.map((url, i) => (
          <Box
            key={i}
            component="img"
            src={url}
            alt={`photo-${i}`}
            onClick={() => setLightboxSrc(url)}
            sx={{
              width: size,
              height: size,
              objectFit: "cover",
              borderRadius: 1,
              border: "2px solid",
              borderColor: "divider",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "primary.main",
                transform: "scale(1.06)",
                boxShadow: 3,
              },
            }}
          />
        ))}
      </Stack>
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}

// --- Sub-components ---
function SectionHeader({
  title,
  color,
}: {
  title: string;
  color: "primary" | "warning";
}) {
  return (
    <Typography
      variant="overline"
      fontWeight={700}
      color={`${color}.main`}
      letterSpacing={1.5}
      gutterBottom
    >
      {title}
    </Typography>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box color="text.secondary" display="flex">
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function ActivitiesByMonth({ activities }: { activities: Activity[] }) {
  return (
    <Stack spacing={2}>
      {MONTHS.map((month) => {
        const items = activities.filter((a) => a.month === month);
        if (!items.length) return null;
        return (
          <Box key={month}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="primary.main"
              textTransform="uppercase"
            >
              {month}
            </Typography>
            <Stack spacing={1} mt={0.5}>
              {items.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{ borderColor: "primary.light" }}
                >
                  <CardContent
                    sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box flex={1} mr={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                        <PhotoStrip urls={item.documents} size={52} />
                      </Box>
                      <Stack
                        direction="column"
                        spacing={0.5}
                        alignItems="flex-end"
                      >
                        <Chip
                          icon={<CalendarMonth sx={{ fontSize: 14 }} />}
                          label={item.date}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Article sx={{ fontSize: 14 }} />}
                          label={`${item.documents.length} doc${item.documents.length !== 1 ? "s" : ""}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function SocialByMonth({ activities }: { activities: SocialMediaActivity[] }) {
  return (
    <Stack spacing={2}>
      {MONTHS.map((month) => {
        const items = activities.filter((a) => a.month === month);
        if (!items.length) return null;
        return (
          <Box key={month}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="warning.main"
              textTransform="uppercase"
            >
              {month}
            </Typography>
            <Stack spacing={1} mt={0.5}>
              {items.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{ borderColor: "warning.light" }}
                >
                  <CardContent
                    sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box flex={1} mr={1}>
                        <PhotoStrip urls={item.documents} size={52} />
                      </Box>
                      <Chip
                        icon={<CameraAlt sx={{ fontSize: 14 }} />}
                        label={`${item.date} · ${item.documents.length} file${item.documents.length !== 1 ? "s" : ""}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

// --- Main Component ---
export default function Submission() {
  const userData = getStoredUserData();
  const { sub_id } = useParams<{ sub_id: string }>();
  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sub_id) return;

    const fetchSubmissionAsync = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.leuteriorealty.com/lr/v2/public/api/rental-reports/${sub_id}`,
          {
            headers: {
              Authorization: `Bearer ${userData.auth_token}`,
            },
          },
        );
        setData(response.data.data);
      } catch {
        setError("Failed to load submission data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionAsync();
  }, [sub_id]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error ?? "No data found."}</Typography>
      </Box>
    );
  }

  const {
    agent,
    rent_managers,
    office_secretary,
    participated_activities,
    social_media_activities,
  } = data;

  return (
    <Box maxWidth={960} mx="auto" p={3} mb={10}>
      {/* Header */}
      <Card sx={{ mb: 3, bgcolor: "primary.main", color: "white" }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Rental Submission Report
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Period: {data.clustered_months} &nbsp;|&nbsp; ID: #{data.id}
              </Typography>
            </Box>
            <Chip
              label={data.status.toUpperCase()}
              color={statusColor(data.status)}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Agent Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <SectionHeader title="Agent Information" color="primary" />
              <Stack spacing={1} mt={1}>
                <InfoRow
                  icon={<Person fontSize="small" />}
                  label={agent.name}
                />
                <InfoRow
                  icon={<Email fontSize="small" />}
                  label={agent.email}
                />
                <InfoRow
                  icon={<Groups fontSize="small" />}
                  label={`${agent.team.teamname} · ${agent.team.status}`}
                />
                <Chip
                  label={agent.role.role}
                  color="primary"
                  size="small"
                  sx={{ width: "fit-content" }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Office Secretary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{ height: "100%", borderColor: "warning.light" }}
          >
            <CardContent>
              <SectionHeader title="Office Secretary" color="warning" />
              <Stack spacing={1} mt={1}>
                {office_secretary.secretaries.map((s) => (
                  <Box key={s.email}>
                    <InfoRow
                      icon={<Person fontSize="small" />}
                      label={s.name}
                    />
                    <InfoRow
                      icon={<Email fontSize="small" />}
                      label={s.email}
                    />
                  </Box>
                ))}
                <InfoRow
                  icon={<LocationOn fontSize="small" />}
                  label={office_secretary.address}
                />
                <Divider sx={{ borderColor: "warning.light" }} />
                <Typography
                  variant="caption"
                  color="warning.main"
                  fontWeight={700}
                >
                  OFFICE PHOTOS
                </Typography>
                <PhotoStrip urls={office_secretary.office_photos} />
                <Typography
                  variant="caption"
                  color="warning.main"
                  fontWeight={700}
                >
                  SECRETARIAL DOCUMENTS
                </Typography>
                <PhotoStrip urls={office_secretary.secretarial_documents} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Rent Managers */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <SectionHeader title="Rent Managers" color="primary" />
              <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                {rent_managers.map((rm, i) => (
                  <Chip
                    key={i}
                    label={`${rm.name} · ${rm.type} · Certified: ${rm.certifiedAt}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Rent PH Account:{" "}
                  <a
                    href={data.rent_ph_account}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {data.rent_ph_account}
                  </a>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Participated Activities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <SectionHeader title="Participated Activities" color="primary" />
              <Divider sx={{ my: 1 }} />
              <ActivitiesByMonth activities={participated_activities} />
            </CardContent>
          </Card>
        </Grid>

        {/* Social Media Activities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{ height: "100%", borderColor: "warning.light" }}
          >
            <CardContent>
              <SectionHeader title="Social Media Activities" color="warning" />
              <Divider sx={{ my: 1, borderColor: "warning.light" }} />
              <SocialByMonth activities={social_media_activities} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
