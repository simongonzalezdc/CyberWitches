# Security Policy

## Supported Versions

Security fixes target the current `main` branch and latest public release. Older snapshots are not supported unless a vulnerability affects the current public code too.

## Reporting a Vulnerability

Please do not open a public issue with exploit details, credentials, or private data.

Report security concerns through GitHub Security Advisories or email `security@kyanitelabs.tech` with:

- affected file or route;
- impact and reproduction steps;
- browser/runtime version, if relevant;
- whether any secret, token, or private user data was exposed.

Expected response: acknowledgement within 3 business days, triage within 7 business days, and a fix or mitigation plan based on severity.

## Project Security Notes

CyberWitches is a browser-based PWA. It should not contain committed credentials, production secrets, private player data, or unpublished deployment tokens. Local `.env` files, keys, certificates, and packaged builds are ignored by default.

Before a release, run:

```bash
npm audit --audit-level=high
npm test
gitleaks dir . --no-banner --redact
```

