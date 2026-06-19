# Security Specification - DANUTHIA & CO Architecture

## Data Invariants
1. **Public Resources**: Portfolio projects, testimonials, and site assets (CMS) are public for reading but strictly admin-only for writing.
2. **Account Integrity**: A user can only access and modify their own profile (except for role/admin fields which are admin-only).
3. **Vault Security**: Documents in the vault belong to a specific client. Only that client and admins can read them.
4. **Communication**: Messages can only be read by the sender or receiver.
5. **Project State**: Milestones, updates, and invoices are managed by admins but visible to the relevant client.

## Logic Gates
- `isSignedIn()`: User must be authenticated.
- `isAdmin()`: User must be in the hardcoded admin list or have an entry in the `admins` collection or have role `admin` in `users` collection.
- `isOwner(uid)`: `request.auth.uid == uid`.
- `isValidId(id)`: Basic string validation for IDs.

## The "Dirty Dozen" Payloads (Denial Expected)
1. **Admin Escalation**: User tries to update their own role to 'admin' in `users/{uid}`.
2. **Project Hijack**: Non-admin tries to create or delete a project in `projects/`.
3. **CMS Poisoning**: Unauthenticated user tries to update `siteResources/hero_title`.
4. **Message Snooping**: User A tries to read messages between User B and Admin.
5. **Vault Theft**: Client A tries to read documents in `documents/` belonging to Client B.
6. **Fake Testimonial**: Unauthenticated user tries to inject a testimonial without review.
7. **Inbound Spam**: User tries to create 10,000 `bookingRequests` (Rate limiting usually handled by backend, but rules can restrict size).
8. **Orphaned Milestone**: User tries to create a milestone for a non-existent client ID.
9. **Role Modification**: User tries to add themselves to the `admins/` collection.
10. **State Skipping**: Non-admin tries to mark an invoice as 'paid'.
11. **Metadata Manipulation**: User tries to change `createdAt` on a shared document.
12. **PII Leak**: Non-admin tries to list all emails in the `newsletter` collection.

## Deployment Status
- Firestore Rules: Hardened setup in progress.
- Storage Rules: Hardened setup in progress.
