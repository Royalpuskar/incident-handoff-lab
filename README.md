# Incident Handoff Lab

A defensive cybersecurity tabletop simulator that teaches responders to distinguish observations, hypotheses and confirmed evidence before handing an incident to the next shift.

## Competition and scope
Independent new project for [GenHacks](https://genhacks-open.devpost.com/rules), started November 21, 2026. All scenarios are synthetic. No live targets, exploitation, or actual incident response recommendations are provided.

## Design
A chronological incident notebook with evidence provenance, uncertainty-aware decisions and a structured handoff brief. Score decisions transparently against a published rubric. Distinct from the other competition projects.

## Run the first prototype

Requires Node.js 22+ and Python 3. Clone the repository, run `node --test engine.test.mjs`, then serve the site with `python3 -m http.server 8000` and open `http://localhost:8000`. Classify the five fictional records and review the score and explanation. The score is 20 per correct answer minus 10 per unsupported confirmation, floored at zero. This is an educational exercise, not a professional readiness certification.

## Implementation milestones
- [x] Create a reproducible synthetic incident scenario.
- [x] Implement explicit evidence classification and a deterministic scoring engine.
- [ ] Build an interactive responder notebook with keyboard navigation.
- [ ] Test missing, false and conflicting claims, and scoring boundaries.
- [ ] Add accessible demo, documentation and license.
- [ ] Document AI tools and other third-party resources in the submission.

Status: initial notebook interface, engine, five tests and CI configuration uploaded; test execution and browser validation remain to be confirmed; no deployed demo or verified contest submission yet. AI-assisted development will be disclosed.

Copyright 2026 Royalpuskar.
