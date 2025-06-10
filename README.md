# Mighty Books - Library Management System

## Project Report

### Submitted By:

| Name                 | Roll Number  |
| -------------------- | ------------ |
| Abir Dutta           | 430122010033 |
| Krittika Chakraborty | 430122020048 |
| Taniya Prasad        | 430122020036 |
| Souvik Kumar Baguli  | 430122010059 |
| Komal Kumari         | 430122020042 |

### Institution:

**Narula Institute of Technology**
Department of Computer Science and Engineering (CSE)
B.Tech, 3rd Year

---

## 1. Introduction

Mighty Books is a full-stack web-based Library Management System that aims to simplify and modernize library operations by digitizing workflows like book cataloging, issuance, returns, fines, and user management. The system provides distinct dashboards and feature sets based on user roles (Students, Librarians, and Admins), ensuring secure, scalable, and structured access to data and functionality.

It integrates a modern front-end stack (React, Next.js, TypeScript, Tailwind CSS, ShadCN UI) and uses Genkit to demonstrate AI-powered recommendation capabilities. The application emphasizes both a clean user experience and maintainable code architecture.

---

## 2. Key Features & Functionality

### 2.1. User Authentication (Login System)

* Role-based authentication with session persistence
* Three user roles: **Student**, **Librarian**, **Admin**
* Student authentication via name or student ID
* Secure login interface with validation and error feedback

### 2.2. Book Issuance

* Issuance by librarian or through student request approval
* Delinquency check for overdue books or unpaid fines
* `availableCopies` management and issuance record creation
* AI-powered recommendations using Genkit upon issuance

### 2.3. Book Return and Fine Calculation

* Students can request to return books from their dashboard
* Librarians handle return approvals and fine confirmation
* Auto fine calculation using `FINE_PER_DAY` constant
* Manual fine calculator for custom date inputs
* Confirmation UI to simulate online payment collection

### 2.4. Book Search and Catalog Management

* Real-time search by Title, Author, ISBN
* Results shown with interactive BookCard UI
* Book details include extended metadata and availability
* All book metadata managed in `mockBooks` object

### 2.5. User Management

* Admins: Create/update/delete any user role
* Librarians: Can only create Student users
* Input validation ensures unique student ID/username
* Password confirmation required for new users

---

## 3. Technology Stack

### 3.1 Frontend

* **Next.js** - App Router-based page routing with dynamic segments
* **React** - Functional components with hooks (`useState`, `useEffect`)
* **TypeScript** - Type-safe interfaces for consistent data flow

### 3.2 UI Components

* **Tailwind CSS** - Utility-first styling framework
* **ShadCN UI** - Pre-built and customized components for modals, forms, etc.
* **Lucide React** - Icon library for visual feedback

### 3.3 AI Integration (Prototype)

* **Genkit** - Used for generating book recommendations based on past reads
* Future expansion includes AI-based search assistance and summary generation

### 3.4 Form Handling

* `react-hook-form` - Light and performant form handler
* `zod` - Type-safe schema validation

### 3.5 Data Storage (Mock Phase)

* Data is mocked and stored in `src/data/mockData.ts`
* Future version will integrate Firebase/PostgreSQL

---

## 4. Project Structure Overview

* `src/app/`: App Router directory structure

  * `(app)/`: Protected routes (Dashboard, Admin Panel, My Books, etc.)
  * `login/`: Public login page
  * `page.tsx`: Entry point
* `src/components/`: Modular components for layout and UI
* `src/data/`: Mock user/book/request data
* `src/ai/`: Contains Genkit logic and flow definitions
* `src/hooks/`: Custom hooks for auth and UI state
* `src/types/`: Type definitions for users, books, and requests

---

## 5. How to Run the Project

### 5.1 Prerequisites

* Node.js 18+
* npm or yarn

### 5.2 Installation Steps

```bash
# Clone repo
https://github.com/[your-repo]/mighty-books

# Install dependencies
npm install

# Start development server
npm run dev

# (Optional) Start Genkit AI server
npm run genkit:dev
```

* The app runs on `http://localhost:9002`
* Genkit runs on `http://localhost:4000`

### 5.3 Environment Variables

* AI integrations require `.env` file with keys (e.g., for Genkit/Google AI)

---

## 6. Demo Credentials (for Evaluation)

| Role      | Username    | Password |
| --------- | ----------- | -------- |
| Student   | student01   | pass123  |
| Librarian | librarian01 | pass123  |
| Admin     | admin01     | pass123  |

---

## 7. Screenshots

> Include screenshots of the following pages:
>
> * Login Page
> * Dashboard (Student, Librarian, Admin)
> * Book Search
> * Book Details
> * Issue/Return Request Forms

(Embed screenshots in the README or host them and link)

---

## 8. Conclusion & Future Scope

Mighty Books is a scalable, modular Library Management System that showcases a wide variety of real-world development principles like role-based access control, UI-driven workflows, and integration of AI recommendations. It offers a clean codebase, responsive UI, and strong foundation for further academic or production use.

### Future Enhancements:

* Full database support (Firebase/PostgreSQL/MongoDB)
* JWT-based secure login and role management
* Real-time notifications for reminders and approvals
* Book reservation and waitlisting system
* QR/barcode scanner for faster issuance and return
* Exportable reports (CSV/PDF) for fines, requests, and inventory
* Admin dashboard with analytics and statistics
* More intelligent AI features (search assistant, user behavior analysis)
* Feedback module for books and services

---

## 9. Acknowledgments

We would like to thank our faculty mentors and peers at **Narula Institute of Technology**, Department of Computer Science and Engineering, for their continued guidance and support in helping us develop this project.
