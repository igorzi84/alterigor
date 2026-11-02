export const profile = {
  contact: {
    github: 'https://github.com/igorzi84',
    linkedin: 'https://linkedin.com/in/igorzi',
  },
  contributions: [
    {
      name: 'SchemaStore — Prometheus configuration',
      description:
        'Added schema support for Prometheus TSDB retention configuration, with positive and negative validation fixtures.',
      href: 'https://github.com/SchemaStore/schemastore/pull/6498',
      merged: 'October 2026',
    },
    {
      name: 'Sumo Logic OpenTelemetry Collector',
      description:
        'Fixed installation-token handling and a groupdel compatibility issue in the installer.',
      href: 'https://github.com/SumoLogic/sumologic-otel-collector/pull/967',
      merged: 'February 2023',
    },
    {
      name: 'Terraform AWS Backup module',
      description:
        'Added an option to configure force-destroy behavior for an AWS Backup vault.',
      href: 'https://github.com/lgallard/terraform-aws-backup/pull/70',
      merged: 'February 2023',
    },
  ],
  exampleQuestions: [
    'What is PlanGate and how does its approval gate work?',
    'What kind of platform engineering work does Igor do?',
    'How has Igor used Kubernetes in his work?',
    "Can you explain Igor's GitOps project?",
    'What does the certificate orchestration service do?',
    'Which technologies does Igor use for observability?',
  ],
  experience: [
    {
      company: 'Redis',
      period: '2021 – Present',
      role: 'Senior DevOps / Platform Engineer',
    },
    {
      company: 'Redis',
      period: '2017 – 2021',
      role: 'DevOps Engineer',
    },
    {
      company: 'Dell Israel R&D',
      period: '2015 – 2017',
      role: 'DevOps / Infrastructure Engineer',
    },
    {
      company: 'Amdocs Israel Ltd.',
      period: '2011 – 2015',
      role: 'Senior SME Integration',
    },
  ],
  headline: 'Platform engineering for reliable cloud systems.',
  introduction:
    'Senior DevOps and Platform Engineer with 15+ years of experience building and operating cloud infrastructure, Kubernetes platforms, backend infrastructure services, CI/CD systems, and production automation.',
  name: 'Igor Zilberman',
  projects: [
    {
      description:
        'A local-first personal project for reviewing Terraform and OpenTofu plans. Deterministic policies flag risky changes, Temporal coordinates human approval, and PostgreSQL stores reviews and audit records. AI explanations are optional and advisory. Policy blocks cannot be overridden by approval, and PlanGate never applies infrastructure changes.',
      href: 'https://github.com/igorzi84/plangate',
      name: 'PlanGate',
      technologies: [
        'Python',
        'FastAPI',
        'Temporal',
        'PostgreSQL',
        'Terraform / OpenTofu',
      ],
    },
    {
      description:
        'A Python/FastAPI service that automates TLS certificate lifecycle workflows, with durable orchestration, bounded concurrency, metrics, tracing, and operational alerts.',
      name: 'Cloud Certificate Orchestration Service',
      technologies: ['Python', 'FastAPI', 'Temporal', 'Kubernetes'],
    },
    {
      description:
        'Deployed and configured microservices across environments using Helm charts and Kustomize overlays, then added applications to an existing Argo CD environment for GitOps-based deployment and reconciliation.',
      name: 'Microservice Deployment with Helm, Kustomize, and Argo CD',
      technologies: ['Helm', 'Kustomize', 'Argo CD', 'Kubernetes'],
    },
    {
      description:
        'A Python service that monitors platform feeds, performs model-assisted analysis, and produces operational reports and notifications.',
      href: 'https://github.com/igorzi84/Hermes',
      name: 'Hermes — Platform Feed Monitoring Service',
      technologies: [
        'Python',
        'Async I/O',
        'Model-assisted analysis',
        'Docker',
      ],
    },
    {
      description:
        'The public portfolio and AI assistant you are using now. Built with TypeScript and OpenAI Sites, with server-side model integration, answers grounded in approved portfolio content, request quotas, a contact form, and automated tests. A personal project in AI-assisted application delivery.',
      href: 'https://github.com/igorzi84/alterigor',
      name: 'AlterIgor — About this site',
      technologies: [
        'TypeScript',
        'React',
        'Cloudflare Workers',
        'OpenAI Sites',
      ],
    },
  ],
  skills: [
    'Kubernetes',
    'Terraform',
    'GitOps',
    'Python',
    'FastAPI',
    'Temporal',
    'Prometheus',
    'OpenTelemetry',
  ],
} as const;
