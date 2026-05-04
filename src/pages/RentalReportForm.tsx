'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const C = {
  orange: '#FF6B00',
  orangeDark: '#E55A00',
  orangeLight: '#FFF3E8',
  orangeMid: '#FFE0C2',
  blue: '#133176',
  blueMid: '#3458bd',
  blueLight: '#E8EEFF',
  text: '#1A1A2E',
  textMuted: '#5A6478',
  textLight: '#8492A6',
  border: '#E2E8F0',
  bg: '#F8F9FC',
  white: '#FFFFFF',
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface FileUpload {
  file: File;
  id: string;
  preview?: string;
  base64?: string;
  analysis?: string;
  analyzing?: boolean;
  error?: string;
}

export interface FormData {
  name: string;
  email: string;
  teamName: string;
  meetsRequirement: string;
  certifiedManagers: string;
  officePhotos: FileUpload[];
  officeAddress: string;
  secretaryName: string;
  secretaryDocs: FileUpload[];
  jan2026Activity: string;
  jan2026Docs: FileUpload[];
  feb2026Activity: string;
  feb2026Docs: FileUpload[];
  mar2026Activity: string;
  mar2026Docs: FileUpload[];
  jan2026Social: FileUpload[];
  feb2026Social: FileUpload[];
  mar2026Social: FileUpload[];
  rentphAccount: string;
}

const emptyForm: FormData = {
  name: '',
  email: '',
  teamName: '',
  meetsRequirement: '',
  certifiedManagers: '',
  officePhotos: [],
  officeAddress: '',
  secretaryName: '',
  secretaryDocs: [],
  jan2026Activity: '',
  jan2026Docs: [],
  feb2026Activity: '',
  feb2026Docs: [],
  mar2026Activity: '',
  mar2026Docs: [],
  jan2026Social: [],
  feb2026Social: [],
  mar2026Social: [],
  rentphAccount: '',
};

// ─────────────────────────────────────────────
// Styled components
// ─────────────────────────────────────────────
const DragDropZone = styled(Paper)(({ theme }) => ({
  border: `1.5px dashed ${C.border}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  transition: 'all 0.15s',
  '&:hover, &.dragging': {
    borderColor: C.orange,
    backgroundColor: C.orangeLight,
  },
}));

const FileItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  marginTop: theme.spacing(1),
  backgroundColor: C.bg,
  border: `1px solid ${C.border}`,
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  backgroundColor: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.25, 1.5),
  marginBottom: theme.spacing(1.25),
}));

const HeaderGradient = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueMid} 60%, #1E4DB7 100%)`,
  borderRadius: '16px 16px 0 0',
  padding: theme.spacing(2.5, 3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    right: -40,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    pointerEvents: 'none',
  },
}));


async function submitReport(payload: object) {
  const response = await axios.post('', payload, {
    headers: {
      "Content-Type" : "application/json"
    }
  });

  console.log(response.data)
}

// ─────────────────────────────────────────────
// FileUploadField component
// ─────────────────────────────────────────────
interface FileUploadFieldProps {
  label: string;
  hint?: string;
  files: FileUpload[];
  onChange: (files: FileUpload[]) => void;
  multiple?: boolean;
}

function FileUploadField({
  label,
  hint,
  files,
  onChange,
  multiple = true,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFiles = useCallback(
    (updater: (prev: FileUpload[]) => FileUpload[]) => {
      onChange(updater(files));
    },
    [files, onChange]
  );

  const processFiles = useCallback(
    async (incoming: File[]) => {
      const newEntries: FileUpload[] = incoming.map((f) => ({
        file: f,
        id: Math.random().toString(36).slice(2),
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        analyzing: f.type.startsWith('image/'),
      }));

      onChange([...files, ...newEntries]);

      // for (const entry of newEntries) {
      //   // Read base64
      //   let b64 = '';
      //   try {
      //     const dataUrl = await toBase64(entry.file);
      //     b64 = dataUrl.split(',')[1];
      //     updateFiles((prev) =>
      //       prev.map((f) => (f.id === entry.id ? { ...f, base64: b64 } : f))
      //     );
      //   } catch {
      //     // ignore read errors
      //   }

      //   // AI image analysis
      //   if (entry.file.type.startsWith('image/') && b64) {
      //     try {
      //       const analysis = await analyzeImage(b64, entry.file.type);
      //       updateFiles((prev) =>
      //         prev.map((f) =>
      //           f.id === entry.id ? { ...f, analysis, analyzing: false } : f
      //         )
      //       );
      //     } catch {
      //       updateFiles((prev) =>
      //         prev.map((f) =>
      //           f.id === entry.id
      //             ? { ...f, error: 'AI analysis failed', analyzing: false }
      //             : f
      //         )
      //       );
      //     }
      //   }
      // }
    },
    [files, onChange, updateFiles]
  );

  return (
    <FormControl fullWidth margin="normal">
      <Typography
        variant="caption"
        component="label"
        sx={{ fontWeight: 600, mb: 1, display: 'block', color: C.text }}
      >
        {label}
      </Typography>

      {hint && (
        <Typography variant="body2" sx={{ color: C.textMuted, mb: 1.5, lineHeight: 1.55 }}>
          {hint}
        </Typography>
      )}

      <DragDropZone
        className={dragging ? 'dragging' : ''}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFiles(Array.from(e.dataTransfer.files));
        }}
        elevation={0}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            backgroundColor: C.orangeLight,
            border: `1px solid ${C.orangeMid}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '0.875rem',
          }}
        >
          📎
        </Box>
        <Typography variant="body2" sx={{ color: C.textMuted }}>
          <strong style={{ color: C.orange }}>Click to upload</strong> or drag & drop
        </Typography>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/*,application/pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))}
        />
      </DragDropZone>

      {files.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {files.map((f) => (
            <FileItem key={f.id} elevation={0}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  {f.preview && (
                    <Box
                      component="img"
                      src={f.preview}
                      alt=""
                      sx={{
                        width: 32,
                        height: 32,
                        objectFit: 'cover',
                        borderRadius: 0.5,
                        border: `1px solid ${C.border}`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {!f.preview && (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 0.5,
                        border: `1px solid ${C.border}`,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        backgroundColor: C.bg,
                      }}
                    >
                      📄
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: C.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: C.textLight }}>
                      {(f.file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={() =>
                    updateFiles((prev) => prev.filter((item) => item.id !== f.id))
                  }
                  sx={{ color: '#FC8181', minWidth: 'auto', px: 1, flexShrink: 0 }}
                >
                  ×
                </Button>
              </Box>

              {f.error && (
                <Typography
                  variant="caption"
                  sx={{ color: '#FC8181', mt: 1, display: 'block' }}
                >
                  ⚠ {f.error}
                </Typography>
              )}
            </FileItem>
          ))}
        </Box>
      )}
    </FormControl>
  );
}

// ─────────────────────────────────────────────
// SectionHeader component
// ─────────────────────────────────────────────
interface SectionHeaderProps {
  num: string;
  title: string;
  sub: string;
}

function SectionHeader({ num, title, sub }: SectionHeaderProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
        <Chip
          label={num}
          size="small"
          sx={{
            backgroundColor: C.orange,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: C.blue,
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: C.textMuted, lineHeight: 1.6, pl: { xs: 0, sm: 7 }, mt: 1 }}
      >
        {sub}
      </Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────
// Field component
// ─────────────────────────────────────────────
interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  type?: string;
  placeholder?: string;
}

function Field({
  label,
  hint,
  value,
  onChange,
  multiline,
  required,
  error,
  type = 'text',
  placeholder,
}: FieldProps) {
  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <Typography
        component="label"
        variant="caption"
        sx={{
          fontWeight: 600,
          color: C.text,
          letterSpacing: '0.03em',
          mb: 0.5,
          display: 'block',
        }}
      >
        {label}{' '}
        {required && <span style={{ color: C.orange }}>*</span>}
      </Typography>
      {hint && (
        <Typography variant="body2" sx={{ color: C.textMuted, mb: 1, lineHeight: 1.55 }}>
          {hint}
        </Typography>
      )}
      <TextField
        fullWidth
        multiline={multiline}
        rows={multiline ? 3 : 1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
        size="small"
        type={type}
        placeholder={placeholder}
        error={!!error}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: C.white,
            '&:hover fieldset': { borderColor: C.border },
            '&.Mui-focused fieldset': {
              borderColor: C.orange,
              boxShadow: `0 0 0 3px rgba(255, 107, 0, 0.12)`,
            },
          },
        }}
      />
      {error && (
        <FormHelperText sx={{ mt: 0.5 }}>⚠ {error}</FormHelperText>
      )}
    </FormControl>
  );
}

// ─────────────────────────────────────────────
// Month row config
// ─────────────────────────────────────────────
const MONTHS: {
  label: string;
  actKey: keyof FormData;
  docsKey: keyof FormData;
  socKey: keyof FormData;
}[] = [
  {
    label: 'January 2026',
    actKey: 'jan2026Activity',
    docsKey: 'jan2026Docs',
    socKey: 'jan2026Social',
  },
  {
    label: 'February 2026',
    actKey: 'feb2026Activity',
    docsKey: 'feb2026Docs',
    socKey: 'feb2026Social',
  },
  {
    label: 'March 2026',
    actKey: 'mar2026Activity',
    docsKey: 'mar2026Docs',
    socKey: 'mar2026Social',
  },
];

// ─────────────────────────────────────────────
// Main form component
// ─────────────────────────────────────────────
export default function RentalReportForm() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiSummary, setApiSummary] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      const allFiles: FileUpload[] = [
        ...form.officePhotos,
        ...form.secretaryDocs,
        ...form.jan2026Docs,
        ...form.feb2026Docs,
        ...form.mar2026Docs,
        ...form.jan2026Social,
        ...form.feb2026Social,
        ...form.mar2026Social,
      ];
      allFiles.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set =
    <K extends keyof FormData>(key: K) =>
    (value: FormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
  };

  // ── Validation ──────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.teamName.trim()) e.teamName = 'Required';
    if (!form.meetsRequirement) e.meets = 'Please select an option';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build payload ───────────────────────────
  const buildPayload = () => ({
    submittedAt: new Date().toISOString(),
    submitter: {
      name: form.name,
      email: form.email,
      teamName: form.teamName,
    },
    section01: {
      meetsRequirement: form.meetsRequirement,
      certifiedManagers: form.certifiedManagers,
    },
    section02: {
      officePhotos: form.officePhotos.map((f) => ({
        name: f.file.name,
        type: f.file.type,
        sizeKb: +(f.file.size / 1024).toFixed(1),
        base64: f.base64 ?? null,
        aiAnalysis: f.analysis ?? null,
      })),
      officeAddress: form.officeAddress,
      secretaryName: form.secretaryName,
      secretaryDocs: form.secretaryDocs.map((f) => ({
        name: f.file.name,
        type: f.file.type,
        sizeKb: +(f.file.size / 1024).toFixed(1),
        base64: f.base64 ?? null,
      })),
    },
    section03: {
      january: {
        activity: form.jan2026Activity,
        documents: form.jan2026Docs.map((f) => ({
          name: f.file.name,
          type: f.file.type,
          sizeKb: +(f.file.size / 1024).toFixed(1),
          base64: f.base64 ?? null,
          aiAnalysis: f.analysis ?? null,
        })),
      },
      february: {
        activity: form.feb2026Activity,
        documents: form.feb2026Docs.map((f) => ({
          name: f.file.name,
          type: f.file.type,
          sizeKb: +(f.file.size / 1024).toFixed(1),
          base64: f.base64 ?? null,
          aiAnalysis: f.analysis ?? null,
        })),
      },
      march: {
        activity: form.mar2026Activity,
        documents: form.mar2026Docs.map((f) => ({
          name: f.file.name,
          type: f.file.type,
          sizeKb: +(f.file.size / 1024).toFixed(1),
          base64: f.base64 ?? null,
          aiAnalysis: f.analysis ?? null,
        })),
      },
    },
    section04: {
      january: {
        socialScreenshots: form.jan2026Social.map((f) => ({
          name: f.file.name,
          type: f.file.type,
          sizeKb: +(f.file.size / 1024).toFixed(1),
          base64: f.base64 ?? null,
          aiAnalysis: f.analysis ?? null,
        })),
      },
      february: {
        socialScreenshots: form.feb2026Social.map((f) => ({
          name: f.file.name,
          type: f.file.type,
          sizeKb: +(f.file.size / 1024).toFixed(1),
          base64: f.base64 ?? null,
          aiAnalysis: f.analysis ?? null,
        })),
      },
      march: {
        socialScreenshots: form.mar2026Social.map((f) => ({
          name: f.file.name,
          type: f.file.type,
          sizeKb: +(f.file.size / 1024).toFixed(1),
          base64: f.base64 ?? null,
          aiAnalysis: f.analysis ?? null,
        })),
      },
    },
    section05: {
      rentphAccount: form.rentphAccount,
    },
  });

  // ── Submit ──────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      await submitReport(payload);
      setApiSummary("Rental report successfully submitted!");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      showToast('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm(emptyForm);
    setErrors({});
    showToast('Form cleared');
  };

  // ─────────────────────────────────────────────
  // Success screen
  // ─────────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', overflowY: 'auto' }}>
        <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
          <Card sx={{ textAlign: 'center', p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
            <Box sx={{ fontSize: '3.5rem', mb: 1.5 }}>🏆</Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: C.blue,
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              Report Submitted!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: C.textMuted,
                lineHeight: 1.7,
                maxWidth: 380,
                mx: 'auto',
                mb: 2,
              }}
            >
              Thank you for completing this form. Your active response and participation
              is greatly appreciated 💙❤️
            </Typography>

            {apiSummary && (
              <Alert
                severity="info"
                sx={{ textAlign: 'left', mb: 2, fontSize: '0.8125rem' }}
              >
                <strong>API acknowledgement:</strong>
                <br />
                {apiSummary}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={() => {
                setForm(emptyForm);
                setApiSummary('');
                setSubmitted(false);
              }}
              sx={{
                backgroundColor: C.orange,
                color: '#fff',
                '&:hover': { backgroundColor: C.orangeDark },
              }}
            >
              Submit another response
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  // ─────────────────────────────────────────────
  // Main form
  // ─────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', overflowY: 'auto' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
        <Card sx={{ borderRadius: { xs: 0, sm: 3 }, overflow: 'hidden' }}>

          {/* ── Header ── */}
          <HeaderGradient>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                backgroundColor: 'rgba(255, 107, 0, 0.18)',
                border: '1px solid rgba(255, 107, 0, 0.35)',
                borderRadius: 100,
                px: 1.5,
                py: 0.5,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: C.orange,
                  display: 'inline-block',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#FFB37A',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.6rem', sm: '0.6875rem' },
                }}
              >
                Monthly Report Form
              </Typography>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.15,
                mb: 1,
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              Rental Report
              <br />
              <span style={{ color: C.orange }}>Requirements</span>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.68)',
                lineHeight: 1.7,
                maxWidth: 520,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              }}
            >
              This{' '}
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Rent.ph</strong> form
              collects, verifies and documents monthly reports from{' '}
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Team Leaders</strong> and{' '}
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Unit Managers</strong>.
              All submitted information is used for monitoring performance, tracking
              progress, and ensuring accurate record-keeping.
            </Typography>

            <Alert
              severity="warning"
              sx={{
                mt: 2,
                backgroundColor: 'rgba(255, 107, 0, 0.12)',
                borderColor: 'rgba(255, 107, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.75)',
                '& .MuiAlert-icon': { color: C.orange },
              }}
            >
              <strong style={{ color: C.orange }}>Important Note:</strong> Kindly ensure
              that all submitted information is accurate and up to date.
            </Alert>
          </HeaderGradient>

          {/* ── Form body ── */}
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

            {/* Basic info */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label="Name"
                  value={form.name}
                  onChange={set('name') as (v: string) => void}
                  required
                  error={errors.name}
                  placeholder="Juan dela Cruz"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label="Email"
                  value={form.email}
                  onChange={set('email') as (v: string) => void}
                  required
                  type="email"
                  error={errors.email}
                  placeholder="juan@example.com"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Field
                  label="Team Name"
                  value={form.teamName}
                  onChange={set('teamName') as (v: string) => void}
                  required
                  error={errors.teamName}
                  placeholder="e.g. Team Mabuhay"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ── Section 01 ── */}
            <SectionHeader
              num="01"
              title="Maintain Active and Certified Rent Managers"
              sub="Each team must have at least (3) Certified Rent Managers or (1) RM Pro per quarter."
            />

            <FormControl fullWidth margin="normal" error={!!errors.meets}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5 }}>
                Do you meet the required number of Rent Managers or RM Pro?{' '}
                <span style={{ color: C.orange }}>*</span>
              </Typography>
              <RadioGroup
                value={form.meetsRequirement}
                onChange={(e) => {
                  set('meetsRequirement')(e.target.value);
                  setErrors((prev) => ({ ...prev, meets: '' }));
                }}
                row
                sx={{ gap: 2 }}
              >
                {['Yes', 'No'].map((opt) => (
                  <FormControlLabel
                    key={opt}
                    value={opt}
                    control={
                      <Radio
                        sx={{
                          color: C.border,
                          '&.Mui-checked': { color: C.orange },
                        }}
                      />
                    }
                    label={opt}
                  />
                ))}
              </RadioGroup>
              {errors.meets && (
                <FormHelperText sx={{ mt: 1 }}>⚠ {errors.meets}</FormHelperText>
              )}
            </FormControl>

            <Field
              label="Names of Certified Rent Managers / RM Pro with certification dates"
              value={form.certifiedManagers}
              onChange={set('certifiedManagers') as (v: string) => void}
              multiline
              placeholder={
                'e.g. Juan dela Cruz – certified Jan 15, 2026\nMaria Santos – RM Pro, certified Feb 2, 2026'
              }
            />

            <Divider sx={{ my: 3 }} />

            {/* ── Section 02 ── */}
            <SectionHeader
              num="02"
              title="Office & Secretary Requirement"
              sub="Please provide the following details and supporting documents."
            />

            <FileUploadField
              label="Office photo"
              hint="Please upload a clear photo of your office."
              files={form.officePhotos}
              onChange={set('officePhotos') as (v: FileUpload[]) => void}
            />

            <Field
              label="Complete Office Address"
              hint="Kindly provide the complete and accurate office address."
              value={form.officeAddress}
              onChange={set('officeAddress') as (v: string) => void}
              multiline
              placeholder="Unit No., Building, Street, Barangay, City, Province"
            />

            <Field
              label="Complete name of the assigned Secretary"
              value={form.secretaryName}
              onChange={set('secretaryName') as (v: string) => void}
              placeholder="Full name of secretary"
            />

            <FileUploadField
              label="Employee Contact Info / Secretarial Agreement"
              hint="Upload a copy of the Secretarial Agreement or provide contact details."
              files={form.secretaryDocs}
              onChange={set('secretaryDocs') as (v: FileUpload[]) => void}
              multiple={false}
            />

            <Divider sx={{ my: 3 }} />

            {/* ── Section 03 ── */}
            <SectionHeader
              num="03"
              title="Conduct and Participate in Rent.ph Activities"
              sub="Please submit proof of your participation in Rent.ph activities. A minimum of (3) Rent.ph related activity per month is required."
            />

            {MONTHS.map((m) => (
              <SectionCard key={`act-${m.label}`} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: C.orange,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: C.blue, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                  >
                    Month of {m.label}
                  </Typography>
                </Box>

                <Field
                  label="Activity"
                  hint="Please indicate the Date and the Title or Name of the event/activity."
                  value={form[m.actKey] as string}
                  onChange={set(m.actKey) as (v: string) => void}
                  multiline
                />

                <FileUploadField
                  label="Supporting documents"
                  hint="Upload any proof of participation (e.g., clear photos, certificates or other relevant documents)."
                  files={form[m.docsKey] as FileUpload[]}
                  onChange={set(m.docsKey) as (v: FileUpload[]) => void}
                />
              </SectionCard>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* ── Section 04 ── */}
            <SectionHeader
              num="04"
              title="Strengthen Rent.ph & Rentph Cares Social Media Presence"
              sub="Please ensure active engagement in promoting the Rent.ph social media platforms. A minimum of 5 social media activities per month is required."
            />

            {MONTHS.map((m) => (
              <SectionCard key={`soc-${m.label}`} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: C.orange,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: C.blue, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                  >
                    Month of {m.label}
                  </Typography>
                </Box>

                <FileUploadField
                  label="Social media screenshots"
                  hint="Kindly upload a screenshot or relevant proof to verify each social media activity. Please indicate the Date of posting."
                  files={form[m.socKey] as FileUpload[]}
                  onChange={set(m.socKey) as (v: FileUpload[]) => void}
                />
              </SectionCard>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* ── Section 05 ── */}
            <SectionHeader
              num="05"
              title="Active Rent.ph Account"
              sub="Please provide the direct link to your active Rent.ph account for verification purposes."
            />

            <Field
              label="Rent.ph account link"
              value={form.rentphAccount}
              onChange={set('rentphAccount') as (v: string) => void}
              type="url"
              placeholder="https://rent.ph/profile/yourteam"
            />

            {/* ── Action buttons ── */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                mt: 4,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Button
                variant="contained"
                fullWidth={isMobile}
                disabled={submitting}
                onClick={handleSubmit}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                  ) : undefined
                }
                sx={{
                  backgroundColor: C.orange,
                  color: '#fff',
                  fontWeight: 600,
                  py: 1.5,
                  px: 4,
                  '&:hover': { backgroundColor: C.orangeDark },
                  '&:disabled': { backgroundColor: '#ccc' },
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </Button>

              <Button
                variant="outlined"
                fullWidth={isMobile}
                disabled={submitting}
                onClick={handleClear}
                sx={{
                  borderColor: C.border,
                  color: C.text,
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                Clear Form
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Toast notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2800}
        onClose={() => setToastOpen(false)}
        message={toastMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}