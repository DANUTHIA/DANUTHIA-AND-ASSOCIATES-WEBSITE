# Security Specification - Danuthia & Associates

## Data Invariants
1. A user can only belong to one primary role at a time.
2. A project must always be associated with a valid Client ID.
3. Access to project-specific data (updates, milestones, documents) is restricted to the client owner, assigned staff, or administrators.
4. Staff roles (except Admin) can only access projects they are explicitly assigned to.
5. Invoices and Financial Ledgers are restricted to Financial Analysts, Project Managers, and Admins.
6. A user with 'pending' or 'pending_staff' role has ZERO access to portal features until upgraded by an Admin.
7. Identity fields (assignedPM, assignedStaff, role) are immutable for the resource owner.

## The "Dirty Dozen" Payloads (Attack Vectors)

### 1. The Identity Spoof (Privilege Escalation)
**Target**: `users/{myUid}`
**Payload**: `{ "role": "admin" }`
**Expected**: `PERMISSION_DENIED` - Users cannot set their own role.

### 2. The Relationship Hijack (Self-Assignment)
**Target**: `users/{someClientId}`
**Payload**: `{ "assignedPM": "attackerUid" }`
**Expected**: `PERMISSION_DENIED` - Only admins can assign PMs.

### 3. The Shadow Update (Hidden Fields)
**Target**: `projects/{clientId}`
**Payload**: `{ "budgetUtilized": 9999999, "isVerified": true }` (where `isVerified` is not in schema)
**Expected**: `PERMISSION_DENIED` - `hasOnlyAllowedFields` should reject the extra field.

### 4. The Resource Poisoning (Denial of Wallet)
**Target**: `technicalReports`
**Payload**: `{ "title": "A".repeat(100000) }`
**Expected**: `PERMISSION_DENIED` - String sizes must be strictly capped.

### 5. The Terminal State Shortcut
**Target**: `internalLogs`
**Payload**: `{ "status": "reviewed" }` (sent by staff member who created the log)
**Expected**: `PERMISSION_DENIED` - Only PM/Admin can review logs.

### 6. The PII Leak (Unauthorized Read)
**Target**: `users/{randomUserUid}`
**Request**: `get()`
**Expected**: `PERMISSION_DENIED` - Only if I am the owner or authorized staff/admin.

### 7. The Orphan Record (Dangling Reference)
**Target**: `projectUpdates`
**Payload**: `{ "clientId": "nonExistentId", ... }`
**Expected**: `PERMISSION_DENIED` - `exists()` must verify the client exists.

### 8. The Temporal Warp (Client-Side Timestamps)
**Target**: `invoices`
**Payload**: `{ "createdAt": "2020-01-01T00:00:00Z" }`
**Expected**: `PERMISSION_DENIED` - Must use `request.time`.

### 9. The Cross-Project Scrape (Query Trust)
**Target**: `documents`
**Request**: `list()` where `clientId != request.auth.uid`
**Expected**: `PERMISSION_DENIED` - Rules must enforce `resource.data.clientId == request.auth.uid`.

### 10. The Biometric Bloat (Oversized Base64)
**Target**: `users/{myUid}`
**Payload**: `{ "photoUrl": "A".repeat(5 * 1024 * 1024) }`
**Expected**: `PERMISSION_DENIED` - `photoUrl` must be capped (e.g., 1MB).

### 11. The Newsletter Spam
**Target**: `newsletter`
**Payload**: `{ "email": "not-an-email" }`
**Expected**: `PERMISSION_DENIED` - Regex validation must pass.

### 12. The Staff Spoof (Email Mimicry)
**Target**: `internalLogs`
**Payload**: `{ "staffName": "admin@example.com" }` (but `request.auth.token.email` is different)
**Expected**: `PERMISSION_DENIED` - `staffName` must strictly match `request.auth.token.email`.

## Audit Summary & Conflict Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| users | Capped | Admin Only | Strict Fields |
| projects | Staff/Admin | Staff/Admin | Strict Fields |
| messages | strict senderId | Read status gated | Capped text |
| documents | Assigned Only | Immutable | Capped size |
| bookingRequests | Anonymous only | Admin only | Capped size |
