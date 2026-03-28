# School Management System - Development Roadmap

> Stack: Next.js 14 (App Router) · TypeScript · MongoDB Atlas · Mongoose · Tailwind CSS · Lucide Icons
> Database: `skool`
> Last Updated: 2026-03-28

---

## Completed So Far

| Module | Status | Notes |
|--------|--------|-------|
| Project setup | Done | Next.js + Tailwind + MongoDB connected |
| Landing page | Done | `/` splash page |
| Admin layout | Done | Sidebar + header shell |
| Dashboard overview | Done | Live student and teacher counts |
| Student management | Done | List, add, edit, delete, profile |
| Teacher management | Done | List, add, edit, delete, profile |
| Class management | Done | Classes list and class teacher assignment |
| Attendance module | Done | Record, history, and reporting |
| Subjects module | Done | CRUD with teacher assignment |
| Exams and marks | Done | Exams, marks entry, report cards |
| Fee management | Done | Structures, payments, dues, receipts |
| Extended seed foundation | Done | Large demo school dataset generator in `scripts/seed.ts` |

---

## Current Priority

> Phase 5 - Calendar, Events, and Academic Planning

---

## Phase 0 - Data Foundation and Demo School Setup

Goal: Keep the database realistic enough for full manual testing across all modules.

- [x] Expand seed script to generate classes, students, teachers, subjects, exams, results, fees, payments, attendance, events, and settings
- [x] Create grade-wise data foundation with 10 students per grade
- [x] Seed class sections for each grade
- [x] Seed operational fee data and printable receipt references
- [x] Seed certificate and print template definitions
- [ ] Add an optional "safe reseed" mode that preserves admin settings and only refreshes demo records
- [ ] Add sample parent-facing and teacher-facing users when auth is introduced

---

## Phase 1 - Core Entity Management

Goal: Manage the school's main academic entities through CRUD workflows.

### 1.1 Student Management
- [x] Add Student
- [x] Edit Student
- [x] Delete Student
- [x] Student Profile Page `/admin/students/[id]`
- [ ] Student admission number and roll number support
- [ ] Student document upload references

### 1.2 Teacher Management
- [x] Add Teacher
- [x] Edit Teacher
- [x] Delete Teacher
- [x] Teacher Profile Page `/admin/teachers/[id]`
- [ ] Teacher employee code and joining workflow
- [ ] Teacher workload and timetable summary

### 1.3 Class and Section Management
- [x] Class model
- [x] Classes list page
- [x] Assign class teacher
- [ ] Section capacity usage and room allocation
- [ ] Class promotion workflow for year rollover

---

## Phase 2 - Attendance System

Goal: Cover the full daily attendance lifecycle.

### 2.1 Recording
- [x] Per-class per-date attendance form
- [x] Upsert logic
- [ ] Attendance lock/freeze after approval
- [ ] Bulk attendance shortcuts and holiday auto-skip

### 2.2 History and Reports
- [x] Attendance history page
- [x] Student monthly attendance summary
- [x] Class-level attendance report
- [x] School-wide absentee summary
- [ ] Printable attendance register
- [ ] Attendance defaulter list for low attendance

---

## Phase 3 - Academics Module

Goal: Track curriculum, assessments, and performance.

### 3.1 Curriculum Foundation
- [x] Subject model and CRUD
- [x] Course model
- [x] Syllabus model
- [ ] Course management page
- [ ] Syllabus management page
- [ ] Academic term and session planner

### 3.2 Exams and Marks
- [x] Exam model
- [x] Result model
- [x] Exams page
- [x] Marks entry
- [x] Report card view
- [ ] Grade scale and remarks configuration
- [ ] Exam timetable printing
- [ ] Admit card generation

---

## Phase 4 - Fee Management

Goal: Track fee schedules, collections, dues, and printable receipts.

- [x] Fee Structure model
- [x] Payment model
- [x] Fee collection page `/admin/fees`
- [x] Record payment flow
- [x] Student/class outstanding dues report
- [x] Receipt generation page
- [ ] Fee concessions, scholarships, and waivers
- [ ] Fine/late-fee rules
- [ ] Installment plans
- [ ] Daily cash collection report print

---

## Phase 5 - Calendar, Events, and Academic Planning

Goal: Maintain the official school calendar and planning layer for the academic year.

- [x] Event model
- [x] Calendar page `/admin/calendar`
- [x] Monthly calendar grouping view
- [x] Add/edit/delete event workflow
- [x] Holiday management with attendance integration
- [x] Exam schedule events sync
- [x] Parent-teacher meeting scheduling
- [ ] Activity day and assembly planner
- [ ] Printable academic calendar

---

## Phase 6 - Authentication and Roles

Goal: Protect the system and personalize access by role.

- [ ] Auth setup with credentials provider
- [ ] User model
- [ ] Login page `/login`
- [ ] Route guards for `/admin/**`
- [ ] Teacher portal `/teacher/**`
- [ ] Parent portal `/parent/**`
- [ ] Role-based permissions for print, finance, academics, and admin actions

---

## Phase 7 - Communication and Notifications

Goal: Keep staff, students, and parents informed.

- [ ] Announcement model
- [ ] Announcement management
- [ ] Email notifications
- [ ] SMS/WhatsApp hooks
- [ ] Fee due reminders
- [ ] Absence alerts
- [ ] Exam and result publication alerts

---

## Phase 8 - Certificates, Documents, and Printouts

Goal: Cover the real printable outputs schools need day to day.

### 8.1 Template Foundation
- [x] Certificate template model
- [ ] Template management page
- [ ] Placeholder mapping system for dynamic printing
- [ ] School branding controls for headers, seals, and signatures

### 8.2 Student Documents
- [ ] Bonafide certificate
- [ ] Transfer certificate
- [ ] Character certificate
- [ ] Study certificate
- [ ] Migration certificate
- [ ] Fee clearance certificate
- [ ] Student ID card print

### 8.3 Academic Printouts
- [ ] Report card print layout
- [ ] Marksheet print layout
- [ ] Admit card print layout
- [ ] Exam timetable print layout
- [ ] Attendance register print
- [ ] Class list and section roster print

### 8.4 Administrative and Finance Printouts
- [x] Fee receipt print
- [ ] Cash collection summary print
- [ ] Outstanding dues notice
- [ ] Teacher ID card print
- [ ] Salary certificate / employment certificate
- [ ] Visitor pass / gate pass

---

## Phase 9 - Admissions and School Operations

Goal: Cover the operational workflows a school office needs beyond academics.

- [ ] Admission enquiry and application tracking
- [ ] Admission form print
- [ ] Student onboarding checklist
- [ ] Class promotion and rollover
- [ ] Student transfer and withdrawal workflow
- [ ] Alumni/archive status handling
- [ ] Inventory hooks for uniforms, books, and transport
- [ ] Transport route and pickup assignment

---

## Phase 10 - Analytics and Reporting

Goal: Give administrators actionable visibility across the school.

- [ ] Attendance trends
- [ ] Grade distribution charts
- [ ] Fee collection progress
- [ ] Top/bottom performers
- [ ] Enrollment trend analytics
- [ ] Teacher workload insights
- [ ] Calendar utilization and event summary

---

## Suggested Next Build Order

1. Phase 5 calendar UI and event CRUD
2. Course and syllabus pages using the new seeded models
3. Phase 8 template management and printable document screens
4. Admission and school-operations workflows
5. Authentication and role-based portals

---

## File and Folder Convention

```text
src/
|-- app/
|   |-- admin/
|   |   |-- page.tsx
|   |   |-- layout.tsx
|   |   |-- students/
|   |   |-- teachers/
|   |   |-- classes/
|   |   |-- attendance/
|   |   |-- subjects/
|   |   |-- exams/
|   |   |-- fees/
|   |   |-- calendar/
|   |   |-- courses/
|   |   |-- syllabus/
|   |   `-- templates/
|   |-- login/
|   `-- page.tsx
|-- lib/
|   `-- mongodb.ts
`-- models/
    |-- Attendance.ts
    |-- CertificateTemplate.ts
    |-- Class.ts
    |-- Course.ts
    |-- Event.ts
    |-- Exam.ts
    |-- FeeStructure.ts
    |-- Payment.ts
    |-- Result.ts
    |-- Setting.ts
    |-- Student.ts
    |-- Subject.ts
    |-- Syllabus.ts
    |-- Teacher.ts
    `-- User.ts
```

---

This file is the working roadmap and should be updated whenever a phase or sub-module is completed.
