# Production Deployment & Rollout Guide

This guide outlines the production deployment procedure, pre-launch verification checklist, monitoring strategy, and emergency rollback procedures for the AI Finance Dashboard application.

---

## 1. Pre-Launch Checklist

### Code Quality & Security
- [x] All TypeScript type checks pass (`npx tsc --noEmit`)
- [x] Linting rules verified (`npm run lint`)
- [x] Security headers injected in middleware (CSP, X-Frame-Options, HSTS)
- [x] Snyk SAST scan returns 0 vulnerabilities
- [x] No plaintext secrets or passwords hardcoded in source control
- [x] API input boundaries validated with Zod schemas

### Infrastructure & Environment
- [ ] Database URL set (`DATABASE_URL`)
- [ ] JWT secret key set (`JWT_SECRET`)
- [ ] Health check endpoint live and returning 200 OK (`/api/health`)
- [ ] Production database migrations executed (`npx prisma db push` / `migrate deploy`)

---

## 2. Staged Rollout Strategy

Follow the staged release sequence to minimize blast radius:

```
1. STAGING DEPLOYMENT
   ├── Deploy build artifacts to Staging environment
   └── Perform automated health check & manual smoke tests

2. CANARY ROLLOUT (5% Traffic)
   ├── Route 5% of user traffic to the new version
   └── Monitor 5xx error rates and P95 response latency for 15 minutes

3. GRADUAL ROLLOUT (25% -> 50% -> 100%)
   ├── Increase traffic in increments if error rate remains < 0.1%
   └── Complete 100% promotion upon metric stability
```

### Decision Thresholds for Promotion vs Rollback

| Metric | Normal (Promote) | Warning (Hold) | Critical (Rollback) |
|---|---|---|---|
| **HTTP 5xx Error Rate** | < 0.05% | 0.05% – 0.5% | > 0.5% |
| **P95 API Latency** | < 250ms | 250ms – 500ms | > 500ms |
| **Health Check** | HTTP 200 OK | Delayed response | Non-200 / Timeout |

---

## 3. Emergency Rollback Plan

If a critical issue occurs during or after deployment, follow these steps to revert safely:

### Trigger Criteria
- Error rate spikes above 0.5% of total requests.
- P95 response latency degrades by > 50%.
- Critical data integrity or authentication flaw is detected.

### Rollback Execution Steps

1. **Revert Git Commit:**
   ```bash
   git revert HEAD -m "Revert deployment"
   git push origin main
   ```
2. **Re-trigger Production Deployment:**
   The CI/CD pipeline (`.github/workflows/ci.yml`) will build and redeploy the previous stable build.
3. **Database Recovery (If Migration Was Applied):**
   ```bash
   npx prisma db push
   ```
4. **Post-Rollback Verification:**
   - Confirm `/api/health` returns `200 OK`.
   - Verify active authentication sessions remain valid.
