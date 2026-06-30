import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSharedResume } from '../../api/candidates';
import ShareButtons from '../../components/ui/ShareButtons';

// Color tokens for the printable resume sheet — local to this component so the
// look stays stable even when the surrounding app theme changes.
const ACCENT = '#e85d3a';
const INK    = '#111';
const SUB    = '#5b5b5b';
const BORDER = '#111';

// SQL "0000-00-00", empty strings, and the literal word "null" are treated as
// missing so we don't render "0000-00-00 — 0000-00-00".
function cleanDate(v) {
  if (!v) return '';
  const s = String(v).trim().toLowerCase();
  if (s === '' || s === '0000-00-00' || s === 'null' || s === '0') return '';
  return String(v).trim();
}

// "November 2019 - current" style range. Drops missing parts gracefully.
function formatDateRange(start, end) {
  const s = cleanDate(start);
  const e = cleanDate(end);
  if (!s && !e) return '';
  if (!s) return `until ${e}`;
  if (!e) return `${s} - current`;
  return `${s} - ${e}`;
}

// Split a freeform description into bullets. Honors hard newlines but also
// breaks on " • " / " - " style separators commonly used in resumes.
function descriptionLines(desc) {
  if (!desc) return [];
  return desc
    .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/) // newlines OR sentence boundaries
    .map((s) => s.replace(/^[\s•●▪◦\-\*→➤►]+/, '').trim())
    .filter(Boolean);
}

export default function SharedResume() {
  const { token } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-resume', token],
    queryFn: () => getSharedResume(token),
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#888' }}>
        Loading resume…
      </div>
    );
  }

  if (isError || !data?.candidate) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#222', marginBottom: 6 }}>Link expired</h1>
          <p style={{ fontSize: 13, color: '#888' }}>This resume link has expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const c = data.candidate;
  const tenantName = data.tenant?.name || '';
  const shareUrl = window.location.href;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3', padding: '24px 16px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <Resume c={c} tenantName={tenantName} />

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
          <ShareButtons
            whatsappText={`Check out ${c.full_name}'s profile: ${shareUrl}`}
            emailSubject={`Candidate Profile - ${c.full_name}`}
            emailBody={`Hi,\n\nHere is a candidate profile:\n\n${c.full_name}\n${shareUrl}`}
            copyUrl={shareUrl}
          />
        </div>
      </div>
    </div>
  );
}

function Resume({ c, tenantName }) {
  const experience     = (c.experience || []).filter((e) => e.designation || e.company_name || e.description);
  const education      = (c.education || []).filter((e) => e.degree || e.institution);
  const skills         = (c.skills || []).filter((s) => s.skill_name);
  const certifications = (c.certifications || []).filter((cert) => cert.certification_name);

  return (
    <article
      style={{
        position: 'relative',
        background: '#fff',
        border: `2px solid ${BORDER}`,
        color: INK,
        fontFamily:
          '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
        fontSize: 13,
        lineHeight: 1.45,
        overflow: 'hidden',
      }}
    >
      {tenantName && <Watermark text={tenantName} />}

      {/* Content wrapper — `position: relative` + zIndex 1 keeps all the text
          above the watermark layer. */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <Header c={c} />

      {/* Two-column body */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.7fr 1fr',
          gap: 28,
          padding: '20px 28px 32px',
        }}
      >
        {/* === Left column === */}
        <div>
          {c.summary && (
            <Section title="Summary">
              <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{c.summary}</p>
            </Section>
          )}

          {experience.length > 0 && (
            <Section title="Work Experience">
              {experience.map((exp, i) => (
                <ExperienceEntry key={i} exp={exp} last={i === experience.length - 1} />
              ))}
            </Section>
          )}
        </div>

        {/* === Right column === */}
        <div>
          {education.length > 0 && (
            <Section title="Education">
              {education.map((edu, i) => (
                <EducationEntry key={i} edu={edu} last={i === education.length - 1} />
              ))}
            </Section>
          )}

          {skills.length > 0 && (
            <Section title="Skills">
              <BulletList items={skills.map((s) => s.skill_name)} />
            </Section>
          )}

          {certifications.length > 0 && (
            <Section title="Licenses & Certifications">
              <BulletList
                items={certifications.map((cert) =>
                  cert.issuing_org
                    ? `${cert.certification_name} — ${cert.issuing_org}`
                    : cert.certification_name
                )}
              />
            </Section>
          )}
        </div>
      </div>
      </div>
    </article>
  );
}

function Header({ c }) {
  return (
    <header style={{ padding: '24px 28px 18px' }}>
      <h1
        style={{
          margin: 0,
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: INK,
          lineHeight: 1,
        }}
      >
        {c.full_name || 'Unnamed candidate'}
      </h1>
      {c.current_title && (
        <div
          style={{
            color: ACCENT,
            fontWeight: 700,
            fontSize: 18,
            marginTop: 8,
          }}
        >
          {c.current_title}
        </div>
      )}

      {/* Contact rows — two rows of three slots like the reference. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          rowGap: 6,
          columnGap: 18,
          marginTop: 14,
          fontSize: 13,
          color: INK,
        }}
      >
        {c.email && (
          <Contact icon={<MailIcon />}>
            <a href={`mailto:${c.email}`} style={linkStyle}>{c.email}</a>
          </Contact>
        )}
        {c.phone && <Contact icon={<PhoneIcon />}>{c.phone}</Contact>}
        {c.location && <Contact icon={<PinIcon />}>{c.location}</Contact>}
        {c.linkedin_url && (
          <Contact icon={<LinkedInIcon />}>
            <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              LinkedIn
            </a>
          </Contact>
        )}
        {c.portfolio_url && (
          <Contact icon={<LinkIcon />}>
            <a href={c.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              Portfolio
            </a>
          </Contact>
        )}
      </div>
    </header>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: INK,
          borderBottom: `2px solid ${INK}`,
          paddingBottom: 4,
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExperienceEntry({ exp, last }) {
  const lines = descriptionLines(exp.description);
  const dateRange = formatDateRange(exp.start_date, exp.end_date);

  return (
    <div style={{ marginBottom: last ? 0 : 16 }}>
      {exp.designation && (
        <div style={{ fontSize: 15, fontWeight: 600, color: INK }}>{exp.designation}</div>
      )}
      {exp.company_name && (
        <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 2 }}>
          {exp.company_name}
        </div>
      )}

      {(dateRange || exp.location) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            color: SUB,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {dateRange && (
            <span style={inlineMeta}><CalIcon /> {dateRange}</span>
          )}
          {exp.location && (
            <span style={inlineMeta}><PinIcon /> {exp.location}</span>
          )}
        </div>
      )}

      {lines.length > 0 && (
        <ul style={bulletListStyle}>
          {lines.map((line, i) => (
            <li key={i} style={bulletItemStyle}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationEntry({ edu, last }) {
  const year =
    edu.year_of_completion && String(edu.year_of_completion) !== '0000'
      ? String(edu.year_of_completion)
      : '';

  return (
    <div style={{ marginBottom: last ? 0 : 14 }}>
      {edu.degree && (
        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{edu.degree}</div>
      )}
      {edu.institution && (
        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginTop: 2 }}>
          {edu.institution}
        </div>
      )}
      {year && (
        <div style={{ ...inlineMeta, color: SUB, fontSize: 12, marginTop: 4 }}>
          <CalIcon /> {year}
        </div>
      )}
      {edu.grade && (
        <div style={{ color: SUB, fontSize: 12, marginTop: 2 }}>Grade: {edu.grade}</div>
      )}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={bulletListStyle}>
      {items.map((item, i) => (
        <li key={i} style={bulletItemStyle}>{item}</li>
      ))}
    </ul>
  );
}

function Contact({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <span style={{ display: 'inline-flex', color: SUB, flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}

// Diagonal repeating watermark covering the sheet. Sits beneath the
// content (z-index: 0) so text stays readable, with `pointer-events: none`
// so it doesn't intercept clicks on links inside the resume.
function Watermark({ text }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(5, 1fr)',
        transform: 'rotate(-28deg)',
        transformOrigin: 'center',
      }}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0, 0, 0, 0.05)',
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

const linkStyle = { color: '#2962ff', textDecoration: 'underline' };
const inlineMeta = { display: 'inline-flex', alignItems: 'center', gap: 4 };
const bulletListStyle = { margin: '6px 0 0', paddingLeft: 18, color: INK };
const bulletItemStyle = { marginBottom: 3 };

// === Icons (inline SVG, no extra deps) =====================================

function svgProps(size = 13) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
}

function MailIcon() {
  return (
    <svg {...svgProps()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg {...svgProps()}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-1.29a2 2 0 0 1 2.11-.45c.99.35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg {...svgProps()}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg {...svgProps(12)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg {...svgProps()}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...svgProps()}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
