# Security Ownership Map Report

## Executive Summary

There is no meaningful security ownership topology to compute for `/Users/baldvinoddsson/Desktop/Meetupreykjavik` yet, because this project folder is currently untracked in the parent git repository.

That means:

- there is no file-level commit history for this app
- there is no multi-person ownership graph for sensitive files
- the practical security bus factor is currently `1`

## Evidence

- Parent git root: `/Users/baldvinoddsson`
- `git ls-files 'Desktop/Meetupreykjavik/**'` returned no tracked files
- `git log --oneline -- 'Desktop/Meetupreykjavik'` returned no history
- `git status --short --untracked-files=all 'Desktop/Meetupreykjavik'` shows the app tree as untracked

## Ownership Findings

### O1. No committed history for this project subtree

- Severity: High
- Impact: there is no historical ownership data for auth, admin, API, payment, or security-sensitive code in this app
- Result: bus factor and hidden-owner analysis cannot be computed meaningfully for this project yet

### O2. Effective bus factor is 1

- Severity: High
- Impact: all security understanding for this app currently lives with the current builder/operator rather than being distributed through reviewed git history
- Result: there is no fallback maintainer evidence for auth, admin controls, API security, or integration code

### O3. The first ownership-map run was polluted by another project in the same monorepo

- Severity: Medium
- Impact: repository-root history from `Desktop/artist-booking-os` appeared in the generated artifacts, so those graph outputs are not valid for MeetupReykjavik ownership decisions
- Result: the generated `ownership-map-out/` artifacts should not be treated as the ownership truth for this app

## Practical Recommendation

Before security ownership mapping becomes useful for this project:

1. Put `Desktop/Meetupreykjavik` in its own git repository, or commit it into the parent repository.
2. Preserve real author identity consistently.
3. Once the code has real history, rerun the ownership-map workflow on the project repo itself.

At that point the map will be able to answer:

- who controls auth and admin code
- whether any sensitive area is orphaned
- where bus factor is too low
- whether ownership is concentrated in one person
