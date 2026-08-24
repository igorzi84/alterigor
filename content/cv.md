# Igor Zilberman

Vaughan, ON | igor@zilberman.ca
[linkedin.com/in/igorzi](https://linkedin.com/in/igorzi) | [github.com/igorzi84](https://github.com/igorzi84)

## Summary

Senior DevOps and Platform Engineer with 15+ years of experience building and operating cloud infrastructure, CI/CD systems, Kubernetes platforms, backend infrastructure services, and production automation for large-scale distributed systems. Strong hands-on background across AWS, GCP, and Azure, with recent work focused on Python/FastAPI services, Temporal workflows, GitOps deployments, Terraform, Helm, Prometheus/Grafana observability, and reliable operations for Redis Enterprise cloud platforms.

## Core Skills

- **Cloud and Platform:** AWS, GCP, Azure, Kubernetes, Docker, Helm, Linux, networking, multi-cloud operations
- **CI/CD and GitOps:** GitHub Actions, Jenkins, build and release pipelines, ArgoCD, LaunchDarkly, deployment automation
- **Infrastructure as Code:** Terraform, Ansible, Chef, SOPS, GCP KMS, secrets handling, environment promotion
- **Backend Engineering:** Python, FastAPI, TypeScript, Node.js, REST APIs, Pydantic, aiohttp, Redis
- **Reliability and Observability:** Prometheus, Grafana, OpenTelemetry, Tempo, Kibana/OpenSearch, alerting, incident response
- **Workflow Automation:** Temporal workflows, activities, schedules, workers, retries, queue-depth scaling, KEDA
- **Testing and Quality:** pytest, Jest, mypy, pylint, pre-commit, e2e test automation

## Selected Projects

### Cloud Certificate Orchestration Service

- Designed and built a Python/FastAPI service for automated TLS certificate lifecycle management using durable workflow orchestration.
- Implemented workflows for certificate issuance, domain claims, expiry scans, and schedule reconciliation across a large cloud platform.
- Added reliability controls including idempotent workflow reuse, retry handling, continue-as-new behavior, bounded concurrency, and stale schedule cleanup.
- Deployed the service through Helm and GitOps with separate API and worker components, Kubernetes health probes, mutual TLS, encrypted secrets, and environment-specific promotion.
- Implemented Prometheus metrics, distributed tracing, structured service metadata, actionable alerts, and queue-depth-based worker scaling.

### Microservice Deployment with Helm, Kustomize, and Argo CD

- Deployed and configured microservices across environments using Helm charts and Kustomize overlays.
- Added microservice applications to an existing Argo CD environment for GitOps-based deployment and reconciliation.
- Maintained environment-specific configuration and repeatable deployment workflows for Kubernetes services.

### Platform Feed Monitoring Service

- Built a Python service that monitors RSS/Atom feeds for retirements, deprecations, breaking changes, and cloud platform updates.
- Implemented asynchronous feed parsing, filtering, model-assisted analysis, caching, PDF reporting, notifications, Docker packaging, and Helm-based Kubernetes deployment.

## Experience

### Redis — Senior DevOps / Platform Engineer

*2021 – Present*

- Designed and implemented backend infrastructure services in Python deployed on Kubernetes, enabling automated operational workflows across large cloud environments.
- Built infrastructure APIs for certificate lifecycle orchestration, including CSR generation, certificate issuance, secure distribution, automated rotation, and production-safe retry behavior.
- Developed Temporal-based workflow automation for long-running operational processes, including certificate issuance, domain claims, expiry scans, and schedule reconciliation.
- Owned Kubernetes deployment architecture for platform services using Helm, GitOps, monitoring, alerts, health probes, mutual TLS certificates, encrypted secrets, and worker autoscaling.
- Architected CI/CD and release workflows supporting automated testing, containerized builds, semantic versioning, environment promotion, and production deployment controls.
- Used LaunchDarkly feature flags to support safer releases, staged rollouts, and operational control of production behavior.
- Implemented Terraform-based infrastructure modules and automation used to provision and manage cloud resources across multiple cloud providers.
- Improved observability and operational readiness through Prometheus/Grafana metrics, OpenTelemetry tracing, structured logging, runbooks, troubleshooting guides, and Cloud Ops handoffs.
- Participated in production on-call and incident response, diagnosing issues across Kubernetes, Linux, networking, cloud services, CI/CD pipelines, and distributed database infrastructure.

### Redis — DevOps Engineer

*2017 – 2021*

- Developed and maintained infrastructure automation using Chef and Ansible, enabling repeatable, low-touch deployments across cloud environments.
- Operated and supported a large fleet of production database clusters across multiple cloud providers.
- Provided third-tier troubleshooting for complex distributed system, Linux, networking, and cloud infrastructure issues.
- Built and maintained operational tooling for cluster management, deployment workflows, configuration management, and production support.

### Dell Israel R&D — DevOps / Infrastructure Engineer

*2015 – 2017*

- Designed and maintained Jenkins CI/CD pipelines supporting distributed engineering teams.
- Managed physical and virtual infrastructure used for build, QA, and integration environments.
- Developed internal automation and reporting tools that improved build reliability, pipeline visibility, and release support.

### Amdocs Israel Ltd. — Senior SME Integration

*2011 – 2015*

- Designed and implemented highly available clustered environments for enterprise telecom platforms.
- Led technical integrations across middleware, Unix systems, networking, and databases.
- Provided production troubleshooting, customer-facing technical support, documentation, and training for support teams.

## Education

**Bachelor of Science, Electrical and Electronics Engineering** — SCE College of Engineering, Israel
