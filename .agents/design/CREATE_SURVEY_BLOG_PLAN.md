# Implementation Plan: Create Survey & Create Blog Pages

> Created: 2026-06-04
> Context: Surveyor dashboard is missing "Create Survey" and "Create Blog" pages.
> Existing buttons link to wrong pages or have no handlers.

---

## What Exists Today

| Item | Status | Notes |
|------|--------|-------|
| Survey Model | ✅ Exists | `backend/models/Survey.js` — full schema with questions, status (draft/published), etc. |
| Blog Model | ✅ Exists | `backend/models/Blog.js` — title, content, surveyId, status |
| Survey Routes | ⚠️ Read-only | `GET /` and `GET /:id` + respond/feedback — **no create/update/delete** |
| Blog Routes | ⚠️ Read-only | `GET /` and `GET /:id` + react/comment — **no create/update/delete** |
| Create Survey Page | ❌ Missing | No form/builder exists anywhere |
| Create Blog Page | ❌ Missing | No editor form exists anywhere |
| "Create Survey" button (MySurveys) | 🔴 Broken | Calls `navigate("/surveys")` but `navigate` is undefined (bug) |
| "Create Survey" button (SurveyorDashboard) | ⚠️ Wrong link | Links to `/dashboard/surveys` (the listing page, not creation) |
| "New Blog Post" button (BlogStudio) | 🔴 No handler | Button exists but has no `onClick` |
| Frontend mutation hooks | ❌ Missing | No hooks for creating surveys/blogs |
| CSS form styles | ✅ Exists | `.form-input`, `.form-label`, `.form-error` in `index.css` |
| CSS question styles | ✅ Exists | `.question-card`, `.mcq-option`, `.linear-scale-btn`, `.char-counter` |
| react-hook-form | ✅ Installed | v7.75 |
| sweetalert2 | ✅ Installed | v11.26 |
| Rich text editor | ❌ Not installed | Not needed — user said textarea is fine |

---

## Files to Create (4)

### 1. `frontend/src/Components/Surveys/CreateSurvey.jsx`
The main create survey page component.

**Layout:** Split-pane per DESIGN.md §8.3

```
Left Panel (w-80, border-r, overflow-y-auto):
  ├── Survey meta form (scrollable):
  │     ├── Title (form-input, required)
  │     ├── Description (textarea, optional)
  │     ├── Use Case (input, max 20 words)
  │     ├── Category (select dropdown)
  │     ├── Deadline (text input, e.g. "2026-12-31")
  │     └── Cover Image URL (input, optional)
  ├── Divider
  └── Question List:
        ├── Each question card (clickable, shows mini preview)
        │     ├── "Q1" label + question type badge
        │     ├── Question text (truncated)
        │     └── Delete button (trash icon)
        └── "Add Question" button (sticky bottom)

Right Panel (flex-1, overflow-y-auto):
  ├── Live Preview area:
  │     ├── Survey header preview (title, description, category)
  │     └── All questions rendered in preview mode
  └── Sticky bottom action bar:
        ├── Left: Draft saved indicator (✓ Saved) — shows briefly on save
        ├── Center: "Save Draft" (ghost button, also triggered by Ctrl+S)
        └── Right: "Publish" button (btn-surveyor, disabled until valid)
```

**Question Builder (modal or inline):**
When "Add Question" is clicked, show a form to configure:
- Question label (text input, required)
- Question type (select: Short Answer, Paragraph, Multiple Choice, Checkbox, Linear Scale)
- Options (for MCQ/Checkbox): dynamic list with add/remove
- Required toggle (checkbox)
- "Add Question" button to confirm

**Save Draft Logic:**
- `POST /api/surveys` with `status: 'draft'`
- On success: SweetAlert2 toast "Draft saved successfully" (top-right, timer: 2000)
- Ctrl+S keyboard shortcut triggers draft save
- Show "✓ Saved" indicator at top-right after save

**Publish Logic (stretch — can be simple for now):**
- `POST /api/surveys` with `status: 'published'`
- Requires: title, deadline, at least 1 question
- SweetAlert2 confirmation dialog before publishing

**Key implementation details:**
- Uses `useCreateSurvey()` mutation hook
- Uses `useProfile()` to get surveyorId (from user.email lookup on backend)
- Question IDs: generated client-side with `crypto.randomUUID()` or `Date.now().toString()`
- Form state managed with `useState` (not react-hook-form — the split-pane with live preview is easier with controlled state)
- AnimatePresence for question add/remove animations

---

### 2. `frontend/src/Components/Blogs/CreateBlog.jsx`
The main create blog page component.

**Layout:** Centered single-column (max-w-3xl), simple and clean.

```
Header:
  ├── "Create Blog Post" (heading-lg)
  └── Back button (ghost, navigates back)

Form (card):
  ├── Title (form-input, required)
  ├── Linked Survey (select dropdown — fetches published surveys from useDashboardSurveyor)
  │     └── Optional: "None" option for unlinked blogs
  ├── Content (textarea, min-h-[400px], required)
  │     └── Helper: "Write your blog post content here. Markdown is supported."
  └── Actions:
        ├── "Save Draft" (ghost button) — saves with status logic TBD (Blog model only has 'active'/'banned')
        └── "Publish" (btn-surveyor primary)
```

**Note:** The Blog model only has `status: ['active', 'banned']` — there's no 'draft' status. Two options:
- **Option A:** Add 'draft' to the Blog model's status enum (requires backend change)
- **Option B:** Only allow direct publish (simpler, no draft)

**Recommendation:** Option A — add 'draft' to Blog model status enum. This is a small change and gives surveyors flexibility.

**Key implementation details:**
- Uses `useCreateBlog()` mutation hook
- Gets `surveyorEmail` from `user.email` (AuthContext)
- Fetches published surveys for the linked survey dropdown
- SweetAlert2 on successful save/publish

---

### 3. `frontend/src/Hooks/useSurveysMutation.js`
Mutation hooks for survey CRUD.

```javascript
// Exports:
// useCreateSurvey() — POST /api/surveys
// useUpdateSurvey(id) — PUT /api/surveys/:id
// useDeleteSurvey() — DELETE /api/surveys/:id

// Pattern follows useBlogs.jsx:
// - useMutation with axiosSecure
// - queryClient.invalidateQueries on success
// - Returns { mutate, mutateAsync, isPending, error }
```

---

### 4. `frontend/src/Hooks/useBlogsMutation.js`
Mutation hooks for blog CRUD.

```javascript
// Exports:
// useCreateBlog() — POST /api/blogs
// useUpdateBlog(id) — PUT /api/blogs/:id
// useDeleteBlog() — DELETE /api/blogs/:id

// Same pattern as useSurveysMutation.js
```

---

## Files to Modify (6)

### 5. `backend/routes/surveyRoutes.js`
Add 3 new routes at the top (before the `GET /` route):

```javascript
// POST /api/surveys — Create survey (draft or published)
// Auth: verifyToken + verifySurveyor
// Body: { title, description, useCase, category, deadline, image, questions, status }
// Logic: Look up user by email → use user._id as surveyorId → save survey

// PUT /api/surveys/:id — Update survey
// Auth: verifyToken + verifySurveyor
// Body: partial fields to update
// Logic: Verify ownership (surveyorId matches) → update

// DELETE /api/surveys/:id — Delete survey
// Auth: verifyToken + verifySurveyor
// Logic: Verify ownership → delete
```

**Key detail:** The `verifyToken` middleware sets `req.decoded.email`. To get the surveyor's `_id` for `surveyorId`, we need to look up the User by email:
```javascript
const user = await User.findOne({ email: req.decoded.email }).lean();
// then use user._id as surveyorId
```

---

### 6. `backend/routes/blogRoutes.js`
Add 3 new routes:

```javascript
// POST /api/blogs — Create blog post
// Auth: verifyToken + verifySurveyor
// Body: { title, content, surveyId (optional) }
// Logic: Set surveyorEmail from req.decoded.email → save blog

// PUT /api/blogs/:id — Update blog
// Auth: verifyToken + verifySurveyor
// Logic: Verify ownership (surveyorEmail matches) → update

// DELETE /api/blogs/:id — Delete blog
// Auth: verifyToken + verifySurveyor
// Logic: Verify ownership → delete
```

---

### 7. `backend/models/Blog.js`
Add 'draft' to the status enum:

```javascript
// Change:
status: { type: String, enum: ['active', 'banned'], default: 'active' }
// To:
status: { type: String, enum: ['draft', 'active', 'banned'], default: 'draft' }
```

---

### 8. `frontend/src/Pages/Dashboard/DashboardSection.jsx`
Add new sections to `SURVEYOR_SECTIONS`:

```javascript
// Add imports:
import CreateSurvey from "../../Components/Surveys/CreateSurvey";
import CreateBlog from "../../Components/Blogs/CreateBlog";

// Update SURVEYOR_SECTIONS:
const SURVEYOR_SECTIONS = {
  overview: SurveyorOverview,
  surveys: MySurveys,
  "create-survey": CreateSurvey,  // NEW
  analytics: AiAnalytics,
  "blog-studio": BlogStudio,
  "create-blog": CreateBlog,      // NEW
  "feedback-inbox": FeedbackInbox,
};
```

---

### 9. `frontend/src/Pages/Dashboard/Surveyor/SurveyorDashboard.jsx`
Fix the "Create Survey" button to link to the new create page:

```jsx
// Change:
<Link to="/dashboard/surveys" ...>
// To:
<Link to="/dashboard/create-survey" ...>
```

---

### 10. `frontend/src/Pages/Dashboard/Surveyor/Components/MySurveys.jsx`
Fix the "Create Survey" button:

```jsx
// Change:
<button onClick={() => navigate("/surveys")} ...>
// To:
<button onClick={() => navigate("/dashboard/create-survey")} ...>
// (also ensure useNavigate is properly assigned: const navigate = useNavigate())
```

---

### 11. `frontend/src/Pages/Dashboard/Surveyor/Components/BlogStudio.jsx`
Wire the "New Blog Post" button:

```jsx
// Add: import { useNavigate } from "react-router";
// Add: const navigate = useNavigate();
// Change:
<button className="btn btn-surveyor btn-sm flex items-center gap-2">
// To:
<button onClick={() => navigate("/dashboard/create-blog")} className="btn btn-surveyor btn-sm flex items-center gap-2">
```

---

### 12. `frontend/src/Layout/DashboardLayout.jsx`
Add nav items for the new sections (optional — could keep them accessible only via buttons, not sidebar):

**Recommendation:** Do NOT add to sidebar nav. Keep create pages accessible only via the "Create Survey" and "New Blog Post" buttons. This keeps the sidebar clean and avoids clutter.

---

## Implementation Order

| Step | Files | Description |
|------|-------|-------------|
| 1 | `Blog.js` | Add 'draft' to Blog model status enum |
| 2 | `surveyRoutes.js` | Add POST/PUT/DELETE routes for surveys |
| 3 | `blogRoutes.js` | Add POST/PUT/DELETE routes for blogs |
| 4 | `useSurveysMutation.js` | Create mutation hooks for surveys |
| 5 | `useBlogsMutation.js` | Create mutation hooks for blogs |
| 6 | `CreateSurvey.jsx` | Build the create survey page |
| 7 | `CreateBlog.jsx` | Build the create blog page |
| 8 | `DashboardSection.jsx` | Add new section mappings |
| 9 | `SurveyorDashboard.jsx` | Fix "Create Survey" button link |
| 10 | `MySurveys.jsx` | Fix "Create Survey" button + navigate bug |
| 11 | `BlogStudio.jsx` | Wire "New Blog Post" button |

---

## Design Tokens & Patterns to Follow

- **Surveyor accent:** `--color-surveyor`, `--color-surveyor-dark`, `--color-surveyor-light`
- **Motion variants:** Use `container`/`item` stagger pattern from all dashboard components
- **Card:** `bg-white border border-[--color-border] rounded-xl shadow-[--shadow-sm]`
- **Form inputs:** Use existing `.form-input`, `.form-label`, `.form-error` CSS classes
- **Question cards:** Use existing `.question-card` CSS class
- **Buttons:** `btn btn-surveyor btn-md` (primary), `btn btn-secondary btn-md` (secondary), ghost for draft
- **SweetAlert2:** `Swal.fire({ icon: 'success', title: 'Draft Saved', timer: 2000, showConfirmButton: false, position: 'top-end' })`
- **Container:** `container-app mx-auto px-4 lg:px-8 py-6 lg:py-8` (inside dashboard main)
- **Page wrapper:** Wrap in `<PageTransition>` for consistent page transitions

---

## Open Questions (Resolved)

1. **Q: Should create pages be in sidebar nav?** A: No — accessible only via buttons. Keeps sidebar clean.
2. **Q: Blog draft support?** A: Yes — add 'draft' to Blog model status enum.
3. **Q: Rich text editor for blog?** A: No — plain textarea with markdown support note. User confirmed.
4. **Q: Auto-save drafts?** A: No — manual save only (Ctrl+S or button click). User confirmed.
5. **Q: AI insights in survey builder?** A: No — user said to skip that part.
6. **Q: Package needed?** A: No new packages required. react-hook-form and sweetalert2 already installed.
