# UI Components Reference

A concise guide to all shared UI components in N3Fit. Import from the paths shown below.

---

## Quick Import

```js
// UI primitives
import { Button, Badge, Modal, Table, Avatar, Skeleton, TableSkeleton, PageSkeleton } from '../shared/components/ui';

// Confirm dialog
import ConfirmModal from '../shared/components/feedback/ConfirmModal';

// Toast notifications  (add <ToastProvider /> once in App.js)
import { showToast, ToastProvider } from '../shared/lib/toast';
```

---

## Setup — Add ToastProvider to App.js

```jsx
import { ToastProvider } from './shared/lib/toast';

function App() {
  return (
    <>
      <ToastProvider />   {/* ← add this once at the top */}
      <Routes> ... </Routes>
    </>
  );
}
```

---

## Button

```jsx
<Button>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
<Button variant="success">Approve</Button>
<Button variant="ghost">More</Button>
<Button variant="outline">Export</Button>

{/* With icon */}
<Button leftIcon={<PlusIcon />}>Add Member</Button>

{/* Loading skeleton (no spinner) */}
<Button loading>Saving…</Button>

{/* Sizes */}
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="xl" fullWidth>Full Width</Button>
```

**Variants:** `primary` `secondary` `ghost` `danger` `success` `outline`  
**Sizes:** `sm` `md` `lg` `xl` `icon-sm` `icon-md` `icon-lg`

---

## Badge

```jsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Expired</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="brand">Pro</Badge>
<Badge variant="gray">Inactive</Badge>
<Badge variant="blue">Scheduled</Badge>

{/* With dot */}
<Badge variant="success" dot>Online</Badge>
<Badge variant="error" dot size="lg">Overdue</Badge>
```

**Variants:** `brand` `success` `warning` `error` `gray` `blue` `purple` `orange`  
**Sizes:** `sm` `md` `lg`

---

## Modal

```jsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Modal</Button>

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Edit Member"
  description="Update member details below"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSave}>Save Changes</Button>
    </>
  }
>
  <p>Your form or content goes here.</p>
</Modal>
```

**Sizes:** `sm` `md` `lg` `xl` `full`

---

## ConfirmModal

Use for all delete/irreversible actions. Always give the user a clear title and message.

```jsx
const [showConfirm, setShowConfirm] = useState(false);
const [deleting, setDeleting] = useState(false);

<Button variant="danger" onClick={() => setShowConfirm(true)}>
  Delete Member
</Button>

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={async () => {
    setDeleting(true);
    await deleteMember(id);
    setDeleting(false);
    setShowConfirm(false);
    showToast.success("Member deleted successfully.");
  }}
  title="Delete Member"
  message="This will permanently remove the member and all their data. This cannot be undone."
  confirmText="Yes, Delete"
  cancelText="Keep Member"
  type="danger"
  loading={deleting}
/>
```

**Types:** `danger` (red) · `warning` (yellow) · `info` (blue) · `success` (green)

---

## Toast Notifications

Always use clear, plain-language messages. Avoid technical jargon.

```js
// ✅ After a successful action
showToast.success("Member added successfully!");
showToast.success("Payment recorded.");

// ❌ After something fails
showToast.error("Could not save changes. Please try again.");
showToast.error("Network error. Check your connection.");

// ⚠️ Non-blocking warnings
showToast.warning("This member's plan expires in 3 days.");
showToast.warning("Unsaved changes will be lost.");

// ℹ️ Neutral info
showToast.info("Changes saved as draft.");
showToast.info("Syncing data…");

// Custom duration (milliseconds)
showToast.success("Done!", { duration: 6000 });
```

---

## Table

```jsx
const columns = [
  {
    key: "name",
    label: "Member",
    render: (value, row) => (
      <Avatar name={value} src={row.photo} size="sm" />
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge variant={value === "active" ? "success" : "error"} dot>
        {value}
      </Badge>
    ),
  },
  { key: "plan",    label: "Plan"    },
  { key: "joined",  label: "Joined", align: "right" },
];

<Table
  columns={columns}
  data={members}
  loading={isLoading}          // shows TableSkeleton instead of data
  emptyText="No members found."
  onRowClick={(row) => navigate(`/members/${row.id}`)}
  skeletonRows={8}
/>
```

---

## Avatar

```jsx
<Avatar src={user.photo} name="Ali Hassan" size="md" />
<Avatar name="Sara Ali" size="lg" online />   {/* initials fallback + green dot */}
<Avatar name="Unknown" size="sm" />
```

**Sizes:** `xs` `sm` `md` `lg` `xl`

---

## Skeleton Loaders (use everywhere instead of spinners)

```jsx
import {
  Skeleton,
  SkeletonText,
  CardSkeleton,
  TableSkeleton,
  AvatarSkeleton,
  FormSkeleton,
  StatCardSkeleton,
  PageSkeleton,
} from '../shared/components/ui';

// Single block
<Skeleton className="h-10 w-full rounded-lg" />

// Multi-line text
<SkeletonText lines={4} />

// Card placeholder
{loading ? <CardSkeleton /> : <MemberCard />}

// Table placeholder
{loading ? <TableSkeleton rows={8} cols={5} /> : <MyTable />}

// Avatar + name/email placeholder
<AvatarSkeleton size="md" />

// Form placeholder
<FormSkeleton fields={5} />

// Dashboard stat card placeholder
<StatCardSkeleton />

// Entire page placeholder (stat cards + table)
if (loading) return <PageSkeleton stats={4} tableRows={8} tableCols={5} />;
```

---

## Writing Good User Messages

| ❌ Don't write                        | ✅ Write instead                              |
|--------------------------------------|----------------------------------------------|
| "Error: 422 Unprocessable Entity"    | "Please fill in all required fields."        |
| "Successfully POSTed to /api/member" | "Member added successfully!"                 |
| "Null reference exception"           | "Something went wrong. Please try again."    |
| "Are you sure? This is irreversible" | "Delete Member? This cannot be undone."      |
| "Loading..."                        | *(use a skeleton loader, no text needed)*    |
