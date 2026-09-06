/*
 * ELIMU Africa — additional course catalog seed.
 *
 * Self-contained CommonJS script (no tsx/ts-node needed): reads DATABASE_URL
 * from .env.local and inserts courses + sections + lessons with raw SQL via
 * the `postgres` driver. Idempotent — skips any course whose slug already
 * exists.
 *
 * Run from elimu-platform/:  node scripts/seed-additional-courses.cjs
 */
const path = require('path');
const fs = require('fs');
const postgres = require('postgres');

// ── load DATABASE_URL from .env.local (never commit real values) ──────────
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

// ── category UUIDs (from the live DB) ─────────────────────────────────────
const CAT = {
  blockchain: '91d85d5b-51a4-4081-9db9-467df52ba48d',
  security: 'ae0b1af2-92a9-482d-bb90-7d7aee3bd78c',
  cloud: 'c538aade-3f33-4253-ad29-228e0b68f7af',
  data: 'de7a9daa-2469-46e4-a99e-f3e3137b25dc',
  mobile: 'c40f93ca-ed39-4f77-89a5-3c77aeb38fe5',
  design: '112dcd95-1c47-4944-b6f5-56bb363f68f1',
};

const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const L = (title, type = 'video') => ({ title, type, duration: 15 });

const courses = [
  // ═══════════════════════════════════════════════════════════════
  // BLOCKCHAIN (0 → 3)
  // ═══════════════════════════════════════════════════════════════
  {
    title: 'Blockchain Fundamentals: From Bitcoin to Smart Contracts',
    description:
      'Build a rock-solid understanding of blockchain technology from first principles. Learn how Bitcoin actually works — hashing, digital signatures, proof-of-work, and the UTXO model — before moving on to Ethereum, smart contracts, and the broader Web3 landscape. No prior cryptography or finance background required.',
    shortDescription: 'Understand Bitcoin, Ethereum, and smart contracts from first principles.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.blockchain,
    estimatedDuration: 540,
    rating: 478,
    enrollmentCount: 6120,
    sections: [
      {
        title: 'Why Blockchain Matters',
        lessons: [
          L('The Problem Blockchain Solves: Trust Without Middlemen', 'ai-classroom'),
          L('Centralized vs Decentralized Systems', 'video'),
          L('Hashing and Digital Signatures Explained', 'video'),
          L('A Brief History: From Cypherpunks to Bitcoin', 'ai-classroom'),
        ],
      },
      {
        title: 'Bitcoin Deep Dive',
        lessons: [
          L('Blocks, Chains, and the Ledger', 'video'),
          L('Proof-of-Work and Mining', 'ai-classroom'),
          L('The UTXO Model and Wallets', 'video'),
          L('Bitcoin Transactions Step by Step', 'ai-classroom'),
        ],
      },
      {
        title: 'Ethereum and Smart Contracts',
        lessons: [
          L('Ethereum: A World Computer', 'video'),
          L('What is a Smart Contract?', 'ai-classroom'),
          L('Gas, Fees, and the EVM', 'video'),
          L('ERC-20 Tokens and NFTs', 'ai-classroom'),
        ],
      },
      {
        title: 'The Broader Web3 Ecosystem',
        lessons: [
          L('Consensus Mechanisms: PoW vs PoS', 'video'),
          L('Layer 2s and Scaling Solutions', 'video'),
          L('Use Cases: Finance, Supply Chain, Identity', 'ai-classroom'),
          L('Risks, Regulation, and the Future of Blockchain', 'ai-classroom'),
        ],
      },
    ],
  },
  {
    title: 'Ethereum & Solidity: Build Smart Contracts',
    description:
      'Go from Solidity fundamentals to shipping your own decentralized applications. Learn the Solidity language, write and test smart contracts with Hardhat, understand security best practices, and deploy to testnets. Build real projects including an ERC-20 token, a simple DAO, and an NFT marketplace contract.',
    shortDescription: 'Write, test, and deploy production-grade Solidity smart contracts.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.blockchain,
    estimatedDuration: 600,
    rating: 484,
    enrollmentCount: 3980,
    sections: [
      {
        title: 'Solidity Foundations',
        lessons: [
          L('Solidity Syntax and Data Types', 'video'),
          L('Functions, Visibility, and Modifiers', 'video'),
          L('Mappings, Structs, and Arrays', 'ai-classroom'),
          L('Events and Logging', 'video'),
        ],
      },
      {
        title: 'Development Tooling',
        lessons: [
          L('Setting Up Hardhat and Foundry', 'video'),
          L('Writing Unit Tests for Contracts', 'ai-classroom'),
          L('Deploying with Hardhat Scripts', 'video'),
          L('Interacting via ethers.js and Web3.js', 'ai-classroom'),
        ],
      },
      {
        title: 'Building Real Contracts',
        lessons: [
          L('Project: Build an ERC-20 Token', 'ai-classroom'),
          L('Project: A Simple DAO with Voting', 'ai-classroom'),
          L('Project: NFT Minting Contract (ERC-721)', 'ai-classroom'),
          L('Working with Chainlink Oracles', 'video'),
        ],
      },
      {
        title: 'Security and Best Practices',
        lessons: [
          L('Common Vulnerabilities: Reentrancy, Overflow', 'video'),
          L('Access Control and Ownership Patterns', 'video'),
          L('Upgradeable Contracts and Proxies', 'ai-classroom'),
          L('Auditing Mindset and Gas Optimization', 'ai-classroom'),
        ],
      },
    ],
  },
  {
    title: 'Web3 & DeFi Masterclass',
    description:
      'A comprehensive deep-dive into decentralized finance and the Web3 application stack. Understand liquidity pools, automated market makers, lending protocols, and yield farming — then learn to build your own DeFi integrations with ethers.js, The Graph, and IPFS. Covers wallet infrastructure, DAO governance, and composability across protocols.',
    shortDescription: 'Master DeFi protocols and build composable Web3 applications.',
    level: 'advanced',
    type: 'masterclass',
    isPro: true,
    categoryId: CAT.blockchain,
    estimatedDuration: 720,
    rating: 490,
    enrollmentCount: 2210,
    sections: [
      {
        title: 'DeFi Architecture',
        lessons: [
          L('The DeFi Stack: Money Legos and Composability', 'ai-classroom'),
          L('Automated Market Makers (Uniswap)', 'video'),
          L('Lending Protocols (Aave and Compound)', 'video'),
          L('Stablecoins and Collateralization', 'ai-classroom'),
        ],
      },
      {
        title: 'Building on DeFi',
        lessons: [
          L('Integrating Uniswap with ethers.js', 'ai-classroom'),
          L('Flash Loans and Arbitrage Strategies', 'video'),
          L('Yield Farming and Liquidity Provision', 'ai-classroom'),
          L('Project: A DEX Aggregator', 'ai-classroom'),
        ],
      },
      {
        title: 'Web3 Data and Storage',
        lessons: [
          L('Indexing On-Chain Data with The Graph', 'video'),
          L('Decentralized Storage with IPFS and Arweave', 'video'),
          L('Reading Events and Building Subgraphs', 'ai-classroom'),
        ],
      },
      {
        title: 'Governance and Frontend',
        lessons: [
          L('DAO Governance and Token Voting', 'ai-classroom'),
          L('Wallet Integration and Account Abstraction', 'video'),
          L('Building a Web3 Dapp Frontend', 'ai-classroom'),
          L('Security, Audits, and Risk Management', 'video'),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CYBERSECURITY (1 → 3)
  // ═══════════════════════════════════════════════════════════════
  {
    title: 'Network Security Fundamentals',
    description:
      'Learn how networks are attacked and defended. This course covers the OSI model, TCP/IP, firewalls, VPNs, intrusion detection, and the core security controls that protect modern infrastructure. Build a home lab to practice packet analysis with Wireshark, firewall configuration, and network reconnaissance — all with a defensive mindset.',
    shortDescription: 'Understand network attacks and defenses — firewalls, VPNs, IDS, and packet analysis.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.security,
    estimatedDuration: 540,
    rating: 481,
    enrollmentCount: 7430,
    sections: [
      {
        title: 'Networking Foundations',
        lessons: [
          L('The OSI Model and TCP/IP Stack', 'video'),
          L('IP Addressing, Subnetting, and Routing', 'video'),
          L('How Packets Move: LANs, WANs, and DNS', 'ai-classroom'),
          L('Common Network Devices and Topologies', 'video'),
        ],
      },
      {
        title: 'Security Controls',
        lessons: [
          L('Firewalls: Stateful and Next-Gen', 'video'),
          L('VPNs and Encrypted Tunnels', 'ai-classroom'),
          L('Intrusion Detection and Prevention (IDS/IPS)', 'video'),
          L('Network Segmentation and Zero Trust', 'ai-classroom'),
        ],
      },
      {
        title: 'Traffic Analysis',
        lessons: [
          L('Packet Analysis with Wireshark', 'ai-classroom'),
          L('Reading Network Traffic and Protocols', 'video'),
          L('Detecting Anomalies and Port Scans', 'ai-classroom'),
          L('Project: Analyze a Capture for Threats', 'ai-classroom'),
        ],
      },
      {
        title: 'Defensive Operations',
        lessons: [
          L('Hardening Network Devices', 'video'),
          L('Monitoring and Logging Best Practices', 'video'),
          L('Incident Response Fundamentals', 'ai-classroom'),
          L('Building a Home Security Lab', 'ai-classroom'),
        ],
      },
    ],
  },
  {
    title: 'Web Application Security & Penetration Testing',
    description:
      'Learn how web applications are actually hacked — and how to defend them. This course covers the OWASP Top 10, SQL injection, XSS, CSRF, authentication bypass, and modern attacks on APIs. Use Burp Suite and other tools to find and exploit vulnerabilities in deliberately vulnerable labs, then apply the defensive fixes.',
    shortDescription: 'Find and fix OWASP Top 10 vulnerabilities with hands-on labs.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.security,
    estimatedDuration: 600,
    rating: 487,
    enrollmentCount: 5290,
    sections: [
      {
        title: 'The Attack Surface',
        lessons: [
          L('How the Web Works: HTTP, Sessions, Cookies', 'video'),
          L('The OWASP Top 10 Overview', 'ai-classroom'),
          L('Reconnaissance and Enumeration', 'video'),
          L('Burp Suite: Intercepting and Modifying Traffic', 'ai-classroom'),
        ],
      },
      {
        title: 'Injection Attacks',
        lessons: [
          L('SQL Injection: Union, Blind, and Error-Based', 'ai-classroom'),
          L('Command Injection and Path Traversal', 'video'),
          L('Cross-Site Scripting (XSS) Deep Dive', 'ai-classroom'),
          L('Project: Exploit a Vulnerable App', 'ai-classroom'),
        ],
      },
      {
        title: 'Authentication and API Security',
        lessons: [
          L('Broken Authentication and Session Hijacking', 'video'),
          L('CSRF and SSRF Attacks', 'video'),
          L('Securing REST and GraphQL APIs', 'ai-classroom'),
          L('JWT Attacks and Token Hardening', 'ai-classroom'),
        ],
      },
      {
        title: 'Defense and Reporting',
        lessons: [
          L('Secure Coding Practices', 'video'),
          L('Web Application Firewalls (WAF)', 'video'),
          L('Writing a Penetration Test Report', 'ai-classroom'),
          L('Responsible Disclosure and Bug Bounties', 'ai-classroom'),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CLOUD & DEVOPS (2 → 3)
  // ═══════════════════════════════════════════════════════════════
  {
    title: 'Docker & Kubernetes: Container Orchestration',
    description:
      'Master containers from first principles to production orchestration. Learn to build and run Docker images, compose multi-service applications, and deploy them at scale with Kubernetes. Covers pods, deployments, services, ingress, persistent storage, and Helm charts — with real-world CI/CD workflows.',
    shortDescription: 'Containerize apps with Docker and orchestrate them with Kubernetes.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.cloud,
    estimatedDuration: 600,
    rating: 483,
    enrollmentCount: 6870,
    sections: [
      {
        title: 'Docker Fundamentals',
        lessons: [
          L('Containers vs Virtual Machines', 'video'),
          L('Docker Images, Containers, and Layers', 'ai-classroom'),
          L('Writing Dockerfiles', 'video'),
          L('Volumes and Networking', 'ai-classroom'),
        ],
      },
      {
        title: 'Docker Compose',
        lessons: [
          L('Composing Multi-Service Applications', 'video'),
          L('Environment Variables and Secrets', 'video'),
          L('Project: Dockerize a Full-Stack App', 'ai-classroom'),
        ],
      },
      {
        title: 'Kubernetes Core Concepts',
        lessons: [
          L('Pods, Deployments, and ReplicaSets', 'ai-classroom'),
          L('Services and Ingress', 'video'),
          L('ConfigMaps and Secrets', 'video'),
          L('Persistent Volumes and Stateful Apps', 'ai-classroom'),
        ],
      },
      {
        title: 'Kubernetes in Production',
        lessons: [
          L('Helm Charts and Package Management', 'video'),
          L('Autoscaling and Resource Limits', 'ai-classroom'),
          L('Monitoring with Prometheus and Grafana', 'video'),
          L('Project: Deploy to a Managed K8s Cluster', 'ai-classroom'),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // DATA SCIENCE (2 → 3)
  // ═══════════════════════════════════════════════════════════════
  {
    title: 'Machine Learning with Scikit-learn',
    description:
      'Learn practical machine learning with Python and scikit-learn. Build a complete ML workflow — data preprocessing, feature engineering, model selection, and evaluation — then master regression, classification, clustering, and dimensionality reduction. Includes end-to-end projects on real datasets with a focus on production-ready pipelines.',
    shortDescription: 'Build production ML pipelines with scikit-learn — from preprocessing to deployment.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.data,
    estimatedDuration: 600,
    rating: 486,
    enrollmentCount: 8150,
    sections: [
      {
        title: 'The ML Workflow',
        lessons: [
          L('Supervised vs Unsupervised Learning', 'video'),
          L('Data Preprocessing and Feature Scaling', 'ai-classroom'),
          L('Train/Test Splits and Cross-Validation', 'video'),
          L('Evaluation Metrics: Accuracy, Precision, Recall', 'ai-classroom'),
        ],
      },
      {
        title: 'Supervised Models',
        lessons: [
          L('Linear and Logistic Regression', 'video'),
          L('Decision Trees and Random Forests', 'ai-classroom'),
          L('Support Vector Machines', 'video'),
          L('Gradient Boosting (XGBoost and LightGBM)', 'ai-classroom'),
        ],
      },
      {
        title: 'Unsupervised Learning',
        lessons: [
          L('K-Means and Hierarchical Clustering', 'video'),
          L('Principal Component Analysis (PCA)', 'ai-classroom'),
          L('Feature Engineering and Selection', 'video'),
        ],
      },
      {
        title: 'Production Pipelines',
        lessons: [
          L('Scikit-learn Pipelines and ColumnTransformers', 'ai-classroom'),
          L('Hyperparameter Tuning with Grid and Random Search', 'video'),
          L('Model Persistence and Serving', 'video'),
          L('Project: End-to-End Churn Prediction', 'ai-classroom'),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MOBILE (2 → 3)
  // ═══════════════════════════════════════════════════════════════
  {
    title: 'iOS Development with Swift & SwiftUI',
    description:
      'Build native iOS apps with Swift and the modern SwiftUI framework. Learn Swift language fundamentals, then build responsive interfaces with SwiftUI views, state management, and navigation. Integrate networking, persistence, and device APIs, and prepare your app for the App Store. Build three complete apps along the way.',
    shortDescription: 'Build native iOS apps with Swift and SwiftUI — from basics to the App Store.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.mobile,
    estimatedDuration: 600,
    rating: 480,
    enrollmentCount: 5940,
    sections: [
      {
        title: 'Swift Language Fundamentals',
        lessons: [
          L('Swift Syntax, Types, and Optionals', 'video'),
          L('Functions, Closures, and Collections', 'video'),
          L('Structs, Classes, and Protocols', 'ai-classroom'),
          L('Error Handling and Concurrency', 'ai-classroom'),
        ],
      },
      {
        title: 'SwiftUI Basics',
        lessons: [
          L('Views, Stacks, and Layout', 'video'),
          L('State, Binding, and Observable Objects', 'ai-classroom'),
          L('Navigation and Tab Bars', 'video'),
          L('Project: A Simple To-Do App', 'ai-classroom'),
        ],
      },
      {
        title: 'Data and Networking',
        lessons: [
          L('Fetching Data with URLSession', 'video'),
          L('Codable and JSON Parsing', 'ai-classroom'),
          L('SwiftData and Persistence', 'video'),
          L('Project: A Weather App', 'ai-classroom'),
        ],
      },
      {
        title: 'Publishing to the App Store',
        lessons: [
          L('Animations and Custom UI', 'video'),
          L('Accessibility and Localization', 'video'),
          L('Signing, Provisioning, and App Store Connect', 'ai-classroom'),
          L('Project: Polish and Ship Your App', 'ai-classroom'),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // UI/UX (2 → 3)
  // ═══════════════════════════════════════════════════════════════
  {
    title: 'UI Design Systems with Figma',
    description:
      'Design scalable, consistent product interfaces by building a real design system in Figma. Learn design tokens, color and typography scales, component libraries, and auto-layout — then document and ship your system so engineering can consume it. Includes hands-on projects building a button, form, and dashboard component set.',
    shortDescription: 'Build a production-ready design system in Figma — tokens, components, and docs.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.design,
    estimatedDuration: 540,
    rating: 482,
    enrollmentCount: 4460,
    sections: [
      {
        title: 'Design System Foundations',
        lessons: [
          L('What is a Design System and Why It Matters', 'ai-classroom'),
          L('Design Tokens: Color, Spacing, and Type Scales', 'video'),
          L('Figma Auto Layout and Constraints', 'ai-classroom'),
          L('Naming Conventions and Organization', 'video'),
        ],
      },
      {
        title: 'Building Components',
        lessons: [
          L('Component Properties and Variants', 'ai-classroom'),
          L('Project: A Flexible Button System', 'ai-classroom'),
          L('Project: Forms and Input States', 'ai-classroom'),
          L('Project: Cards and Lists', 'ai-classroom'),
        ],
      },
      {
        title: 'Patterns and Accessibility',
        lessons: [
          L('Icons, Illustrations, and Imagery', 'video'),
          L('Accessible Color and Contrast (WCAG)', 'video'),
          L('Dark Mode and Theming', 'ai-classroom'),
        ],
      },
      {
        title: 'Documentation and Handoff',
        lessons: [
          L('Documenting Components for Engineers', 'video'),
          L('Versioning and Releasing a Design System', 'video'),
          L('Project: A Complete Dashboard Kit', 'ai-classroom'),
        ],
      },
    ],
  },
];

async function main() {
  console.log(`Seeding ${courses.length} additional courses...\n`);
  let created = 0;
  let skipped = 0;

  for (const c of courses) {
    const slug = slugify(c.title);
    const existing = await sql`select id from courses where slug = ${slug}`;
    if (existing.length) {
      console.log(`  skip (exists): ${c.title}`);
      skipped++;
      continue;
    }

    const [course] = await sql`
      insert into courses
        (title, slug, description, short_description, level, type, is_pro,
         category_id, estimated_duration, rating, enrollment_count, status)
      values
        (${c.title}, ${slug}, ${c.description}, ${c.shortDescription}, ${c.level},
         ${c.type}, ${c.isPro}, ${c.categoryId}, ${c.estimatedDuration},
         ${c.rating}, ${c.enrollmentCount}, 'published')
      returning id
    `;

    let lessonTotal = 0;
    for (const [sIdx, section] of c.sections.entries()) {
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

    console.log(`  created: ${c.title} (${c.sections.length} sections, ${lessonTotal} lessons)`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end().catch(() => {});
  process.exit(1);
});
