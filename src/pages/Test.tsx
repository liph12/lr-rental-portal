'use client';

import { useState, useRef, useCallback } from 'react';
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
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

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

interface FileUpload {
  file: File;
  preview?: string;
  analysis?: string;
  analyzing?: boolean;
  error?: string;
}

interface FormData {
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

// Styled components
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

async function analyzeImage(base64: string, mediaType: string): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: 'Describe this image briefly in 1-2 sentences, focusing on what type of document or photo it is and any key details relevant to a rental business monthly report.',
            },
          ],
        },
      ],
    }),
  });
  const d = await r.json();
  return (d.content || []).map((b: { text?: string }) => b.text || '').join('');
}

interface FileUploadFieldProps {
  label: string;
  hint?: string;
  files: FileUpload[];
  onChange: (f: FileUpload[]) => void;
  multiple?: boolean;
}

function FileUploadField({
  label,
  hint,
  files,
  onChange,
  multiple = true,
}: FileUploadFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFiles = useCallback(
    (updater: (prev: FileUpload[]) => FileUpload[]) => {
      const updated = updater(files);
      onChange(updated);
    },
    [files, onChange],
  );

  const process = useCallback(
    async (incoming: File[]) => {
      const items: FileUpload[] = incoming.map((f) => ({
        file: f,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        analyzing: f.type.startsWith('image/'),
      }));
      onChange([...files, ...items]);
      for (const item of items) {
        if (!item.file.type.startsWith('image/')) continue;
        const reader = new FileReader();
        reader.onload = async (e) => {
          const b64 = (e.target?.result as string).split(',')[1];
          try {
            const analysis = await analyzeImage(b64, item.file.type);
            updateFiles((prev) =>
              prev.map((f) =>
                f.file === item.file ? { ...f, analysis, analyzing: false } : f,
              ),
            );
          } catch {
            updateFiles((prev) =>
              prev.map((f) =>
                f.file === item.file
                  ? { ...f, error: 'Analysis failed', analyzing: false }
                  : f,
              ),
            );
          }
        };
        reader.readAsDataURL(item.file);
      }
    },
    [files, onChange, updateFiles],
  );

  return (
    <FormControl fullWidth margin="normal">
      <Typography variant="caption" component="label" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        {label}
      </Typography>
      {hint && (
        <Typography
          variant="body2"
          sx={{ color: C.textMuted, mb: 1.5, lineHeight: 1.55 }}
        >
          {hint}
        </Typography>
      )}
      <DragDropZone
        className={dragging ? 'dragging' : ''}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          process(Array.from(e.dataTransfer.files));
        }}
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
          ref={ref}
          type="file"
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={(e) =>
            e.target.files && process(Array.from(e.target.files))
          }
        />
      </DragDropZone>

      {files.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {files.map((f, i) => (
            <FileItem key={i}>
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
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: C.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {f.file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: C.textLight }}
                    >
                      {(f.file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => updateFiles((prev) => prev.filter((_, j) => j !== i))}
                  sx={{ color: '#FC8181', minWidth: 'auto' }}
                >
                  ×
                </Button>
              </Box>
              {f.analyzing && (
                <>
                  <LinearProgress sx={{ mt: 1, mb: 1 }} />
                  <Typography variant="caption" sx={{ color: C.orange }}>
                    Analyzing with Claude AI…
                  </Typography>
                </>
              )}
              {f.analysis && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    pt: 1,
                    borderTop: `1px solid ${C.border}`,
                    color: C.textMuted,
                    lineHeight: 1.55,
                  }}
                >
                  <span style={{ color: C.orange, fontWeight: 700 }}>✦ Claude: </span>
                  {f.analysis}
                </Typography>
              )}
              {f.error && (
                <Typography variant="caption" sx={{ color: '#FC8181', mt: 1, display: 'block' }}>
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
        sx={{
          color: C.textMuted,
          lineHeight: 1.6,
          pl: { xs: 0, sm: 7 },
          mt: 1,
        }}
      >
        {sub}
      </Typography>
    </Box>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
  error?: string;
}

function Field({
  label,
  hint,
  value,
  onChange,
  multiline,
  required,
  error,
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
        {label} {required && <span style={{ color: C.orange }}>*</span>}
      </Typography>
      {hint && (
        <Typography
          variant="body2"
          sx={{ color: C.textMuted, mb: 1, lineHeight: 1.55 }}
        >
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
        error={!!error}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: C.white,
            '&:hover fieldset': {
              borderColor: C.border,
            },
            '&.Mui-focused fieldset': {
              borderColor: C.orange,
              boxShadow: `0 0 0 3px rgba(255, 107, 0, 0.12)`,
            },
          },
        }}
      />
      {error && (
        <FormHelperText sx={{ mt: 0.5 }}>
          ⚠ {error}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default function RentalReportForm() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const set = (k: keyof FormData) => (v: string | FileUpload[]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      e.email = 'Enter a valid email';
    }
    if (!form.teamName.trim()) e.teamName = 'Required';
    if (!form.meetsRequirement) e.meets = 'Please select an option';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
        <Card sx={{ textAlign: 'center', p: { xs: 2, sm: 4 } }}>
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
              maxWidth: 360,
              mx: 'auto',
              mb: 2,
            }}
          >
            Thank you for completing this form. Your active response and
            participation is greatly appreciated 💙❤️
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setForm(emptyForm);
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
    );
  }

  const months: {
    id: keyof FormData;
    actId: keyof FormData;
    docsId: keyof FormData;
    socId: keyof FormData;
    label: string;
  }[] = [
    {
      id: 'jan2026Activity',
      actId: 'jan2026Activity',
      docsId: 'jan2026Docs',
      socId: 'jan2026Social',
      label: 'January 2026',
    },
    {
      id: 'feb2026Activity',
      actId: 'feb2026Activity',
      docsId: 'feb2026Docs',
      socId: 'feb2026Social',
      label: 'February 2026',
    },
    {
      id: 'mar2026Activity',
      actId: 'mar2026Activity',
      docsId: 'mar2026Docs',
      socId: 'mar2026Social',
      label: 'March 2026',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="md" sx={{ py: { xs: 0, sm: 2 } }}>
        <Card sx={{ borderRadius: { xs: 0, sm: 2 }, overflow: 'hidden' }}>
          {/* Header */}
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
              This <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Rent.ph</strong> form
              collects, verifies and documents monthly reports from{' '}
              <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Team Leaders</strong> and{' '}
              <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Unit Managers</strong>.
              All submitted information is used for monitoring performance, tracking progress, and
              ensuring accurate record-keeping.
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
              <strong style={{ color: C.orange }}>Important Note:</strong> Kindly ensure that all
              submitted information is accurate and up to date.
            </Alert>
          </HeaderGradient>

          {/* Form Body */}
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Basic Info */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <Field
                  label="Name"
                  value={form.name}
                  onChange={set('name') as (v: string) => void}
                  required
                  error={errors.name}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <Field
                  label="Email"
                  value={form.email}
                  onChange={set('email') as (v: string) => void}
                  required
                  error={errors.email}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Field
                  label="Team Name"
                  value={form.teamName}
                  onChange={set('teamName') as (v: string) => void}
                  required
                  error={errors.teamName}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Section 01 */}
            <SectionHeader
              num="01"
              title="Maintain Active and Certified Rent Managers"
              sub="Each team must have at least (3) Certified Rent Managers or (1) RM Pro per quarter."
            />
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.meets}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5 }}>
                Do you meet the required number of Rent Managers or RM Pro?{' '}
                <span style={{ color: C.orange }}>*</span>
              </Typography>
              <RadioGroup
                value={form.meetsRequirement}
                onChange={(e) => {
                  setForm((p) => ({ ...p, meetsRequirement: e.target.value }));
                  setErrors((p) => ({ ...p, meets: '' }));
                }}
                sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
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
                <FormHelperText sx={{ mt: 1 }}>
                  ⚠ {errors.meets}
                </FormHelperText>
              )}
            </FormControl>

            <Field
              label="Names of Certified Rent Managers / RM Pro with certification dates"
              value={form.certifiedManagers}
              onChange={set('certifiedManagers') as (v: string) => void}
              multiline
            />

            <Divider sx={{ my: 3 }} />

            {/* Section 02 */}
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
            />
            <Field
              label="Complete name of the assigned Secretary"
              value={form.secretaryName}
              onChange={set('secretaryName') as (v: string) => void}
            />
            <FileUploadField
              label="Employee Contact Info / Secretarial Agreement"
              hint="Upload a copy of the Secretarial Agreement or provide contact details."
              files={form.secretaryDocs}
              onChange={set('secretaryDocs') as (v: FileUpload[]) => void}
              multiple={false}
            />

            <Divider sx={{ my: 3 }} />

            {/* Section 03 */}
            <SectionHeader
              num="03"
              title="Conduct and Participate in Rent.ph Activities"
              sub="Please submit proof of your participation in Rent.ph activities. A minimum of (3) Rent.ph related activity per month is required."
            />
            {months.map((m) => (
              <SectionCard key={m.label}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: C.orange,
                      display: 'inline-block',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: C.blue,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    }}
                  >
                    {`Month of ${m.label}`}
                  </Typography>
                </Box>
                <Field
                  label="Activity"
                  hint="Please indicate the Date and the Title or Name of the event/activity."
                  value={form[m.actId] as string}
                  onChange={set(m.actId) as (v: string) => void}
                  multiline
                />
                <FileUploadField
                  label="Supporting documents"
                  hint="Upload any proof of participation (e.g., clear photos, certificates or other relevant documents)."
                  files={form[m.docsId] as FileUpload[]}
                  onChange={set(m.docsId) as (v: FileUpload[]) => void}
                />
              </SectionCard>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Section 04 */}
            <SectionHeader
              num="04"
              title="Strengthen Rent.ph & Rentph Cares Social Media Presence"
              sub="Please ensure active engagement in promoting the Rent.ph social media platforms. A minimum of 5 social media activities per month is required."
            />
            {months.map((m) => (
              <SectionCard key={`social-${m.label}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: C.orange,
                      display: 'inline-block',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: C.blue,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    }}
                  >
                    {`Month of ${m.label}`}
                  </Typography>
                </Box>
                <FileUploadField
                  label="Social media screenshots"
                  hint="Kindly upload a screenshot or relevant proof to verify each social media activity. Please indicate the Date of posting."
                  files={form[m.socId] as FileUpload[]}
                  onChange={set(m.socId) as (v: FileUpload[]) => void}
                />
              </SectionCard>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Section 05 */}
            <SectionHeader
              num="05"
              title="Active Rent.ph Account"
              sub="Please provide the direct link to your active Rent.ph account for verification purposes."
            />
            <Field
              label="Rent.ph account link"
              value={form.rentphAccount}
              onChange={set('rentphAccount') as (v: string) => void}
            />

            {/* Submit Button */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mt: 4,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Button
                variant="contained"
                fullWidth={isMobile}
                onClick={() => {
                  if (validate()) {
                    setSubmitted(true);
                  }
                }}
                sx={{
                  backgroundColor: C.orange,
                  color: '#fff',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': { backgroundColor: C.orangeDark },
                }}
              >
                Submit Report
              </Button>
              <Button
                variant="outlined"
                fullWidth={isMobile}
                onClick={() => {
                  setForm(emptyForm);
                  setErrors({});
                }}
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
    </Box>
  );
}
