# Implementation Plan: Clone and Initialize School Management Project

This plan outlines the steps to connect to GitHub, clone the `school-management` repository, and initialize a modern development stack using Next.js, Tailwind CSS, MongoDB, and Shadcn UI (Admin).

## User Review Required

> [!IMPORTANT]
> - **GitHub Connectivity**: If I'm unable to clone directly (e.g., due to restricted SSH or missing tokens), I may need you to provide a Personal Access Token or handle authentication manually on your terminal.
> - **MongoDB URL**: I will need a MongoDB Connection String (Atlas or Local) to finalize the database setup.
> - **Vercel Account**: For deployment, I will assume you have a Vercel account linked to your GitHub.

## Proposed Changes

### 1. Repository Management
- **Action**: Attempt to clone `https://github.com/vinayakzero/school-management.git`.
- If cloning fails or repo is empty, initialize a fresh Git repository in the `school-management` folder.

### 2. Next.js Project Initialization
#### [NEW] `school-management/`
- Initialize Next.js with App Router, Tailwind CSS, and Typescript using `npx create-next-app@latest`.
- Configure `tailwind.config.ts` for consistent styling.

### 3. UI System (Shadcn Admin)
#### [NEW] Admin Dashboard Components
- Install and initialize `shadcn/ui`.
- Add common admin dashboard components: Sidebar, Navbar, Card, Button, Table, and Input.
- Set up a layout for the `/admin` route.

### 4. Database Integration (MongoDB)
#### [NEW] `lib/mongodb.ts`
- Implement a singleton connection pattern for MongoDB using `mongoose` or `mongodb` driver.
- Create initial models: `Student`, `Teacher`, `Class`.

### 5. Deployment & Configuration
#### [NEW] `.env.local`
- Template for `MONGODB_URI`, `NEXTAUTH_SECRET`, etc.
#### [NEW] `vercel.json`
- Basic Vercel configuration for deployment.

## Open Questions

- **Authentication**: Do you want to use NextAuth.js for the admin login?
- **Features**: What are the top 3 modules you want to see in the admin dashboard (e.g., Student Enrollment, Attendance, Grade Management)?

## Verification Plan

### Automated Tests
- Run `npm run dev` and ensure the server starts without errors.
- Test MongoDB connection with a simple API route.

### Manual Verification
- Verify that the `/admin` dashboard renders with Shadcn components.
- Confirm successful integration of Tailwind CSS by styling a test page.
