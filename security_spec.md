# Security Specification — JEE MISSION 21

## 1. Data Invariants

1. **Strict Ownership Isolation (PII & Subcollection Master Gate):**
   - Every user profile `/users/{uid}` and every subcollection document (`dailyProgress`, `subjects`, `chapters`, `lectures`, `tasks`, `notes`) belongs exclusively to `request.auth.uid == uid`.
   - Subcollection single-document writes and reads (`get`, `create`, `update`, `delete`) require the parent `/users/{uid}` document to exist via `exists(/databases/$(database)/documents/users/$(uid))`.
   - `list` queries on subcollections enforce `isSignedIn() && isVerified() && request.auth.uid == uid && resource.data.uid == request.auth.uid` without `get()`/`exists()` inside `list` to prevent $O(n)$ read cost explosions.
2. **Email Verification Mandate:**
   - All standard read and write operations require `request.auth.token.email_verified == true`.
3. **Path Variable Hardening:**
   - Every document ID variable (`{uid}`, `{date}`, `{subjectId}`, `{chapterId}`, `{lectureId}`, `{taskId}`, `{noteId}`) is validated via `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`) on `get`, `create`, `update`, and `delete`.
4. **Validation Blueprints & Anti-Update-Gap:**
   - Every `create` and `update` invokes `isValid[Entity](incoming())`, enforcing exact key sets (`hasAll` + `hasOnly`), field types, string `.size()` limits, numeric bounds, and `incoming().uid == request.auth.uid`.
   - Every `update` uses action-based `incoming().diff(existing()).affectedKeys().hasOnly(...)`, enforces immutability of `uid` and `createdAt`, and mandates `incoming().updatedAt == request.time`.
5. **Temporal Integrity:**
   - `createdAt == request.time` on `create`; `updatedAt == request.time` on `create` and `update`.

---

## 2. The "Dirty Dozen" Payloads

1. **Unverified Email Write Spoof:** Authenticated user with `email_verified: false` attempts to create `/users/user_1`.
2. **Cross-Tenant PII Read:** Authenticated `user_2` attempts `get` on `/users/user_1`.
3. **Identity Spoofing on Lecture Create:** `user_1` creates `/users/user_1/lectures/lec_1` with `uid: "user_2"`.
4. **Orphaned Subcollection Write:** `user_1` attempts to create `/users/user_1/lectures/lec_1` before `/users/user_1` exists.
5. **Shadow Field Injection on Create:** `user_1` creates `/users/user_1/tasks/task_1` with an extra field `isAdmin: true`.
6. **Shadow Field Injection on Update:** `user_1` updates `/users/user_1/lectures/lec_1` adding `hacked: "yes"`.
7. **Immutable Field Mutation (`createdAt`):** `user_1` updates `/users/user_1/notes/note_1` with a modified `createdAt` timestamp.
8. **Immutable Field Mutation (`uid`):** `user_1` updates `/users/user_1/chapters/ch_1` changing `uid` to `"user_2"`.
9. **Client Timestamp Forgery:** `user_1` creates `/users/user_1/dailyProgress/2026-11-07` with a past/future `createdAt` != `request.time`.
10. **Denial-of-Wallet String Overflow:** `user_1` creates `/users/user_1/notes/note_1` with a `content` string of 10,000 characters (`maxLength` is 5000).
11. **ID Poisoning Attack:** `user_1` attempts to create a lecture with invalid characters in `{lectureId}` (`"lec$1/bad"`).
12. **Unauthorized Cross-User List Scrape:** `user_2` attempts `list` on `/users/user_1/lectures`.
