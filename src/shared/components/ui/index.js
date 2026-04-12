// ─── UI Components ─────────────────────────────────────────────────────────────
// All shared UI building blocks. Import from this file throughout the app.
//
// Usage:
//   import { Button, Badge, Modal, Table, Avatar } from '../shared/components/ui';
//   import ConfirmModal from '../shared/components/feedback/ConfirmModal';
//   import { showToast, ToastProvider } from '../shared/lib/toast';

// Buttons
export { Button } from "./Button";

// Cards
export { Card, CardHeader, CardContent } from "./Card";

// Form
export { Input } from "./Input";

// Badge / status labels
export { Badge } from "./Badge";

// Loading skeletons + ButtonSpinner (use instead of all circular spinners)
export {
    Skeleton,
    SkeletonText,
    CardSkeleton,
    TableSkeleton,
    AvatarSkeleton,
    FormSkeleton,
    StatCardSkeleton,
    PageSkeleton,
    ProfileSkeleton,
    ButtonSpinner,
} from "./Skeleton";

// Modal dialog
export { Modal } from "./Modal";

// Data table
export { Table } from "./Table";

// User avatar
export { Avatar } from "./Avatar";
