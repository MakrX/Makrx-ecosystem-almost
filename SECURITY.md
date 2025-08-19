# Security Policy

## Contact
- **Email**: security@makrx.org
- **PGP**: 0xDEADBEEF (optional key for encrypted reports)

## Disclosure Policy
- Report vulnerabilities privately via email.
- Please do not publish proof-of-concept code or details publicly until a fix is released.
- We will coordinate disclosure timelines with reporters to ensure the safety of our users.

## Service Level Agreements
- Initial acknowledgement within **72 hours**.
- Severity-based timelines:
  - **Critical**: assessment within 5 business days, fix or mitigation targeted within 14 days.
  - **High**: assessment within 7 business days, fix targeted within 30 days.
  - **Medium/Low**: assessed within 14 days and addressed in the next release cycle.

## Scope
### In Scope
- Source code and infrastructure contained in this repository, including backend services, frontend code, and server components.

### Out of Scope
- Third-party dependencies or services.
- Documentation-only files and example code.
- Experimental or community-maintained modules.

## Supported Versions
- Security updates are provided for the `main` branch and the most recent stable releases.
- Older branches or unmaintained forks may not receive security patches.

## Hardening Expectations
- Never commit secrets; use environment variables or secure secret managers.
- Rotate any credential immediately if repository exposure is suspected; no real secrets are stored in git.
- Validate and sanitize all user input.
- Enforce proper authentication and authorization for every endpoint.
- Apply rate limiting and comprehensive logging to detect abuse.
- Request logs sampled via `REQUEST_LOG_SAMPLE_RATE` (default 100%) and retained 90 days.
- Critical security events retained for 5 years.
- Handle data securely, ensuring encryption in transit and at rest with least-privilege access.

## Reporting Template
```
Version: [commit hash or release tag]
Environment: [production/staging/local]
Steps to Reproduce:
  1. ...
  2. ...
Impact: [data exposure, RCE, etc.]
Suggested Mitigation (optional): ...
```

For more detailed security guidance, see [docs/SECURITY.md](docs/SECURITY.md).

