# **App Name**: Nursify Portal

## Core Features:

- Authentication Pages: Implement login, registration, forgot password, and reset password flows.
- Role-Based Dashboards: Create separate dashboards for Admin, Nurse, Office Staff, and Patient roles, showing alerts and reminders (patient transfers, recertifications, acknowledgments, birthdays).
- User Management: Develop a user table with Active/Inactive filters, add/edit user modal with role assignments, and role-based permissions display. Also, add functionality to export users to Excel.
- Patient Management: Design tabs for Active, Discharged, and Transfer patients. Implement a patient profile with demographics, physician, insurance, and emergency contacts. Include functionality to assign clinicians to patients and filter by status and tags.
- Chat & Messaging: Develop a real-time chat interface (like WhatsApp/Slack) for internal staff and patient-facing communications. Include support for text, emojis, templates, and file attachments. Use distinct chat bubbles for patient messages and enable tagging inside messages.
- Smart referral assistant: Tool to assign staff to patients using LLM inference of geographic patient and staff data
- Notifications: Build a notifications panel with filters (unread, all). Implement desktop notifications and Do Not Disturb (DND) toggle per user.

## Style Guidelines:

- Primary color: HSL 197, 70%, 45% (corresponding to hex code #3bb0b0), suggesting reliability, health, and a sense of calm. Avoids money-cliche green but alludes to stability.
- Background color: HSL 197, 20%, 95% (corresponding to hex code #f2fafa), provides a light, clean backdrop.
- Accent color: HSL 167, 50%, 50% (corresponding to hex code #40bf80), which complements the primary, for calls to action.
- Body and headline font: 'Inter', a sans-serif font to provide a clean and modern user interface.
- Use consistent and clear icons from 'shadcn/ui' components.
- Maintain a clean and organized layout with a focus on responsive design to ensure a seamless user experience on various devices.
- Incorporate subtle animations for a smoother and more engaging user experience.