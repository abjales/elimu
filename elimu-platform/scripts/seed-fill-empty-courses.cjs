/*
 * ELIMU Africa — fill the 6 seed courses that shipped with metadata but no
 * curriculum (0 sections/lessons). Looks each course up by slug and inserts
 * sections + lessons. Idempotent — skips any course that already has sections.
 *
 * Run from elimu-platform/:  node scripts/seed-fill-empty-courses.cjs
 */
const path = require('path');
const fs = require('fs');
const postgres = require('postgres');

function loadEnv(file) {
  const env = {};
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}
const env = loadEnv(path.join(__dirname, '..', '.env.local'));
if (!env.DATABASE_URL) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(env.DATABASE_URL, { max: 1, connect_timeout: 15 });

const L = (title, type = 'video') => ({ title, type, duration: 15 });

// keyed by existing slug → curriculum
const fill = {
  'complete-web-developer-bootcamp-2026': {
    sections: [
      {
        title: 'HTML and CSS Foundations',
        lessons: [
          L('How the Web Works: Browsers, Servers, and HTTP', 'ai-classroom'),
          L('Semantic HTML and Document Structure', 'video'),
          L('CSS Fundamentals: Selectors, Box Model, Flexbox', 'video'),
          L('Responsive Design and CSS Grid', 'ai-classroom'),
        ],
      },
      {
        title: 'JavaScript Essentials',
        lessons: [
          L('Variables, Types, and Control Flow', 'video'),
          L('Functions, Arrays, and Objects', 'video'),
          L('The DOM and Event Handling', 'ai-classroom'),
          L('Asynchronous JavaScript: Promises and Fetch', 'ai-classroom'),
        ],
      },
      {
        title: 'React Frontend',
        lessons: [
          L('Components, Props, and State', 'video'),
          L('Hooks: useState and useEffect', 'ai-classroom'),
          L('Routing and Forms', 'video'),
          L('Project: Build a Single-Page App', 'ai-classroom'),
        ],
      },
      {
        title: 'Backend and Deployment',
        lessons: [
          L('Node.js and Express Basics', 'video'),
          L('Databases and REST APIs', 'ai-classroom'),
          L('Authentication and Authorization', 'video'),
          L('Project: Deploy Your Full-Stack App', 'ai-classroom'),
        ],
      },
    ],
  },

  'python-for-data-science-ai': {
    sections: [
      {
        title: 'Python Programming Basics',
        lessons: [
          L('Setting Up Python and Jupyter', 'video'),
          L('Data Types, Variables, and Operators', 'video'),
          L('Control Flow, Loops, and Functions', 'ai-classroom'),
          L('Working with Files and Modules', 'ai-classroom'),
        ],
      },
      {
        title: 'NumPy and Pandas',
        lessons: [
          L('NumPy Arrays and Vectorized Operations', 'video'),
          L('Pandas Series and DataFrames', 'ai-classroom'),
          L('Data Cleaning and Transformation', 'video'),
          L('Grouping, Merging, and Aggregation', 'ai-classroom'),
        ],
      },
      {
        title: 'Data Visualization',
        lessons: [
          L('matplotlib: Line, Bar, and Scatter Plots', 'video'),
          L('seaborn for Statistical Visualization', 'ai-classroom'),
          L('Interactive Plots with Plotly', 'video'),
        ],
      },
      {
        title: 'Machine Learning Introduction',
        lessons: [
          L('The Machine Learning Pipeline', 'ai-classroom'),
          L('Scikit-learn: Classification and Regression', 'video'),
          L('Model Evaluation and Validation', 'ai-classroom'),
          L('Project: A Real Predictive Model', 'ai-classroom'),
        ],
      },
    ],
  },

  'react-nextjs-masterclass': {
    sections: [
      {
        title: 'React 19 Deep Dive',
        lessons: [
          L('Components, JSX, and the Virtual DOM', 'video'),
          L('Hooks: State, Effects, and Refs', 'ai-classroom'),
          L('Context, Reducers, and State Management', 'video'),
          L('Performance: Memoization and Optimization', 'ai-classroom'),
        ],
      },
      {
        title: 'Next.js App Router',
        lessons: [
          L('App Router, Layouts, and Pages', 'video'),
          L('Server vs Client Components', 'ai-classroom'),
          L('Data Fetching and Caching', 'video'),
          L('Route Handlers and API Routes', 'ai-classroom'),
        ],
      },
      {
        title: 'Advanced Patterns',
        lessons: [
          L('Server Actions and Mutations', 'ai-classroom'),
          L('Streaming and Suspense', 'video'),
          L('Authentication with NextAuth', 'ai-classroom'),
          L('Styling: Tailwind and CSS-in-JS', 'video'),
        ],
      },
      {
        title: 'Production Deployment',
        lessons: [
          L('Environment Variables and Configuration', 'video'),
          L('Building and Optimizing for Production', 'ai-classroom'),
          L('Testing with Jest and Testing Library', 'video'),
          L('Project: Deploy a Production-Ready App', 'ai-classroom'),
        ],
      },
    ],
  },

  'aws-solutions-architect-pro': {
    sections: [
      {
        title: 'Architecting on AWS',
        lessons: [
          L('The Well-Architected Framework', 'ai-classroom'),
          L('Regions, Availability Zones, and Edge', 'video'),
          L('IAM and Security Best Practices', 'video'),
          L('Cost Optimization Principles', 'ai-classroom'),
        ],
      },
      {
        title: 'Compute and Storage',
        lessons: [
          L('EC2, Auto Scaling, and Load Balancing', 'video'),
          L('S3, EBS, and EFS Deep Dive', 'ai-classroom'),
          L('Serverless with Lambda and API Gateway', 'video'),
          L('Event-Driven Architectures with SQS and SNS', 'ai-classroom'),
        ],
      },
      {
        title: 'Databases and Networking',
        lessons: [
          L('RDS, Aurora, and DynamoDB', 'video'),
          L('VPC, Subnets, and Security Groups', 'ai-classroom'),
          L('Hybrid Connectivity: VPN and Direct Connect', 'video'),
          L('Designing for High Availability', 'ai-classroom'),
        ],
      },
      {
        title: 'Security and Certification',
        lessons: [
          L('Encryption, KMS, and Secrets Manager', 'video'),
          L('Monitoring with CloudWatch and CloudTrail', 'ai-classroom'),
          L('Disaster Recovery and Backups', 'video'),
          L('Certification Exam Prep and Practice', 'ai-classroom'),
        ],
      },
    ],
  },

  'flutter-mobile-app-development': {
    sections: [
      {
        title: 'Dart and Flutter Basics',
        lessons: [
          L('Dart Language Fundamentals', 'video'),
          L('Flutter Setup and Your First App', 'ai-classroom'),
          L('Widgets, Layouts, and Styling', 'video'),
          L('State Management with setState', 'ai-classroom'),
        ],
      },
      {
        title: 'Building UIs',
        lessons: [
          L('Material Design and Themes', 'video'),
          L('Navigation and Routing', 'ai-classroom'),
          L('Lists, Grids, and Forms', 'video'),
          L('Animations and Transitions', 'ai-classroom'),
        ],
      },
      {
        title: 'Data and Backend',
        lessons: [
          L('Networking and HTTP Requests', 'video'),
          L('Parsing JSON and Models', 'ai-classroom'),
          L('Local Storage with SQLite and SharedPreferences', 'video'),
          L('Project: Build a Weather App', 'ai-classroom'),
        ],
      },
      {
        title: 'Advanced Flutter',
        lessons: [
          L('Provider and Riverpod State Management', 'video'),
          L('Firebase: Auth, Firestore, and Storage', 'ai-classroom'),
          L('Platform Channels and Native Code', 'video'),
          L('Publishing to App Store and Play Store', 'ai-classroom'),
        ],
      },
    ],
  },

  'ethical-hacking-complete-course': {
    sections: [
      {
        title: 'Ethical Hacking Foundations',
        lessons: [
          L('What is Ethical Hacking? Roles and Legal Boundaries', 'ai-classroom'),
          L('Setting Up a Kali Linux Lab', 'video'),
          L('Reconnaissance: OSINT and Passive Information Gathering', 'video'),
          L('Footprinting and Enumeration', 'ai-classroom'),
        ],
      },
      {
        title: 'Scanning and Enumeration',
        lessons: [
          L('Network Scanning with Nmap', 'ai-classroom'),
          L('Vulnerability Scanning with Nessus and OpenVAS', 'video'),
          L('Enumerating Services: SMB, SNMP, and DNS', 'video'),
          L('Project: Map a Target Network', 'ai-classroom'),
        ],
      },
      {
        title: 'Exploitation',
        lessons: [
          L('Exploitation with Metasploit', 'ai-classroom'),
          L('Password Attacks and Cracking', 'video'),
          L('Social Engineering and Phishing', 'ai-classroom'),
          L('Web App Exploitation Basics', 'video'),
        ],
      },
      {
        title: 'Post-Exploitation and Reporting',
        lessons: [
          L('Privilege Escalation', 'ai-classroom'),
          L('Maintaining Access and Pivoting', 'video'),
          L('Writing a Penetration Test Report', 'ai-classroom'),
          L('Hardening Systems Against Attacks', 'video'),
        ],
      },
    ],
  },
};

async function main() {
  console.log('Filling curriculum for 6 empty courses...\n');
  let filled = 0;
  let skipped = 0;
  let missing = 0;

  for (const [slug, data] of Object.entries(fill)) {
    const [course] = await sql`select id, title from courses where slug = ${slug}`;
    if (!course) {
      console.log(`  MISSING (no course with slug): ${slug}`);
      missing++;
      continue;
    }

    const existing = await sql`select id from course_sections where course_id = ${course.id}`;
    if (existing.length) {
      console.log(`  skip (already has sections): ${course.title}`);
      skipped++;
      continue;
    }

    let lessonTotal = 0;
    for (const [sIdx, section] of data.sections.entries()) {
      const [sec] = await sql`
        insert into course_sections (course_id, title, sort_order)
        values (${course.id}, ${section.title}, ${sIdx})
        returning id
      `;
      for (const [lIdx, lesson] of section.lessons.entries()) {
        await sql`
          insert into course_lessons (section_id, title, type, duration, sort_order)
          values (${sec.id}, ${lesson.title}, ${lesson.type}, ${lesson.duration}, ${lIdx})
        `;
        lessonTotal++;
      }
    }

    console.log(`  filled: ${course.title} (${data.sections.length} sections, ${lessonTotal} lessons)`);
    filled++;
  }

  console.log(`\nDone: ${filled} filled, ${skipped} skipped, ${missing} missing`);
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end().catch(() => {});
  process.exit(1);
});
