# School Management System - Development Roadmap

> Stack: Next.js 14 (App Router) - TypeScript - MongoDB Atlas - Mongoose - Tailwind CSS - Lucide Icons
> Database: `skool`
> Last Updated: 2026-03-29

---

## Product Direction

Goal: Build a practical school administration system that supports daily academic operations, fee collection, attendance, examinations, official printouts, and year-round school planning with realistic demo data for manual testing.

---

## Current Product State

### Fully Working Core Areas
- [x] Admin dashboard shell and navigation
- [x] Large seeded demo school database in `scripts/seed.ts`
- [x] Student CRUD, profile, fee summary, academic summary, and document hub
- [x] Teacher CRUD and profile
- [x] Class CRUD and class-teacher assignment
- [x] Subject CRUD with teacher assignment
- [x] Exam scheduling, marks entry, and calendar sync
- [x] Attendance recording, history, reports, holiday blocking, list view, and calendar view
- [x] Calendar events, meetings, holidays, exam events, and month/calendar views
- [x] Fee structures, payments, dues, receipts, and student fee overview
- [x] Template management, template preview, and student print-document generation

### Recently Introduced
- [x] Full-school seed data for grades, sections, teachers, courses, subjects, syllabi, fees, exams, results, attendance, events, and templates
- [x] Parent-teacher meeting scheduling in calendar
- [x] Exam timetable print page
- [x] Attendance register print page
- [x] Student document print pages:
  - [x] Bonafide certificate
  - [x] Transfer certificate
  - [x] Character certificate
  - [x] Study certificate
  - [x] Migration certificate
  - [x] Fee clearance certificate
  - [x] Student ID card
  - [x] Progress report card
  - [x] Marksheet
  - [x] Exam admit card
- [x] Popup-to-page conversion for:
  - [x] Subjects
  - [x] Students
  - [x] Teachers
  - [x] Classes
  - [x] Exams

---

## Current Priority

> School-management-first stabilization: finish operational gaps, clean up cross-module UX, and close the highest-value school workflows before auth/portals.

### Immediate Next Build Order
1. Security and setup cleanup for environment-only secrets and deployment readiness
2. UI refactor and consistency pass across all admin list/detail/create/edit pages
3. Student identity and admission workflow enhancements
4. School operations layer: promotion, withdrawal, transfer, archive, and session rollover
5. Calendar route conversion and broader UI consistency cleanup

---

## Phase 0 - Data Foundation and Demo School Setup

Goal: Keep the database realistic enough for full manual testing across all school workflows.

- [x] App and seed scripts read MongoDB connection from environment variables
- [x] Remove hardcoded MongoDB URI from tracked setup docs
- [x] Add `.env.example` for local setup
- [x] Expand seed script to generate classes, students, teachers, subjects, exams, results, fees, payments, attendance, events, and settings
- [x] Create grade-wise data foundation with 10 students per grade
- [x] Seed class sections for each grade
- [x] Seed operational fee data and printable receipt references
- [x] Seed certificate and print template definitions
- [x] Seed parent-teacher meeting and exam-event calendar data
- [ ] Rotate exposed database credentials outside the repository and local thread history
- [ ] Add optional safe-reseed mode that preserves settings while refreshing demo records
- [ ] Add seeded transport, inventory, and admission records for operations testing
- [ ] Add seeded parent-facing and teacher-facing users when auth is introduced

---

## Phase 1 - Core School Records

Goal: Manage school master records in a way that aligns with real admissions and staff administration.

### 1.1 Student Management
- [x] Add student
- [x] Edit student
- [x] Delete student
- [x] Student profile page `/admin/students/[id]`
- [x] Student create/edit moved from popup to dedicated pages
- [x] Student documents hub and print outputs
- [x] Admission number stored as a first-class field
- [x] Roll number stored as a first-class field
- [ ] Student photo / document upload references
- [x] Emergency contact, blood group, and house fields
- [ ] Transport fields
- [x] Previous-school details
- [ ] Admission-history timeline

### 1.2 Teacher Management
- [x] Add teacher
- [x] Edit teacher
- [x] Delete teacher
- [x] Teacher profile page `/admin/teachers/[id]`
- [x] Teacher create/edit moved from popup to dedicated pages
- [ ] Employee code stored as a first-class field
- [ ] Department / designation / reporting structure
- [ ] Teacher workload and timetable summary
- [ ] Leave history and replacement-teacher workflow

### 1.3 Class and Section Management
- [x] Class model
- [x] Classes list page
- [x] Assign class teacher
- [x] Class create/edit moved from popup to dedicated pages
- [ ] Section capacity usage and actual enrolled count
- [ ] Room allocation and homeroom assignment
- [ ] Class promotion workflow for year rollover
- [ ] Multi-section management for larger grades

### 1.4 Subject Management
- [x] Subject model and CRUD
- [x] Subject create/edit moved from popup to dedicated pages
- [ ] Department grouping and subject category
- [ ] Subject load per teacher and class mapping report

---

## Phase 2 - Attendance System

Goal: Cover the full daily attendance lifecycle for office, class teachers, and reporting.

### 2.1 Recording and Monitoring
- [x] Per-class per-date attendance form
- [x] Upsert logic
- [x] Default date navigation with previous/next controls
- [x] Grade / section / date filter flow
- [x] Attendance list and calendar views
- [x] Holiday-aware attendance blocking
- [ ] Attendance freeze/approval after submission
- [ ] Bulk attendance shortcuts and smart presets
- [ ] Teacher-based attendance ownership
- [ ] Late-arrival and half-day support

### 2.2 History and Reports
- [x] Attendance history page
- [x] Student monthly attendance summary
- [x] Class-level attendance report
- [x] School-wide absentee summary
- [x] Printable attendance register
- [ ] Attendance defaulter list for low attendance
- [ ] Parent notification for prolonged absence
- [ ] Attendance certificate / minimum attendance checks

---

## Phase 3 - Academics and Curriculum

Goal: Support the planning and assessment structure of a real school year.

### 3.1 Curriculum Foundation
- [x] Subject model and CRUD
- [x] Course model
- [x] Syllabus model
- [x] Course management page `/admin/courses`
- [x] Syllabus management page `/admin/syllabus`
- [ ] Academic term / session planner
- [ ] Subject-to-course coverage dashboard
- [ ] Unit progress tracking against syllabus

### 3.2 Exams and Marks
- [x] Exam model
- [x] Result model
- [x] Exams page
- [x] Exam creation moved from popup to dedicated page
- [x] Marks entry
- [x] Report card print layout
- [x] Marksheet print layout
- [x] Admit card print layout
- [x] Exam timetable print layout
- [x] Exam schedule synced into calendar
- [ ] Grade scale and remarks configuration
- [ ] Exam edit page / exam reschedule flow
- [ ] Moderation / result publish status
- [ ] Term-wise consolidated academic ledger

---

## Phase 4 - Fees and Finance

Goal: Track school fees, collections, dues, and financial printouts in a usable admin workflow.

- [x] Fee structure model
- [x] Payment model
- [x] Fee collection page `/admin/fees`
- [x] Record payment flow
- [x] Student/class outstanding dues report
- [x] Receipt generation page
- [x] Fee clearance certificate
- [x] Fee concessions, scholarships, and waivers
- [x] Fine / late-fee rules
- [x] Installment plans
- [x] Daily cash collection report print
- [x] Fee create/edit/payment flows moved to dedicated pages
- [ ] Payment cancellation / reversal / audit log
- [ ] Fee ledger by student and by class

---

## Phase 5 - Calendar, Events, and Academic Planning

Goal: Maintain the official school calendar and planning layer for the academic year.

- [x] Event model
- [x] Calendar page `/admin/calendar`
- [x] List view and calendar view
- [x] Add/edit/delete event workflow
- [x] Holiday management with attendance integration
- [x] Exam schedule event sync
- [x] Parent-teacher meeting scheduling
- [ ] Activity day and assembly planner
- [ ] Printable academic calendar
- [ ] Event approval / published status
- [ ] Staff duty assignment per event

---

## Phase 6 - Templates, Certificates, and Printouts

Goal: Cover the official document and print output needs of a school office.

### 6.1 Template Foundation
- [x] Certificate template model
- [x] Template management page
- [x] Placeholder mapping system
- [x] Template preview page
- [ ] School branding controls for headers, seals, signatures, and footer text
- [ ] Print CSS optimization by paper size and orientation

### 6.2 Student Documents
- [x] Student document hub
- [x] Bonafide certificate
- [x] Transfer certificate
- [x] Character certificate
- [x] Study certificate
- [x] Migration certificate
- [x] Fee clearance certificate
- [x] Student ID card print
- [ ] Leaving certificate number register
- [ ] Bulk document generation by class

### 6.3 Academic Printouts
- [x] Report card print layout
- [x] Marksheet print layout
- [x] Admit card print layout
- [x] Exam timetable print layout
- [x] Attendance register print
- [ ] Class list and section roster print
- [ ] Result analysis print summary

### 6.4 Administrative and Finance Printouts
- [x] Fee receipt print
- [x] Daily cash collection summary
- [ ] Outstanding dues notice
- [ ] Teacher ID card print
- [ ] Salary / employment certificate
- [ ] Visitor / gate pass

---

## Phase 7 - School Operations and Office Workflow

Goal: Expand beyond academics into real front-office and annual school administration.

- [ ] Admission enquiry and application tracking
- [ ] Admission form print
- [ ] Student onboarding checklist
- [x] Student transfer / withdrawal workflow
- [x] Student archive / alumni status handling
- [ ] Class promotion and year rollover
- [ ] Session-closing checklist for admin office
- [ ] Inventory hooks for books, uniforms, and stationery
- [ ] Transport route and pickup assignment
- [ ] Library and issue-return integration

---

## Phase 8 - Communication and Stakeholder Workflow

Goal: Improve coordination between school office, teachers, students, and parents.

- [ ] Announcement model and management
- [ ] Fee due reminders
- [ ] Absence alerts
- [ ] Exam schedule and result publication alerts
- [ ] Parent meeting notices from calendar events
- [ ] Staff circulars and internal notices

---

## Phase 9 - Authentication, Roles, and Portals

Goal: Protect the system and gradually expose role-based experiences.

- [ ] Credentials-based auth setup
- [ ] User model
- [ ] Login page `/login`
- [ ] Route guards for `/admin/**`
- [ ] Teacher portal `/teacher/**`
- [ ] Parent portal `/parent/**`
- [ ] Role-based print, academics, attendance, and finance permissions

---

## Phase 10 - UX and Admin Workflow Refinement

Goal: Make the product faster to operate for real school-office usage.

- [x] Convert subject create/edit popup to route pages
- [x] Convert student create/edit popup to route pages
- [x] Convert teacher create/edit popup to route pages
- [x] Convert class create/edit popup to route pages
- [x] Convert exam create popup to route page
- [ ] Convert calendar and fees modal flows to route pages
- [ ] Standardize page headers, breadcrumbs, and action bars
- [ ] Improve table density, mobile behavior, and empty states
- [ ] Add summary cards where they improve operator visibility
- [ ] Remove remaining legacy text / encoding / rough UI artifacts
- [ ] Add confirmation and success UX patterns beyond alert/confirm

---

## Highest-Value Pending Gaps

These are the most logical school-management gaps still pending:

1. Student admission records
   Identity and intake fields are now first-class, but admission-history timelines, uploads, and transport mapping are still missing.
2. Session rollover and promotion
   Promotion, transfer, withdrawal, and archive actions now exist, but full academic-year rollover and bulk promotion are still needed.
3. Finance maturity
   The fee office now supports waivers, fines, installments, and daily summaries, but cancellation audit trails and detailed ledgers are still pending.
4. Calendar and admin UX consistency
   Fees now use dedicated pages, but calendar workflows still need the same route-based cleanup and shared page-header consistency.
5. Role-based usage
   Everything currently behaves like an admin-only internal system; teacher and parent workflows are not exposed yet.
6. Office operations
   Admission pipeline, transport, inventory, library, and document registers are still absent even though they are natural school-office extensions.
7. UX polish
   The main route conversion is underway, but calendar still needs the same route-based cleanup and the overall admin UI needs a consistency pass.

---

## Folder Direction

```text
src/app/admin/
|-- attendance/
|-- calendar/
|-- classes/
|-- exams/
|-- fees/
|-- settings/
|-- students/
|-- subjects/
|-- teachers/
`-- templates/
```

This roadmap should be updated whenever a meaningful workflow, printout, route conversion, or school-operations feature is completed.
