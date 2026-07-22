# Token Management System (TMS)

A robust, full-stack web application designed to manage token lifecycles, role-based access, and comprehensive audit logging.

## 🚀 Live Demo
[View the Live Application](https://token-management-system-tms.vercel.app/)

## 📝 About the Project
Managing credentials and access tokens manually in growing organizational systems often leads to security vulnerabilities, uncontrolled credential sharing, and a complete lack of accountability. I built the **Token Management System (TMS)** to solve these critical operational issues by providing a centralized, secure, and automated pipeline for token provisioning and lifecycle management. 

The application serves as a gatekeeper for system resources. It ensures that every token is unique, cryptographically secure, and strictly assigned to authenticated users. By automating the transition of tokens through various states (e.g., Created, Used, Revoked), the system eliminates human error, prevents the accumulation of "zombie" tokens, and provides full transparency through a detailed audit trail.

## 🎯 The Problem Solved
*   **Unauthorized Access:** Without centralized tracking, tokens can be easily shared or misused by unauthorized individuals.
*   **Lack of Accountability:** If a token is compromised, there is no way to trace its origin or identify who accessed specific resources.
*   **Lifecycle Inefficiency:** Manually tracking expiration and revocation is prone to errors, often leaving expired credentials active.
*   **TMS Solution:** My system centralizes the entire lifecycle—generation, assignment, and revocation—providing a secure, automated, and auditable pipeline that ensures every token interaction is logged, verified, and strictly controlled.

## 🛡️ Security & Auditability
Security is the core pillar of the TMS architecture:
*   **Role-Based Access Control (RBAC):** Restricts system functionality and view access based on specific user roles (Admin, Teacher, Student).
*   **JWT-Based Authentication:** Ensures secure, stateless session management for all interactions.
*   **Audit Trail:** Every token lifecycle event is recorded in a centralized log, enabling administrators to track, search, and revoke tokens in real-time.

## 📂 Project Structure
*   **`src/app/`**: Angular frontend logic.
    *   **`pages/`**: View components (Login, Signup, Dashboards, Administration).
    *   **`shared/`**: Global UI components (Navbar, Footer, Error Handling).
    *   **`services/`**: API communication layer and state management.
*   **`tms-backend/`**: Node.js/Express server-side logic.
    *   **`models/`**: Mongoose schemas (User, Token, Event).
    *   **`middleware/`**: JWT-based security middleware for protecting API routes.

## 🛣️ Routes & Functionality

| Route | User Role | Detailed Features & User Actions |
| :--- | :--- | :--- |
| `/login` / `/signup` | Guest | Users can create an account or authenticate. New accounts default to 'Pending' status, preventing access until an Admin manually approves them. |
| `/admin` | Admin | **User Management:** Approve or reject pending registrations and assign specific roles. **System Logs:** Full access to audit logs and system-wide token tracking. |
| `/teacher` | Teacher | **Pipeline Management:** Create and manage educational token pipelines. **Event Oversight:** Monitor and organize system events and activity. |
| `/student` | Student | **Resource Access:** View and utilize tokens assigned to them within their specific active pipelines. |
| `/api/*` | System | Backend API endpoints that handle data processing, JWT authorization checks, and secure database CRUD operations for all user actions. |

## 🛠 Tech Stack
*   **Frontend**: Angular, Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Security**: JWT (JSON Web Tokens), Bcrypt.js
*   **Deployment**: Vercel

## 👥 Author
**Anish Kumar**
* [GitHub Profile](https://github.com/Anish9345)

---
*If you find this project helpful, feel free to ⭐ the repository!*
