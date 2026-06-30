/* Mock data for the Roster dashboards, charts, and demo widgets.
 * Deterministic — uses a seeded RNG so the data is stable across reloads. */

export const TENANTS = [
  { id: "t1", name: "Northwind Talent",   plan: "Scale",      seats: 24, used: 18, status: "active", consultants: 18, clients: 47, resources: 312, mrr: 4800,  owner: "Priya Nair",    region: "EMEA", joined: "2023-04-12" },
  { id: "t2", name: "Helix Staffing Co.", plan: "Team",       seats: 10, used: 9,  status: "active", consultants: 9,  clients: 22, resources: 184, mrr: 1900,  owner: "Marcus Reid",   region: "AMER", joined: "2024-01-08" },
  { id: "t3", name: "Vector Partners",    plan: "Scale",      seats: 24, used: 21, status: "active", consultants: 21, clients: 38, resources: 256, mrr: 4800,  owner: "Lin Wei",       region: "APAC", joined: "2023-09-22" },
  { id: "t4", name: "Boreal Consulting",  plan: "Starter",    seats: 5,  used: 4,  status: "trial",  consultants: 4,  clients: 6,  resources: 41,  mrr: 0,     owner: "Eva Lindqvist", region: "EMEA", joined: "2026-04-30" },
  { id: "t5", name: "Cascade Resourcing", plan: "Enterprise", seats: 60, used: 51, status: "active", consultants: 51, clients: 84, resources: 612, mrr: 11400, owner: "Devon Carter",  region: "AMER", joined: "2022-11-03" },
  { id: "t6", name: "Meridian Source",    plan: "Team",       seats: 10, used: 6,  status: "paused", consultants: 6,  clients: 14, resources: 96,  mrr: 0,     owner: "Ahmed Faruq",   region: "EMEA", joined: "2024-07-19" },
];

export const CLIENTS = [
  { id: "c1", name: "Halberg Industries",  industry: "Manufacturing",  logoColor: 0, location: "Stuttgart, DE",  contact: "K. Reichmann",   openProjects: 3, activeAssignments: 7,  since: "2023-08", health: "good" },
  { id: "c2", name: "Lumen Health",        industry: "Healthcare",     logoColor: 1, location: "Boston, MA",     contact: "Dr. M. Okafor",  openProjects: 2, activeAssignments: 4,  since: "2024-03", health: "attention" },
  { id: "c3", name: "Cobalt Logistics",    industry: "Logistics",      logoColor: 2, location: "Rotterdam, NL",  contact: "S. van Loon",    openProjects: 4, activeAssignments: 11, since: "2022-11", health: "good" },
  { id: "c4", name: "Northwind Bank",      industry: "Financial Svcs", logoColor: 3, location: "London, UK",     contact: "J. Whitfield",   openProjects: 5, activeAssignments: 14, since: "2021-06", health: "good" },
  { id: "c5", name: "Pareto Energy",       industry: "Energy",         logoColor: 4, location: "Houston, TX",    contact: "R. Castellanos", openProjects: 1, activeAssignments: 2,  since: "2024-10", health: "risk" },
  { id: "c6", name: "Talos Robotics",      industry: "Robotics",       logoColor: 5, location: "Tokyo, JP",      contact: "Y. Tanaka",      openProjects: 2, activeAssignments: 3,  since: "2025-02", health: "good" },
  { id: "c7", name: "Verdant Ag",          industry: "AgriTech",       logoColor: 1, location: "Wageningen, NL", contact: "L. Bakker",      openProjects: 1, activeAssignments: 1,  since: "2025-08", health: "attention" },
  { id: "c8", name: "Aster Insurance",     industry: "Insurance",      logoColor: 3, location: "Zurich, CH",     contact: "F. Brunner",     openProjects: 3, activeAssignments: 6,  since: "2023-01", health: "good" },
];

export const PROJECT_STATUSES = [
  { id: "open",       label: "New",             color: "neutral" },
  { id: "resourcing", label: "Resourcing",      color: "info" },
  { id: "shared",     label: "Profiles shared", color: "accent" },
  { id: "interview",  label: "Interviewing",    color: "warn" },
  { id: "offer",      label: "Offer extended",  color: "warn" },
  { id: "filled",     label: "Filled",          color: "ok" },
  { id: "hold",       label: "On hold",         color: "neutral" },
  { id: "lost",       label: "Closed lost",     color: "danger" },
];

export const PROJECTS = [
  { id: "p1",  client: "c4", title: "Senior Kafka Platform Engineer",    roles: 2, status: "shared",     priority: "high",   rate: "£700/d",      start: "2026-06-01", duration: "9 mo",  location: "London / Hybrid",     owner: "you",          created: "2026-04-22", skills: ["Kafka","Java","AWS","Terraform","Kubernetes"], desc: "Migrate trade-capture pipelines from MQ to Kafka. Strong streaming background, regulated industry experience preferred." },
  { id: "p2",  client: "c1", title: "SAP S/4HANA FI/CO Consultant",      roles: 1, status: "resourcing", priority: "medium", rate: "€950/d",      start: "2026-07-15", duration: "12 mo", location: "Stuttgart on-site",   owner: "Anika Sharma", created: "2026-04-29", skills: ["SAP S/4HANA","FI/CO","ABAP","German B2"], desc: "Greenfield S/4HANA rollout for European subsidiaries. German language essential." },
  { id: "p3",  client: "c2", title: "FHIR Integration Lead",             roles: 1, status: "interview",  priority: "high",   rate: "$185/h",      start: "2026-05-19", duration: "6 mo",  location: "Boston / Remote-US",  owner: "you",          created: "2026-04-08", skills: ["FHIR","HL7","HIPAA","Node","TypeScript","Mirth"], desc: "Lead integration of new EHR with downstream analytics. HIPAA-trained, prior Epic exposure a plus." },
  { id: "p4",  client: "c3", title: "WMS Implementation PM (Manhattan)", roles: 1, status: "shared",     priority: "medium", rate: "€820/d",      start: "2026-06-15", duration: "8 mo",  location: "Rotterdam / Hybrid",  owner: "Tobias Klein", created: "2026-04-25", skills: ["Manhattan WMS","SCM","PMP","Dutch nice-to-have"], desc: "Phase-2 rollout across two new DCs. PMP required, prior Manhattan Active implementation needed." },
  { id: "p5",  client: "c4", title: "Quant Risk Analyst (Pricing)",      roles: 3, status: "resourcing", priority: "high",   rate: "£850/d",      start: "2026-06-08", duration: "12 mo", location: "London on-site",      owner: "you",          created: "2026-05-01", skills: ["Python","Q/KDB","FRTB","Derivatives","C++"], desc: "FRTB-IMA pricing build-out. KDB exposure required, IB or top-tier consulting background." },
  { id: "p6",  client: "c5", title: "Industrial Cybersecurity Lead",     roles: 1, status: "open",       priority: "medium", rate: "$165/h",      start: "2026-07-01", duration: "10 mo", location: "Houston / Travel",    owner: "Anika Sharma", created: "2026-05-05", skills: ["IEC 62443","OT Security","Purdue","SCADA"], desc: "Greenfield refinery cybersecurity programme. IEC 62443 cert essential." },
  { id: "p7",  client: "c1", title: "ABAP Developer × 2",                roles: 2, status: "filled",     priority: "low",    rate: "€720/d",      start: "2026-03-01", duration: "6 mo",  location: "Remote EU",           owner: "Tobias Klein", created: "2026-02-12", skills: ["ABAP","SAP","Fiori","OData"], desc: "Bench team for ongoing S/4HANA build." },
  { id: "p8",  client: "c8", title: "Actuarial Modernization Architect", roles: 1, status: "offer",      priority: "high",   rate: "CHF 1,400/d", start: "2026-05-26", duration: "12 mo", location: "Zurich / Hybrid",     owner: "you",          created: "2026-04-04", skills: ["Prophet","Python","IFRS-17","Actuarial"], desc: "Replace legacy Prophet with cloud-native model platform." },
  { id: "p9",  client: "c6", title: "ROS2 Robotics SWE",                 roles: 2, status: "resourcing", priority: "medium", rate: "¥120k/d",     start: "2026-06-22", duration: "9 mo",  location: "Tokyo on-site",       owner: "Anika Sharma", created: "2026-05-02", skills: ["ROS2","C++","Embedded","Computer Vision","Japanese N2"], desc: "Autonomous warehouse pilot. Japanese N2 required." },
  { id: "p10", client: "c3", title: "Senior Data Engineer (Snowflake)",  roles: 1, status: "shared",     priority: "medium", rate: "€780/d",      start: "2026-06-01", duration: "6 mo",  location: "Remote EU",           owner: "you",          created: "2026-04-28", skills: ["Snowflake","dbt","Airflow","Python","SQL"], desc: "Build modern data stack for new logistics business unit." },
  { id: "p11", client: "c7", title: "IoT Platform Architect",            roles: 1, status: "hold",       priority: "low",    rate: "€900/d",      start: "2026-08-01", duration: "9 mo",  location: "Wageningen / Hybrid", owner: "you",          created: "2026-04-18", skills: ["Azure IoT","MQTT","LoRaWAN","Edge"], desc: "Crop-monitoring platform pilot. On hold pending budget." },
  { id: "p12", client: "c2", title: "Clinical Trial Data Manager",       roles: 2, status: "lost",       priority: "low",    rate: "$120/h",      start: "2026-04-01", duration: "12 mo", location: "Remote US",           owner: "Tobias Klein", created: "2026-03-15", skills: ["CDISC","SDTM","SAS","Clinical"], desc: "Lost to incumbent vendor." },
];

export const ALL_SKILLS = [
  "Java","Kotlin","Python","TypeScript","JavaScript","Go","Rust","C++","C#","Scala",
  "Kafka","Spark","Flink","Snowflake","Databricks","dbt","Airflow","BigQuery",
  "AWS","GCP","Azure","Kubernetes","Terraform","Docker","Linux",
  "React","Node","Next.js","GraphQL","REST","gRPC",
  "SAP S/4HANA","ABAP","FI/CO","Fiori","OData",
  "FHIR","HL7","HIPAA","Mirth","Epic",
  "FRTB","Derivatives","Q/KDB","Murex","Calypso",
  "Manhattan WMS","SCM","PMP","Six Sigma","Prince2",
  "IEC 62443","OT Security","SCADA","Purdue",
  "Prophet","IFRS-17","SAS","Actuarial",
  "ROS2","Embedded","Computer Vision","CUDA",
  "Azure IoT","MQTT","LoRaWAN","Edge",
  "CDISC","SDTM","SQL","Tableau","PowerBI",
];

export const SENIORITIES = ["Junior", "Mid", "Senior", "Principal", "Staff"];
export const STATUSES = [
  { id: "available", label: "Available",      color: "ok" },
  { id: "soon",      label: "Available soon", color: "warn" },
  { id: "assigned",  label: "Assigned",       color: "info" },
  { id: "interview", label: "Interviewing",   color: "accent" },
  { id: "leave",     label: "On leave",       color: "neutral" },
];

const FIRST = ["Aanya","Marcus","Sofia","Yuki","Ravi","Klara","Tomas","Lena","Ahmed","Priya","Jonas","Mei","Diego","Anika","Tobias","Elias","Nadia","Omar","Fiona","Lukas","Esha","Daniela","Patryk","Sven","Hana","Kenji","Rosa","Ade","Vera","Bruno","Camille","Niko","Astrid","Rafael","Iris","Mateo","Lara","Pierre","Yumi","Aditi","Karim","Soraya","Henrik","Olivia","Felix","Sara","Daniyar","Mira","Otto"];
const LAST  = ["Patel","Kovacs","Rinaldi","Tanaka","Sharma","Lindqvist","Nowak","Hassan","Carvalho","Whitfield","Klein","Wei","Garcia","Bauer","Okafor","Park","Reichmann","Faruq","O'Connor","Andersen","Nair","Singh","Brunner","Bakker","Erikson","Bittencourt","Saidov","Rasmussen","de Vries","Yamamoto"];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(7341);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
};

const ROLES = [
  "Senior Java Engineer","Data Engineer","Cloud Architect","SAP FI/CO Consultant","ABAP Developer","Quant Developer",
  "DevOps Engineer","FHIR Integration Engineer","WMS Project Manager","Cyber Security Lead","Actuarial Analyst",
  "Robotics Software Engineer","ML Engineer","Platform Engineer","Full-stack Developer","Site Reliability Engineer",
  "Solutions Architect","Tech Lead","Engineering Manager","Frontend Engineer","Backend Engineer","Mobile Engineer",
];
const LOCS = [
  { city: "London, UK",       tz: "GMT", country: "UK" },
  { city: "Berlin, DE",       tz: "CET", country: "DE" },
  { city: "Amsterdam, NL",    tz: "CET", country: "NL" },
  { city: "Stockholm, SE",    tz: "CET", country: "SE" },
  { city: "Madrid, ES",       tz: "CET", country: "ES" },
  { city: "Warsaw, PL",       tz: "CET", country: "PL" },
  { city: "New York, US",     tz: "EST", country: "US" },
  { city: "Boston, US",       tz: "EST", country: "US" },
  { city: "Bangalore, IN",    tz: "IST", country: "IN" },
  { city: "Singapore, SG",    tz: "SGT", country: "SG" },
  { city: "Tokyo, JP",        tz: "JST", country: "JP" },
  { city: "Dubai, AE",        tz: "GST", country: "AE" },
  { city: "Lisbon, PT",       tz: "WET", country: "PT" },
  { city: "Buenos Aires, AR", tz: "ART", country: "AR" },
];

function buildResources(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const skills = pickN(ALL_SKILLS, 4 + Math.floor(rng() * 5));
    const yrs = 2 + Math.floor(rng() * 16);
    const seniority = yrs < 4 ? "Junior" : yrs < 8 ? "Mid" : yrs < 13 ? "Senior" : pick(["Principal", "Staff"]);
    const status = STATUSES[Math.floor(rng() * STATUSES.length)].id;
    const loc = pick(LOCS);
    const role = pick(ROLES);
    const rate = 380 + Math.floor(rng() * 800);
    const availDays =
      status === "available" ? 0 :
      status === "soon" ? 14 + Math.floor(rng() * 60) :
      status === "assigned" ? 60 + Math.floor(rng() * 120) :
      Math.floor(rng() * 30);
    out.push({
      id: "r" + (i + 1),
      name: `${first} ${last}`,
      initials: (first[0] + last[0]).toUpperCase(),
      role,
      seniority,
      yrs,
      skills,
      primarySkill: skills[0],
      status,
      location: loc.city,
      timezone: loc.tz,
      country: loc.country,
      rate,
      currency: loc.country === "US" ? "USD/hr" : loc.country === "UK" ? "GBP/d" : loc.country === "IN" ? "INR/d" : "EUR/d",
      avatarColor: i % 6,
      availableIn: availDays,
      availability: availDays === 0 ? "Now" : availDays < 14 ? "Within 2w" : availDays < 30 ? "Within 1mo" : `${Math.round(availDays / 30)} mo`,
      noticePeriod: Math.floor(rng() * 4) * 2,
      languages: pickN(["English","German","French","Spanish","Mandarin","Japanese","Dutch","Portuguese","Hindi"], 1 + Math.floor(rng() * 3)),
      lastUpdated: `${1 + Math.floor(rng() * 28)}d ago`,
      engagement: rng() > 0.5 ? "Contract" : "Permanent",
      education: pick(["MSc Computer Science","BSc Engineering","PhD Mathematics","MEng Software Eng.","MBA","BSc Mathematics"]),
      currentAssignment: status === "assigned" ? pick(CLIENTS).name : null,
      tags: pickN(["Top performer","Reliable","Cross-functional","Client-facing","Pre-sales","Mentor","Travel-ok","Security clearance"], Math.floor(rng() * 3)),
      bio: `${seniority} ${role} with ${yrs}+ years across ${skills.slice(0, 3).join(", ")}. Delivered platforms at scale for ${pickN(["banking","logistics","health","energy","telco"], 2).join(" and ")} clients.`,
    });
  }
  return out;
}

export const RESOURCES = buildResources(72);

/**
 * Score a resource against a project's required skills + experience + availability + location.
 * Returns { total, skill, exp, avail, loc, matchedSkills, missingSkills } or 0 if no project.
 */
export function matchScore(resource, project) {
  if (!project) return 0;
  const req = project.skills.map((s) => s.toLowerCase());
  const has = resource.skills.map((s) => s.toLowerCase());
  let skillHits = 0;
  req.forEach((r) => {
    if (has.some((h) => h === r || h.includes(r.split(" ")[0]) || r.includes(h.split(" ")[0]))) skillHits++;
  });
  const skillScore = (skillHits / req.length) * 100;
  const expScore = Math.min(100, (resource.yrs / 10) * 100);
  const availScore =
    resource.availableIn === 0 ? 100 :
    resource.availableIn < 21 ? 85 :
    resource.availableIn < 45 ? 65 : 40;
  const locScore = project.location.toLowerCase().includes("remote")
    ? 90
    : project.location.toLowerCase().includes(resource.country.toLowerCase())
      ? 95
      : project.location.toLowerCase().includes(resource.location.split(",")[0].toLowerCase())
        ? 95
        : 70;

  const total = Math.round(skillScore * 0.55 + expScore * 0.15 + availScore * 0.2 + locScore * 0.1);

  return {
    total,
    skill: Math.round(skillScore),
    exp: Math.round(expScore),
    avail: Math.round(availScore),
    loc: Math.round(locScore),
    matchedSkills: project.skills.filter((s) =>
      resource.skills.some((rs) => rs.toLowerCase() === s.toLowerCase() || rs.toLowerCase().includes(s.toLowerCase().split(" ")[0]))
    ),
    missingSkills: project.skills.filter((s) =>
      !resource.skills.some((rs) => rs.toLowerCase() === s.toLowerCase() || rs.toLowerCase().includes(s.toLowerCase().split(" ")[0]))
    ),
  };
}

export const ASSIGNMENT_STATUSES = [
  { id: "shortlisted", label: "Shortlisted",      color: "neutral" },
  { id: "shared",      label: "Profile shared",   color: "info" },
  { id: "interview",   label: "Client interview", color: "warn" },
  { id: "selected",    label: "Selected",         color: "accent" },
  { id: "active",      label: "Onboarded",        color: "ok" },
  { id: "rejected",    label: "Rejected",         color: "danger" },
  { id: "rolledoff",   label: "Rolled off",       color: "neutral" },
];

export const ASSIGNMENTS = [];
PROJECTS.forEach((p) => {
  const n = 2 + Math.floor(rng() * 4);
  const pool = pickN(RESOURCES, n);
  pool.forEach((r, i) => {
    const stIdx =
      p.status === "filled" ? 4 :
      p.status === "offer" ? 3 :
      p.status === "interview" ? Math.floor(rng() * 3) + 1 :
      p.status === "shared" ? (i === 0 ? 1 : 0) :
      p.status === "lost" ? 5 : 0;
    ASSIGNMENTS.push({
      id: `a-${p.id}-${r.id}`,
      project: p.id,
      resource: r.id,
      status: ASSIGNMENT_STATUSES[stIdx].id,
      sharedAt: `${1 + Math.floor(rng() * 21)}d ago`,
      score: matchScore(r, p).total,
      notes: i === 0 ? "Strong fit, client requested intro call." : "",
    });
  });
});

export const ACTIVITY = {
  p1: [
    { when: "2h ago",    who: "you",          what: "Shared 3 profiles with K. Halberg",       icon: "send" },
    { when: "Yesterday", who: "Anika Sharma", what: "Updated requirements: added Terraform",   icon: "edit" },
    { when: "2d ago",    who: "you",          what: "Shortlisted 7 candidates from match search", icon: "shortlist" },
    { when: "5d ago",    who: "Tobias Klein", what: "Created project",                          icon: "create" },
  ],
};

export const PARSED_RESUME = {
  name: "Lucas Marchetti",
  email: "lucas.marchetti@protonmail.com",
  phone: "+39 351 882 4471",
  location: "Milan, IT",
  timezone: "CET",
  role: "Senior Platform Engineer",
  seniority: "Senior",
  yrs: 9,
  rate: 720,
  currency: "EUR/d",
  education: "MSc Computer Engineering, Politecnico di Milano",
  languages: ["English", "Italian", "Spanish"],
  skills: ["Kubernetes","Terraform","AWS","Go","Python","Kafka","ArgoCD","Prometheus","gRPC"],
  summary:
    "9-year platform engineer with deep AWS + Kubernetes background. Built multi-region Kafka platforms at a Tier-1 bank and an e-commerce unicorn. Led 6 engineers, mentored 4 juniors to senior.",
  experience: [
    { co: "Banca Sirius",     role: "Senior Platform Engineer", from: "2023", to: "Present" },
    { co: "Brera Commerce",   role: "Platform Engineer",        from: "2020", to: "2023" },
    { co: "Reply Consulting", role: "Cloud Engineer",           from: "2017", to: "2020" },
  ],
};

// Convenience aggregate so consumers can `import * as MOCK from '.../mock'` or
// destructure `{ TENANTS, CLIENTS, ... } from '.../mock'`.
const MOCK = {
  TENANTS,
  CLIENTS,
  PROJECTS,
  PROJECT_STATUSES,
  RESOURCES,
  ALL_SKILLS,
  SENIORITIES,
  STATUSES,
  ASSIGNMENTS,
  ASSIGNMENT_STATUSES,
  ACTIVITY,
  PARSED_RESUME,
  matchScore,
};
export default MOCK;
