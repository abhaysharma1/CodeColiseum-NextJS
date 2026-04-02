# CodeColiseum Route Layout (Production Plan)

This document defines a production-grade, future-expandable route architecture for the App Router.

## Goals

- Standardize URL naming to kebab-case.
- Keep role boundaries explicit: student, teacher, admin, hod.
- Keep public problem browsing and dashboard problem workflows.
- Preserve existing links via temporary redirects during migration.
- Make future expansion predictable with route groups and clear domain boundaries.

## Naming Conventions

- Static route segments: `kebab-case` only.
- Dynamic route segments: semantic names, for example `[exam-id]`, `[group-id]`, `[result-id]`.
- Avoid generic `[id]` in new routes.
- Folder names map directly to URL path segments unless wrapped in route groups.
- Route groups are organizational only and do not appear in URL.

## Target URL Topology

### Public Surface

- `/`
- `/login`
- `/signup`
- `/problems`
- `/problem-list`

### Role Dashboards

- `/dashboard/student`
- `/dashboard/student/classes`
- `/dashboard/student/labs`
- `/dashboard/student/problem-list`
- `/dashboard/student/problems`
- `/dashboard/student/group/[group-id]`
- `/dashboard/student/results/[result-id]`
- `/dashboard/student/results/[result-id]/ai-results`

- `/dashboard/teacher`
- `/dashboard/teacher/profile`
- `/dashboard/teacher/students`
- `/dashboard/teacher/students/create-group`
- `/dashboard/teacher/students/group/[group-id]/analytics`
- `/dashboard/teacher/problems`
- `/dashboard/teacher/tests/edit/[exam-id]`
- `/dashboard/teacher/tests/results/[result-id]`
- `/dashboard/teacher/tests/results/[result-id]/ai-results`

### Admin Surface

- `/admin/dashboard`
- `/admin/bulk-sign-up`
- `/admin/upload-driver-code`
- `/admin/upload-complexity-cases`
- `/admin/upload-complexity-generator`

### HOD Surface (separate root)

- `/hod`
- `/hod/dashboard`
- `/hod/departments`
- `/hod/faculty`
- `/hod/analytics`

### Test Runtime (cross-role)

- `/tests/start/[exam-id]`
- `/tests/attempt/[exam-id]`

## Suggested App Router Layout

```txt
app/
  (public)/
    page.tsx
    login/page.tsx
    signup/page.tsx
    problems/page.tsx
    problem-list/page.tsx

  dashboard/
    layout.tsx
    student/
      layout.tsx
      page.tsx
      classes/page.tsx
      labs/page.tsx
      problem-list/page.tsx
      problems/page.tsx
      group/[group-id]/page.tsx
      results/[result-id]/page.tsx
      results/[result-id]/ai-results/page.tsx

    teacher/
      layout.tsx
      page.tsx
      profile/page.tsx
      students/page.tsx
      students/create-group/page.tsx
      students/group/[group-id]/analytics/page.tsx
      problems/page.tsx
      tests/edit/[exam-id]/page.tsx
      tests/results/[result-id]/page.tsx
      tests/results/[result-id]/ai-results/page.tsx

  admin/
    layout.tsx
    dashboard/page.tsx
    bulk-sign-up/page.tsx
    upload-driver-code/page.tsx
    upload-complexity-cases/page.tsx
    upload-complexity-generator/page.tsx

  hod/
    layout.tsx
    page.tsx
    dashboard/page.tsx
    departments/page.tsx
    faculty/page.tsx
    analytics/page.tsx

  tests/
    start/[exam-id]/page.tsx
    attempt/[exam-id]/page.tsx
```

## Current to Target Migration Map

| Current path                                        | Target path                                               |
| --------------------------------------------------- | --------------------------------------------------------- |
| `/admin/bulkSignUp`                                 | `/admin/bulk-sign-up`                                     |
| `/admin/uploaddrivercode`                           | `/admin/upload-driver-code`                               |
| `/admin/uploadcomplexitycases`                      | `/admin/upload-complexity-cases`                          |
| `/admin/uploadComplexityGenerator`                  | `/admin/upload-complexity-generator`                      |
| `/dashboard/student/problemlist`                    | `/dashboard/student/problem-list`                         |
| `/dashboard/student/seeresults/[id]`                | `/dashboard/student/results/[result-id]`                  |
| `/dashboard/student/seeresults/[id]/airesults`      | `/dashboard/student/results/[result-id]/ai-results`       |
| `/dashboard/teacher/students/creategroup`           | `/dashboard/teacher/students/create-group`                |
| `/dashboard/teacher/test/edit/[id]`                 | `/dashboard/teacher/tests/edit/[exam-id]`                 |
| `/dashboard/teacher/test/seeresults/[id]`           | `/dashboard/teacher/tests/results/[result-id]`            |
| `/dashboard/teacher/test/seeresults/[id]/airesults` | `/dashboard/teacher/tests/results/[result-id]/ai-results` |
| `/test/starttest/[id]`                              | `/tests/start/[exam-id]`                                  |
| `/test/givetest/[id]`                               | `/tests/attempt/[exam-id]`                                |
| `/problemlist`                                      | `/problem-list`                                           |

## Redirect Policy (Temporary Compatibility)

- Keep legacy routes redirected for 6 to 8 weeks.
- Use `308` permanent redirects once verified in staging and production.
- Track redirect hits and remove legacy entries after near-zero traffic for 2 consecutive weeks.

Example redirect declarations to add in `next.config.ts` during route rename rollout:

```ts
async redirects() {
  return [
    { source: "/admin/bulkSignUp", destination: "/admin/bulk-sign-up", permanent: true },
    { source: "/admin/uploaddrivercode", destination: "/admin/upload-driver-code", permanent: true },
    { source: "/dashboard/teacher/students/creategroup", destination: "/dashboard/teacher/students/create-group", permanent: true },
    { source: "/test/starttest/:id", destination: "/tests/start/:id", permanent: true },
    { source: "/test/givetest/:id", destination: "/tests/attempt/:id", permanent: true },
  ];
}
```

## Access Control Alignment

- Middleware remains the first security boundary for protected route trees.
- Layout-level client protection remains for UX.
- Add explicit HOD role handling in middleware before enabling `/hod/*`.
- Keep deterministic role landing redirects from `/dashboard`.

## Expansion Playbook

When adding a new domain (for example placements, attendance, reports):

1. Add route under the correct role tree.
2. Use kebab-case folder naming.
3. Use semantic dynamic params.
4. Add nav links only after role guard exists.
5. Add legacy redirects only if replacing an existing route.
6. Add route contract tests for auth and URL stability.

## Implementation Phases

1. Phase 1: Rename admin routes to kebab-case + redirects.
2. Phase 2: Rename teacher/student test and results routes + redirects.
3. Phase 3: Rename public problem-list route + redirects.
4. Phase 4: Introduce `/hod/*` routes and role policy.
5. Phase 5: Switch navigation links to canonical paths.
6. Phase 6: Remove legacy redirects after traffic stabilization.

## Notes

- This file is the canonical route contract for contributors.
- Any new routes should be reviewed against this document before merge.
