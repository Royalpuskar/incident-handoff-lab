# Incident Handoff Lab

A defensive cybersecurity tabletop simulator that teaches responders to distinguish observations, hypotheses and confirmed evidence before handing an incident to the next shift.

## Competition and scope
Independent new project for [GenHacks](https://genhacks-open.devpost.com/rules), started November 21, 2026. All scenarios are synthetic. No live targets, exploitation, or actual incident response recommendations are provided.

## Design
A chronological incident notebook with evidence provenance, uncertainty-aware decisions and a structured handoff brief. Score decisions transparently against a published rubric. Distinct from the other competition projects.

## Run the first prototype

Requires Node.js 22+ and Python 3. Clone the repository, run `node --test engine.test.mjs`, then serve the site with `python3 -m http.server 8000` and open `http://localhost:8000`. Classify the five fictional records and review the score and explanation. The score is 20 per correct answer minus 10 per unsupported confirmation, floored at zero. Practice completes only when every evidence record is correctly classified. Incorrect responses, including underconfidence rather than overclaims, require review. This is an educational exercise, not a professional readiness certification.

## Implementation milestones
- [x] Create a reproducible synthetic incident scenario.
- [x] Implement explicit evidence classification and a deterministic scoring engine.
- [ ] Build an interactive responder notebook with keyboard navigation.
- [ ] Test missing, false and conflicting claims, and scoring boundaries.
- [ ] Add accessible demo, documentation and license.
- [ ] Document AI tools and other third-party resources in the submission.

Status: notebook interface, engine, eight automated tests and CI configuration. The eight-test suite passed at revision `3941a01` ([CI logs](https://github.com/Royalpuskar/incident-handoff-lab/actions/runs/45004942432/job/137154311378)), including exhaustive coverage of the 1,024 synthetic answer combinations. Browser validation, deployment and verified contest submission remain pending. AI-assisted development will be disclosed.

Copyright 2026 Royalpuskar.
