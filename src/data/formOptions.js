// Curated dropdown options for the candidate (resource) form.
// Skill list is intentionally broad — backend/frontend/SAP/data/cloud/mobile etc.
// Education list is degree-level only (the simplified manual flow doesn't capture institution).
// Timezones are common business zones; users in other regions can still pick the nearest.

export const CURRENCIES = [
  { value: 'USD', label: 'USD · US Dollar' },
  { value: 'EUR', label: 'EUR · Euro' },
  { value: 'GBP', label: 'GBP · British Pound' },
  { value: 'INR', label: 'INR · Indian Rupee' },
  { value: 'CAD', label: 'CAD · Canadian Dollar' },
  { value: 'AUD', label: 'AUD · Australian Dollar' },
  { value: 'SGD', label: 'SGD · Singapore Dollar' },
  { value: 'AED', label: 'AED · UAE Dirham' },
  { value: 'CHF', label: 'CHF · Swiss Franc' },
  { value: 'JPY', label: 'JPY · Japanese Yen' },
];

export const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  "Associate's degree",
  "Bachelor's degree",
  "Master's degree",
  'MBA',
  'PhD / Doctorate',
  'Other',
];

export const TIMEZONES = [
  { value: 'IST',  label: 'IST · India (UTC+5:30)' },
  { value: 'GMT',  label: 'GMT · London (UTC+0)' },
  { value: 'CET',  label: 'CET · Central Europe (UTC+1)' },
  { value: 'EET',  label: 'EET · Eastern Europe (UTC+2)' },
  { value: 'MSK',  label: 'MSK · Moscow (UTC+3)' },
  { value: 'GST',  label: 'GST · Dubai (UTC+4)' },
  { value: 'PKT',  label: 'PKT · Karachi (UTC+5)' },
  { value: 'BST',  label: 'BST · Dhaka (UTC+6)' },
  { value: 'ICT',  label: 'ICT · Bangkok (UTC+7)' },
  { value: 'SGT',  label: 'SGT · Singapore (UTC+8)' },
  { value: 'CST',  label: 'CST · Beijing (UTC+8)' },
  { value: 'JST',  label: 'JST · Tokyo (UTC+9)' },
  { value: 'AEST', label: 'AEST · Sydney (UTC+10)' },
  { value: 'NZST', label: 'NZST · Auckland (UTC+12)' },
  { value: 'EST',  label: 'EST · New York (UTC-5)' },
  { value: 'CT',   label: 'CT · Chicago (UTC-6)' },
  { value: 'MT',   label: 'MT · Denver (UTC-7)' },
  { value: 'PT',   label: 'PT · Los Angeles (UTC-8)' },
  { value: 'BRT',  label: 'BRT · Brasilia (UTC-3)' },
  { value: 'ART',  label: 'ART · Buenos Aires (UTC-3)' },
  { value: 'WET',  label: 'WET · Lisbon (UTC+0)' },
  { value: 'UTC',  label: 'UTC' },
];

// Skill universe. Group key is informational only — the form flattens to a single dropdown.
export const SKILL_GROUPS = {
  'Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Kotlin', 'C#', 'C++', 'C', 'Go', 'Rust',
    'Swift', 'Objective-C', 'PHP', 'Ruby', 'Scala', 'Dart', 'Perl', 'R', 'Elixir', 'Haskell',
  ],
  'Frontend': [
    'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit', 'Solid.js',
    'HTML5', 'CSS3', 'Sass / SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI',
    'Redux', 'MobX', 'Zustand', 'React Query', 'Webpack', 'Vite', 'Rollup', 'Storybook',
    'jQuery', 'D3.js', 'Three.js',
  ],
  'Backend': [
    'Node.js', 'Express', 'NestJS', 'Fastify', 'Spring Boot', 'Spring Framework', 'Hibernate',
    'Django', 'Flask', 'FastAPI', 'Laravel', 'Symfony', 'CodeIgniter', 'Ruby on Rails',
    'ASP.NET Core', 'Phoenix (Elixir)', 'Gin (Go)', 'Echo (Go)', 'Actix (Rust)',
    'REST API', 'GraphQL', 'gRPC', 'WebSockets', 'OAuth 2.0', 'JWT', 'Microservices',
  ],
  'Mobile': [
    'React Native', 'Flutter', 'Android (Kotlin)', 'Android (Java)', 'iOS (Swift)', 'iOS (Objective-C)',
    'Xamarin', 'Ionic', 'Capacitor',
  ],
  'Databases': [
    'MySQL', 'PostgreSQL', 'MariaDB', 'SQL Server', 'Oracle DB', 'SQLite',
    'MongoDB', 'Redis', 'DynamoDB', 'Cassandra', 'CouchDB', 'Neo4j',
    'Elasticsearch', 'OpenSearch', 'InfluxDB', 'Snowflake', 'BigQuery', 'Redshift',
  ],
  'Cloud & DevOps': [
    'AWS', 'Google Cloud Platform', 'Microsoft Azure', 'Oracle Cloud', 'Alibaba Cloud', 'DigitalOcean',
    'Docker', 'Kubernetes', 'Helm', 'Istio', 'OpenShift',
    'Terraform', 'Pulumi', 'CloudFormation', 'Ansible', 'Chef', 'Puppet',
    'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Bitbucket Pipelines', 'ArgoCD', 'Flux',
    'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'ELK Stack', 'Splunk',
    'Nginx', 'Apache', 'HAProxy', 'Linux', 'Bash', 'PowerShell',
  ],
  'Data & AI': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn',
    'Pandas', 'NumPy', 'Matplotlib', 'Jupyter',
    'Apache Spark', 'Apache Hadoop', 'Apache Kafka', 'Apache Flink', 'Apache Beam',
    'Apache Airflow', 'dbt', 'Databricks', 'Talend', 'Informatica',
    'Power BI', 'Tableau', 'Looker', 'Qlik',
    'Computer Vision', 'NLP', 'OpenAI API', 'LangChain', 'LLMs',
  ],
  'SAP': [
    'SAP S/4HANA', 'SAP ECC', 'SAP HANA',
    'SAP FI', 'SAP CO', 'SAP FI/CO', 'SAP MM', 'SAP SD', 'SAP PP', 'SAP QM', 'SAP PM', 'SAP PS', 'SAP WM',
    'SAP HR / HCM', 'SAP SuccessFactors', 'SAP Payroll',
    'SAP ABAP', 'SAP ABAP OO', 'SAP UI5', 'SAP Fiori', 'SAP BASIS',
    'SAP BW', 'SAP BW/4HANA', 'SAP BO / BusinessObjects', 'SAP Analytics Cloud',
    'SAP PI / PO', 'SAP CPI', 'SAP MDG', 'SAP Solman',
    'SAP Ariba', 'SAP Concur', 'SAP Fieldglass', 'SAP IBP', 'SAP CRM',
  ],
  'QA & Testing': [
    'Selenium', 'Cypress', 'Playwright', 'Puppeteer', 'Jest', 'Mocha', 'Chai', 'JUnit', 'TestNG',
    'PyTest', 'PHPUnit', 'RSpec', 'Cucumber', 'Postman', 'JMeter', 'Gatling', 'LoadRunner',
    'Manual Testing', 'Automation Testing', 'Performance Testing', 'Security Testing',
  ],
  'Methodology & Tools': [
    'Agile', 'Scrum', 'Kanban', 'SAFe', 'Waterfall', 'TDD', 'BDD', 'DDD',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Trello', 'Asana',
    'Figma', 'Sketch', 'Adobe XD',
  ],
};

// Flat list for the dropdown.
export const ALL_SKILLS = Object.entries(SKILL_GROUPS).flatMap(([group, skills]) =>
  skills.map((skill) => ({ value: skill, group }))
);
