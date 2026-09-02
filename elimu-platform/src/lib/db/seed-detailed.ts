import 'dotenv/config';
import { db } from './index';
import {
  courses,
  courseSections,
  courseLessons,
  categories,
} from './schema';
import { eq } from 'drizzle-orm';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Category IDs from DB
const CAT = {
  ai: '1f0a9e2c-3e65-4710-abff-b77e5cecf6de',
  web: '2b9271fc-c751-4e03-a87e-9e42ab32ce51',
  data: 'de7a9daa-2469-46e4-a99e-f3e3137b25dc',
  mobile: 'c40f93ca-ed39-4f77-89a5-3c77aeb38fe5',
  cloud: 'c538aade-3f33-4253-ad29-228e0b68f7af',
  design: '112dcd95-1c47-4944-b6f5-56bb363f68f1',
};

interface SectionInput {
  title: string;
  lessons: { title: string; type: 'video' | 'document' | 'ai-classroom'; duration: number }[];
}

interface CourseInput {
  title: string;
  description: string;
  shortDescription: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'free' | 'masterclass';
  isPro: boolean;
  categoryId: string;
  estimatedDuration: number;
  rating: number; // 0-500
  enrollmentCount: number;
  sections: SectionInput[];
}

const newCourses: CourseInput[] = [
  // ═══════════════════════════════════════
  // AI & MACHINE LEARNING
  // ═══════════════════════════════════════
  {
    title: 'Deep Learning with PyTorch: From Zero to Production',
    description:
      'Master deep learning from the ground up using PyTorch. This course takes you from understanding neural network fundamentals through building CNNs, RNNs, Transformers, and deploying models to production. You will work on real-world projects including image classification, sentiment analysis, and generative AI. Each lesson includes hands-on coding exercises with GPU-accelerated notebooks.',
    shortDescription: 'Build and deploy deep learning models with PyTorch — from neural networks to production-ready AI systems.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.ai,
    estimatedDuration: 600,
    rating: 487,
    enrollmentCount: 8432,
    sections: [
      {
        title: 'Foundations of Neural Networks',
        lessons: [
          { title: 'What is Deep Learning? History and Key Concepts', type: 'ai-classroom', duration: 15 },
          { title: 'Setting Up PyTorch and GPU Environment', type: 'video', duration: 15 },
          { title: 'Tensors, Autograd, and Computational Graphs', type: 'video', duration: 15 },
          { title: 'Building Your First Neural Network from Scratch', type: 'ai-classroom', duration: 15 },
          { title: 'Loss Functions and Optimization Explained', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Training and Debugging Models',
        lessons: [
          { title: 'Gradient Descent, Learning Rates, and Schedulers', type: 'video', duration: 15 },
          { title: 'Overfitting, Regularization, and Dropout', type: 'ai-classroom', duration: 15 },
          { title: 'Batch Normalization and Weight Initialization', type: 'video', duration: 15 },
          { title: 'Debugging Neural Networks: Common Pitfalls', type: 'document', duration: 15 },
          { title: 'Hyperparameter Tuning Strategies', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Convolutional Neural Networks',
        lessons: [
          { title: 'How Convolutions Work: Filters, Stride, Padding', type: 'ai-classroom', duration: 15 },
          { title: 'Classic Architectures: LeNet, AlexNet, VGG', type: 'video', duration: 15 },
          { title: 'ResNet, EfficientNet, and Transfer Learning', type: 'video', duration: 15 },
          { title: 'Project: Image Classification on CIFAR-10', type: 'ai-classroom', duration: 15 },
          { title: 'Data Augmentation and Mixed Precision Training', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Sequence Models and NLP',
        lessons: [
          { title: 'RNNs, LSTMs, and GRUs Explained', type: 'video', duration: 15 },
          { title: 'Attention Mechanisms and Self-Attention', type: 'ai-classroom', duration: 15 },
          { title: 'Transformers Architecture Deep Dive', type: 'video', duration: 15 },
          { title: 'Fine-Tuning BERT for Text Classification', type: 'ai-classroom', duration: 15 },
          { title: 'Project: Sentiment Analysis Pipeline', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Generative AI and Advanced Topics',
        lessons: [
          { title: 'Generative Adversarial Networks (GANs)', type: 'video', duration: 15 },
          { title: 'Variational Autoencoders and Diffusion Models', type: 'ai-classroom', duration: 15 },
          { title: 'Building a Simple GPT from Scratch', type: 'ai-classroom', duration: 15 },
          { title: 'Model Optimization: Quantization, Pruning, ONNX', type: 'video', duration: 15 },
          { title: 'Deploying Models with TorchServe and FastAPI', type: 'video', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'Natural Language Processing Masterclass',
    description:
      'Dive deep into Natural Language Processing — the technology behind ChatGPT, search engines, and language translation. Learn text preprocessing, embeddings, transformer models, named entity recognition, text generation, and how to build production NLP pipelines. This course covers both classical techniques and cutting-edge large language model approaches.',
    shortDescription: 'Master NLP from tokenization to transformers — build real language AI systems.',
    level: 'advanced',
    type: 'masterclass',
    isPro: true,
    categoryId: CAT.ai,
    estimatedDuration: 600,
    rating: 491,
    enrollmentCount: 3876,
    sections: [
      {
        title: 'Text Processing Foundations',
        lessons: [
          { title: 'Tokenization: Word, Subword, and Character-Level', type: 'video', duration: 15 },
          { title: 'Text Cleaning, Stemming, and Lemmatization', type: 'video', duration: 15 },
          { title: 'Bag of Words, TF-IDF, and N-grams', type: 'ai-classroom', duration: 15 },
          { title: 'Word Embeddings: Word2Vec, GloVe, FastText', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Deep Learning for NLP',
        lessons: [
          { title: 'Sequence-to-Sequence Models', type: 'video', duration: 15 },
          { title: 'The Transformer Architecture Explained', type: 'ai-classroom', duration: 15 },
          { title: 'BERT: Bidirectional Language Understanding', type: 'video', duration: 15 },
          { title: 'GPT Family: From GPT-1 to GPT-4', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Advanced NLP Applications',
        lessons: [
          { title: 'Named Entity Recognition and Relation Extraction', type: 'ai-classroom', duration: 15 },
          { title: 'Question Answering and Reading Comprehension', type: 'video', duration: 15 },
          { title: 'Text Summarization: Extractive and Abstractive', type: 'ai-classroom', duration: 15 },
          { title: 'Machine Translation with Transformers', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Production NLP Systems',
        lessons: [
          { title: 'Building RAG Pipelines with Vector Databases', type: 'ai-classroom', duration: 15 },
          { title: 'Prompt Engineering and LLM API Integration', type: 'video', duration: 15 },
          { title: 'Fine-Tuning LLMs with LoRA and QLoRA', type: 'video', duration: 15 },
          { title: 'Project: Multi-Language Chatbot with Memory', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'Computer Vision with Python and OpenCV',
    description:
      'Learn to build computer vision applications from image processing basics to object detection and image segmentation. This course covers OpenCV, image transforms, feature detection, object tracking, and deep learning for vision tasks. Build real projects including face detection, lane detection for self-driving cars, and medical image analysis.',
    shortDescription: 'Build vision AI systems — from image filters to real-time object detection.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.ai,
    estimatedDuration: 600,
    rating: 479,
    enrollmentCount: 5210,
    sections: [
      {
        title: 'Image Processing Fundamentals',
        lessons: [
          { title: 'Digital Images: Pixels, Color Spaces, and Histograms', type: 'video', duration: 15 },
          { title: 'OpenCV Setup and Basic Image Operations', type: 'video', duration: 15 },
          { title: 'Filters, Smoothing, and Edge Detection', type: 'ai-classroom', duration: 15 },
          { title: 'Morphological Operations and Thresholding', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Feature Detection and Matching',
        lessons: [
          { title: 'Corners, Edges, and Hough Transforms', type: 'video', duration: 15 },
          { title: 'SIFT, SURF, and ORB Feature Detectors', type: 'ai-classroom', duration: 15 },
          { title: 'Feature Matching and Homography', type: 'video', duration: 15 },
          { title: 'Project: Panoramic Image Stitching', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Object Detection and Tracking',
        lessons: [
          { title: 'Haar Cascades and HOG for Detection', type: 'video', duration: 15 },
          { title: 'YOLO Object Detection Deep Dive', type: 'ai-classroom', duration: 15 },
          { title: 'Real-Time Object Tracking with DeepSort', type: 'video', duration: 15 },
          { title: 'Project: Traffic Surveillance System', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Deep Learning for Vision',
        lessons: [
          { title: 'Image Classification with Pretrained Models', type: 'video', duration: 15 },
          { title: 'Semantic Segmentation with U-Net', type: 'ai-classroom', duration: 15 },
          { title: 'Pose Estimation and Action Recognition', type: 'video', duration: 15 },
          { title: 'Medical Image Analysis Project', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // DIGITAL SKILLS
  // ═══════════════════════════════════════
  {
    title: 'Data Analytics with Python: From Spreadsheet to Dashboard',
    description:
      'Transform raw data into actionable insights. This course takes you from Excel basics through Python data analysis with pandas, visualization with matplotlib and seaborn, and building interactive dashboards with Plotly. You will analyze real datasets from business, healthcare, and finance, and learn the statistical thinking behind every chart.',
    shortDescription: 'Analyze data like a pro — pandas, visualization, statistics, and interactive dashboards.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.data,
    estimatedDuration: 600,
    rating: 483,
    enrollmentCount: 11250,
    sections: [
      {
        title: 'Data Thinking and Tools Setup',
        lessons: [
          { title: 'Why Data Analytics Matters: Real-World Impact', type: 'ai-classroom', duration: 15 },
          { title: 'Setting Up Python, Jupyter, and pandas', type: 'video', duration: 15 },
          { title: 'Reading Data: CSV, Excel, JSON, and Databases', type: 'video', duration: 15 },
          { title: 'DataFrames: Selecting, Filtering, and Sorting', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Data Cleaning and Transformation',
        lessons: [
          { title: 'Handling Missing Values and Duplicates', type: 'video', duration: 15 },
          { title: 'Data Types, String Operations, and Date Parsing', type: 'video', duration: 15 },
          { title: 'Grouping, Aggregation, and Pivot Tables', type: 'ai-classroom', duration: 15 },
          { title: 'Merging and Joining Multiple Datasets', type: 'video', duration: 15 },
          { title: 'Project: Cleaning a Messy Sales Dataset', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Statistics for Analysts',
        lessons: [
          { title: 'Descriptive Statistics and Distribution Shapes', type: 'video', duration: 15 },
          { title: 'Correlation, Regression, and Causation', type: 'ai-classroom', duration: 15 },
          { title: 'Hypothesis Testing and P-Values Explained', type: 'video', duration: 15 },
          { title: 'A/B Testing: Design and Analysis', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Data Visualization',
        lessons: [
          { title: 'Principles of Effective Data Visualization', type: 'video', duration: 15 },
          { title: 'matplotlib and seaborn for Static Charts', type: 'video', duration: 15 },
          { title: 'Interactive Dashboards with Plotly and Dash', type: 'ai-classroom', duration: 15 },
          { title: 'Project: Building a Business Intelligence Dashboard', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'Digital Marketing Analytics: Measure What Matters',
    description:
      'Master the analytics behind digital marketing success. Learn to track user behavior with Google Analytics 4, build attribution models, analyze campaign performance, and create marketing dashboards that drive decisions. Covers SEO analytics, social media metrics, email campaign analysis, and conversion rate optimization.',
    shortDescription: 'Master marketing analytics — GA4, attribution, conversion optimization, and dashboards.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.design,
    estimatedDuration: 600,
    rating: 476,
    enrollmentCount: 7890,
    sections: [
      {
        title: 'Marketing Analytics Foundations',
        lessons: [
          { title: 'The Marketing Analytics Landscape in 2026', type: 'ai-classroom', duration: 15 },
          { title: 'Key Metrics: CAC, LTV, ROAS, and Conversion Rate', type: 'video', duration: 15 },
          { title: 'Google Analytics 4: Setup and Configuration', type: 'video', duration: 15 },
          { title: 'Event Tracking and Custom Dimensions', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Channel Analytics',
        lessons: [
          { title: 'SEO Analytics: Search Console and Keyword Tracking', type: 'video', duration: 15 },
          { title: 'Social Media Metrics That Actually Matter', type: 'ai-classroom', duration: 15 },
          { title: 'Email Campaign Analysis and Cohort Reports', type: 'video', duration: 15 },
          { title: 'Paid Ads Analytics: Google Ads and Meta Ads', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Attribution and Modeling',
        lessons: [
          { title: 'Attribution Models: First-Touch to Data-Driven', type: 'ai-classroom', duration: 15 },
          { title: 'Multi-Touch Attribution in Practice', type: 'video', duration: 15 },
          { title: 'Marketing Mix Modeling Basics', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Building Marketing Dashboards',
        lessons: [
          { title: 'Dashboard Design for Marketing Teams', type: 'video', duration: 15 },
          { title: 'Building a Real-Time Marketing Dashboard', type: 'ai-classroom', duration: 15 },
          { title: 'Project: Full-Funnel Marketing Analytics Report', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'Cloud Computing Fundamentals with AWS',
    description:
      'Understand cloud computing from IaaS to serverless. This course covers AWS core services including EC2, S3, RDS, Lambda, and IAM. Learn to architect scalable, secure, and cost-effective cloud solutions. Includes hands-on labs for deploying web applications, setting up CI/CD pipelines, and monitoring with CloudWatch.',
    shortDescription: 'Learn cloud computing with AWS — from EC2 to serverless architecture.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.cloud,
    estimatedDuration: 600,
    rating: 481,
    enrollmentCount: 6543,
    sections: [
      {
        title: 'Cloud Computing Concepts',
        lessons: [
          { title: 'What is Cloud Computing? IaaS, PaaS, SaaS', type: 'ai-classroom', duration: 15 },
          { title: 'AWS Global Infrastructure: Regions, AZs, Edge', type: 'video', duration: 15 },
          { title: 'Setting Up Your AWS Free Tier Account', type: 'video', duration: 15 },
          { title: 'IAM: Users, Groups, Roles, and Policies', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Compute and Networking',
        lessons: [
          { title: 'EC2 Instances: Launching, Connecting, and Managing', type: 'video', duration: 15 },
          { title: 'VPC, Subnets, Security Groups, and Load Balancers', type: 'ai-classroom', duration: 15 },
          { title: 'Auto Scaling Groups and Elastic Load Balancing', type: 'video', duration: 15 },
          { title: 'Project: Deploy a Web App on EC2', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Storage and Databases',
        lessons: [
          { title: 'S3: Buckets, Policies, and Lifecycle Rules', type: 'video', duration: 15 },
          { title: 'RDS: Managed Databases with MySQL and PostgreSQL', type: 'video', duration: 15 },
          { title: 'DynamoDB: NoSQL at Scale', type: 'ai-classroom', duration: 15 },
          { title: 'ElastiCache and CloudFront CDN', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Serverless and DevOps',
        lessons: [
          { title: 'AWS Lambda and API Gateway', type: 'ai-classroom', duration: 15 },
          { title: 'Step Functions and Event-Driven Architecture', type: 'video', duration: 15 },
          { title: 'CI/CD with CodePipeline and CodeBuild', type: 'video', duration: 15 },
          { title: 'CloudWatch Monitoring and Cost Optimization', type: 'video', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'UX Research and Design Thinking',
    description:
      'Learn to design products people love through user research, wireframing, prototyping, and usability testing. This course covers the entire UX design process from understanding user needs to shipping polished interfaces. Master Figma, build a portfolio-ready case study, and learn to present design decisions to stakeholders.',
    shortDescription: 'Master UX design — research, wireframing, Figma prototyping, and usability testing.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.design,
    estimatedDuration: 600,
    rating: 485,
    enrollmentCount: 9120,
    sections: [
      {
        title: 'Design Thinking Process',
        lessons: [
          { title: 'What is Design Thinking? The 5 Stages', type: 'ai-classroom', duration: 15 },
          { title: 'Empathize: User Interviews and Observation', type: 'video', duration: 15 },
          { title: 'Define: Personas, Journey Maps, and Problem Statements', type: 'ai-classroom', duration: 15 },
          { title: 'Ideate: Brainstorming and Crazy 8s Technique', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Wireframing and Prototyping',
        lessons: [
          { title: 'Low-Fidelity Wireframes: Paper and Digital', type: 'video', duration: 15 },
          { title: 'Figma Fundamentals: Frames, Components, Auto Layout', type: 'video', duration: 15 },
          { title: 'Building Interactive Prototypes in Figma', type: 'ai-classroom', duration: 15 },
          { title: 'Design Systems and Component Libraries', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Usability Testing',
        lessons: [
          { title: 'Planning and Conducting Usability Tests', type: 'video', duration: 15 },
          { title: 'Analyzing Test Results and Prioritizing Issues', type: 'ai-classroom', duration: 15 },
          { title: 'Accessibility Testing: WCAG Guidelines', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Portfolio and Career',
        lessons: [
          { title: 'Building a UX Case Study', type: 'video', duration: 15 },
          { title: 'Presenting Design Work to Stakeholders', type: 'ai-classroom', duration: 15 },
          { title: 'Project: End-to-End Mobile App Redesign', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // PROGRAMMING
  // ═══════════════════════════════════════
  {
    title: 'Python Mastery: Advanced Patterns and idioms',
    description:
      'Go beyond the basics of Python. This course covers advanced language features including decorators, context managers, metaclasses, generators, and async programming. Learn design patterns specific to Python, performance optimization techniques, and how to write clean, maintainable code that scales. Perfect for developers who know Python basics and want to level up.',
    shortDescription: 'Level up your Python — decorators, async, metaclasses, and design patterns.',
    level: 'advanced',
    type: 'masterclass',
    isPro: true,
    categoryId: CAT.web,
    estimatedDuration: 600,
    rating: 489,
    enrollmentCount: 4560,
    sections: [
      {
        title: 'Python Internals and Data Model',
        lessons: [
          { title: 'How Python Executes Code: The Interpreter Pipeline', type: 'video', duration: 15 },
          { title: 'The Data Model: Dunder Methods and Protocols', type: 'ai-classroom', duration: 15 },
          { title: 'Magic Methods: __init__, __repr__, __getitem__', type: 'video', duration: 15 },
          { title: 'Abstract Base Classes and Structural Subtyping', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Functional and Metaprogramming',
        lessons: [
          { title: 'Closures, Decorators, and Decorator Factories', type: 'ai-classroom', duration: 15 },
          { title: 'Context Managers: __enter__/@contextmanager', type: 'video', duration: 15 },
          { title: 'Generators, Itertools, and Lazy Evaluation', type: 'video', duration: 15 },
          { title: 'Metaclasses and Class Decorators', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Concurrency and Performance',
        lessons: [
          { title: 'Threading vs Multiprocessing vs asyncio', type: 'video', duration: 15 },
          { title: 'Async/Await: Building High-Performance IO', type: 'ai-classroom', duration: 15 },
          { title: 'Profiling and Optimizing Python Code', type: 'video', duration: 15 },
          { title: 'Memory Management and Garbage Collection', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Design Patterns in Python',
        lessons: [
          { title: 'Creational Patterns: Singleton, Factory, Builder', type: 'ai-classroom', duration: 15 },
          { title: 'Structural Patterns: Adapter, Facade, Proxy', type: 'video', duration: 15 },
          { title: 'Behavioral Patterns: Observer, Strategy, Command', type: 'ai-classroom', duration: 15 },
          { title: 'Project: Building a Plugin Architecture', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'Full-Stack JavaScript: Node.js, React, and PostgreSQL',
    description:
      'Build complete web applications from database to deployment. This course covers Node.js and Express for REST APIs, React with hooks and context for dynamic frontends, and PostgreSQL for data persistence. Learn authentication, file uploads, real-time communication with WebSockets, and deploy your project to production.',
    shortDescription: 'Build full-stack apps — Node.js APIs, React frontends, and PostgreSQL databases.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.web,
    estimatedDuration: 600,
    rating: 484,
    enrollmentCount: 10340,
    sections: [
      {
        title: 'Backend Foundations',
        lessons: [
          { title: 'Node.js Runtime: Event Loop and Modules', type: 'video', duration: 15 },
          { title: 'Express.js: Routing, Middleware, and Error Handling', type: 'video', duration: 15 },
          { title: 'REST API Design: Resources, Status Codes, and HATEOAS', type: 'ai-classroom', duration: 15 },
          { title: 'PostgreSQL Basics: Tables, Queries, and Migrations', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Authentication and Security',
        lessons: [
          { title: 'Password Hashing with bcrypt and Argon2', type: 'video', duration: 15 },
          { title: 'JWT Authentication: Access and Refresh Tokens', type: 'ai-classroom', duration: 15 },
          { title: 'OAuth 2.0 Integration: Google and GitHub Login', type: 'video', duration: 15 },
          { title: 'Input Validation, Rate Limiting, and CORS', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'React Frontend',
        lessons: [
          { title: 'React Fundamentals: JSX, Components, and Props', type: 'video', duration: 15 },
          { title: 'Hooks Deep Dive: useState, useEffect, useRef', type: 'ai-classroom', duration: 15 },
          { title: 'State Management with Context and useReducer', type: 'video', duration: 15 },
          { title: 'Forms, Validation, and Error Boundaries', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Advanced Features and Deployment',
        lessons: [
          { title: 'File Uploads with Multer and S3', type: 'video', duration: 15 },
          { title: 'Real-Time Features with Socket.IO', type: 'ai-classroom', duration: 15 },
          { title: 'Testing: Jest, React Testing Library, Supertest', type: 'video', duration: 15 },
          { title: 'Project: Deploy to Railway/Render with CI/CD', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'TypeScript Deep Dive: From Any to Mastery',
    description:
      'Master TypeScript beyond the basics. Learn advanced type system features including generics, conditional types, mapped types, and template literals. Understand type inference, declaration files, and how to type complex patterns like React hooks, API responses, and database queries. Includes real-world projects building type-safe libraries and applications.',
    shortDescription: 'Master TypeScript — generics, conditional types, and type-safe architecture.',
    level: 'advanced',
    type: 'masterclass',
    isPro: true,
    categoryId: CAT.web,
    estimatedDuration: 600,
    rating: 486,
    enrollmentCount: 3210,
    sections: [
      {
        title: 'Type System Foundations',
        lessons: [
          { title: 'TypeScript Compiler: How Types Become JavaScript', type: 'video', duration: 15 },
          { title: 'Type Narrowing: Type Guards and Assertion Functions', type: 'ai-classroom', duration: 15 },
          { title: 'Literal Types, Enums, and Discriminated Unions', type: 'video', duration: 15 },
          { title: 'Utility Types: Partial, Pick, Omit, Record', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Generics and Advanced Patterns',
        lessons: [
          { title: 'Generics: Constraints, Defaults, and Inference', type: 'ai-classroom', duration: 15 },
          { title: 'Conditional Types and the infer Keyword', type: 'video', duration: 15 },
          { title: 'Mapped Types and Template Literal Types', type: 'video', duration: 15 },
          { title: 'Building Type-Safe APIs with Zod and tRPC', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'TypeScript in Practice',
        lessons: [
          { title: 'Typing React Components, Hooks, and Events', type: 'video', duration: 15 },
          { title: 'Typing Database Queries with Prisma and Drizzle', type: 'ai-classroom', duration: 15 },
          { title: 'Declaration Files and Consuming Third-Party Types', type: 'video', duration: 15 },
          { title: 'TypeScript Configuration: tsconfig Deep Dive', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Type-Safe Architecture',
        lessons: [
          { title: 'Domain Modeling with Types: Making Illegal States Unrepresentable', type: 'ai-classroom', duration: 15 },
          { title: 'Building a Type-Safe ORM Query Builder', type: 'video', duration: 15 },
          { title: 'Project: Type-Safe Full-Stack Application', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'React Native: Build Mobile Apps with JavaScript',
    description:
      'Create cross-platform mobile apps for iOS and Android using React Native and Expo. Learn navigation, state management, native APIs, animations, and how to publish to the App Store and Play Store. Build three complete apps during the course: a weather app, a social feed, and a fitness tracker.',
    shortDescription: 'Build real mobile apps for iOS and Android with React Native and Expo.',
    level: 'intermediate',
    type: 'free',
    isPro: false,
    categoryId: CAT.mobile,
    estimatedDuration: 600,
    rating: 482,
    enrollmentCount: 6780,
    sections: [
      {
        title: 'React Native Fundamentals',
        lessons: [
          { title: 'React Native vs Flutter vs Native: When to Use What', type: 'ai-classroom', duration: 15 },
          { title: 'Setting Up Expo and Your First App', type: 'video', duration: 15 },
          { title: 'Core Components: View, Text, ScrollView, FlatList', type: 'video', duration: 15 },
          { title: 'Styling with StyleSheet and Flexbox', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Navigation and State',
        lessons: [
          { title: 'React Navigation: Stacks, Tabs, and Drawers', type: 'ai-classroom', duration: 15 },
          { title: 'State Management: useState, useContext, Zustand', type: 'video', duration: 15 },
          { title: 'AsyncStorage and Offline Data Persistence', type: 'video', duration: 15 },
          { title: 'Project: Weather App with API Integration', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Native Features and Animations',
        lessons: [
          { title: 'Camera, Location, and Push Notifications', type: 'video', duration: 15 },
          { title: 'Animated API and Reanimated for Smooth UI', type: 'ai-classroom', duration: 15 },
          { title: 'Gesture Handler: Swipe, Drag, and Pinch', type: 'video', duration: 15 },
          { title: 'Project: Social Feed with Infinite Scroll', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Publishing and Production',
        lessons: [
          { title: 'App Store and Play Store Submission Process', type: 'video', duration: 15 },
          { title: 'Over-the-Air Updates with EAS Update', type: 'video', duration: 15 },
          { title: 'Performance Profiling and Optimization', type: 'ai-classroom', duration: 15 },
          { title: 'Project: Fitness Tracker with Charts and Auth', type: 'ai-classroom', duration: 15 },
        ],
      },
    ],
  },
  {
    title: 'Git and GitHub: Version Control for Teams',
    description:
      'Master version control with Git and GitHub. From basic commits to advanced branching strategies, pull requests, code reviews, and CI/CD workflows. Learn rebasing, cherry-picking, bisecting, and how to manage large monorepos. Essential skills for any developer working in a team.',
    shortDescription: 'Master Git — branching, merging, rebasing, and team workflows.',
    level: 'beginner',
    type: 'free',
    isPro: false,
    categoryId: CAT.web,
    estimatedDuration: 600,
    rating: 480,
    enrollmentCount: 14560,
    sections: [
      {
        title: 'Git Basics',
        lessons: [
          { title: 'Why Version Control Matters', type: 'ai-classroom', duration: 15 },
          { title: 'Installing Git and First Commit', type: 'video', duration: 15 },
          { title: 'The Git Workflow: Add, Commit, Push, Pull', type: 'video', duration: 15 },
          { title: 'Understanding the Staging Area', type: 'ai-classroom', duration: 15 },
        ],
      },
      {
        title: 'Branching and Merging',
        lessons: [
          { title: 'Creating and Switching Branches', type: 'video', duration: 15 },
          { title: 'Merge vs Rebase: When to Use Each', type: 'ai-classroom', duration: 15 },
          { title: 'Resolving Merge Conflicts', type: 'video', duration: 15 },
          { title: 'Git Flow and GitHub Flow Branching Strategies', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'Advanced Git',
        lessons: [
          { title: 'Cherry-Picking, Stashing, and Interactive Rebase', type: 'ai-classroom', duration: 15 },
          { title: 'Git Bisect: Finding Bugs with Binary Search', type: 'video', duration: 15 },
          { title: 'Git Hooks and Pre-Commit Checks', type: 'video', duration: 15 },
        ],
      },
      {
        title: 'GitHub Collaboration',
        lessons: [
          { title: 'Pull Requests, Code Reviews, and Approvals', type: 'ai-classroom', duration: 15 },
          { title: 'GitHub Actions: CI/CD Pipelines', type: 'video', duration: 15 },
          { title: 'Issues, Projects, and Team Workflows', type: 'video', duration: 15 },
        ],
      },
    ],
  },
];

async function seedDetailedCourses() {
  console.log('Seeding detailed courses...');

  let created = 0;
  let skipped = 0;

  for (const input of newCourses) {
    // Check if course already exists
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, slugify(input.title)),
    });

    if (existing) {
      console.log(`  Skip (exists): ${input.title}`);
      skipped++;
      continue;
    }

    const [course] = await db
      .insert(courses)
      .values({
        title: input.title,
        slug: slugify(input.title),
        description: input.description,
        shortDescription: input.shortDescription,
        level: input.level,
        type: input.type,
        isPro: input.isPro,
        categoryId: input.categoryId,
        estimatedDuration: input.estimatedDuration,
        rating: input.rating,
        enrollmentCount: input.enrollmentCount,
        status: 'published',
      })
      .returning();

    // Create sections and lessons
    for (let sIdx = 0; sIdx < input.sections.length; sIdx++) {
      const s = input.sections[sIdx];
      const [section] = await db
        .insert(courseSections)
        .values({
          courseId: course.id,
          title: s.title,
          sortOrder: sIdx,
        })
        .returning();

      for (let lIdx = 0; lIdx < s.lessons.length; lIdx++) {
        const l = s.lessons[lIdx];
        await db.insert(courseLessons).values({
          sectionId: section.id,
          title: l.title,
          type: l.type,
          duration: l.duration,
          sortOrder: lIdx,
        });
      }
    }

    const totalLessons = input.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    console.log(`  Created: ${input.title} (${input.sections.length} sections, ${totalLessons} lessons)`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
}

seedDetailedCourses().catch(console.error);
