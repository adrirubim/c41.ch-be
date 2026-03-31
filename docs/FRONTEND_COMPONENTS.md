# Frontend Components Documentation

This document provides comprehensive documentation for all custom React components in the `c41.ch-be` application.

## Source of truth (important)

This project uses a split frontend architecture:

- **Implementation** lives in `src/*` (`src/shared`, `src/modules`, `src/core`).
- `resources/js/*` provides the Laravel/Inertia **view layer** and thin wrappers for stable `#app/*` import paths.

When a component is implemented in `src/*`, you may also find a thin wrapper under `resources/js/components/*` that forwards props or wires Laravel-specific concerns (for example, upload URLs).

## 📋 Table of Contents

- [Business Components](#business-components)
- [UI Components](#ui-components)
- [Layout Components](#layout-components)
- [Chart Components](#chart-components)
- [Skeleton Loaders](#skeleton-loaders)
- [Component Usage Examples](#component-usage-examples)

---

## Business Components

### RichTextEditor

A full-featured WYSIWYG editor built with Tiptap.

**Public import**: `#app/components/rich-text-editor`  
**Wrapper**: `resources/js/components/rich-text-editor.tsx`  
**Implementation**: `src/shared/components/rich-text-editor/RichTextEditor.tsx`

**Props**:
```typescript
interface RichTextEditorProps {
    content: string;                    // HTML content
    onChange: (content: string) => void; // Callback when content changes
    placeholder?: string;               // Placeholder text (default: "Write your content here...")
    showWordCount?: boolean;            // Show word/character counter (default: true)
}
```

**Features**:
- Bold, italic, lists, quotes
- Links with dialog
- Images with upload and preview
- Tables (insert, delete rows/columns)
- Code blocks and inline code
- Undo/redo
- Real-time word and character counting
- Image upload with progress tracking

**Usage**:
```tsx
import { RichTextEditor } from '#app/components/rich-text-editor';

function PostForm() {
    const [content, setContent] = useState('');
    
    return (
        <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your post content..."
            showWordCount={true}
        />
    );
}
```

---

### EditorPreview

Real-time preview component for post content.

**Location**: `resources/js/components/editor-preview.tsx`

**Props**:
```typescript
interface EditorPreviewProps {
    content: string;  // HTML content to preview
    title?: string;   // Optional title
}
```

**Usage**:
```tsx
import { EditorPreview } from '#app/components/editor-preview';

<EditorPreview content={htmlContent} title="Post Preview" />
```

---

### CommandPalette

Global search and command palette with keyboard shortcuts.

**Location**: `resources/js/components/command-palette.tsx`

**Features**:
- Keyboard shortcut: `Cmd/Ctrl + K`
- Search across posts, categories, and users
- Quick navigation
- Command execution

**Usage**:
```tsx
import { CommandPalette } from '#app/components/command-palette';

// Automatically available via keyboard shortcut
// Or render manually:
<CommandPalette />
```

---

### ConfirmDialog

Reusable confirmation dialog for destructive actions.

**Location**: `resources/js/components/confirm-dialog.tsx`

**Props**:
```typescript
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}
```

**Usage**:
```tsx
import { ConfirmDialog } from '#app/components/confirm-dialog';

const [open, setOpen] = useState(false);

<ConfirmDialog
    open={open}
    onOpenChange={setOpen}
    onConfirm={() => {
        // Delete action
        handleDelete();
        setOpen(false);
    }}
    title="Delete Post?"
    description="This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    variant="destructive"
/>
```

---

### TagsInput

Component for managing tags with validation.

**Location**: `resources/js/components/tags-input.tsx`

**Props**:
```typescript
interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    maxTags?: number;        // Maximum number of tags (default: 10)
    placeholder?: string;
    className?: string;
}
```

**Features**:
- Add tags by pressing Enter
- Remove tags by clicking X
- Maximum tag limit
- Duplicate prevention
- Validation

**Usage**:
```tsx
import { TagsInput } from '#app/components/tags-input';

const [tags, setTags] = useState<string[]>([]);

<TagsInput
    tags={tags}
    onChange={setTags}
    maxTags={10}
    placeholder="Type and press Enter to add..."
/>
```

---

### FloatingActionButton

Floating action button for quick actions.

**Location**: `resources/js/components/floating-action-button.tsx`

**Props**:
```typescript
interface FloatingActionButtonProps {
    label: string;
    href: string;
    icon?: React.ComponentType;
}
```

**Usage**:
```tsx
import { FloatingActionButton } from '#app/components/floating-action-button';
import { Plus } from 'lucide-react';

<FloatingActionButton
    label="Create Post"
    href="/posts/create"
    icon={Plus}
/>
```

---

### OptimizedPostList

Memoized component for displaying a list of posts.

**Location**: `resources/js/components/optimized-post-list.tsx`

**Props**:
```typescript
interface OptimizedPostListProps {
    posts: Post[];
    onView?: (post: Post) => void;
    onEdit?: (post: Post) => void;
    onDelete?: (post: Post) => void;
}
```

**Features**:
- React.memo for performance optimization
- Optimized re-renders
- Post actions (view, edit, delete)

**Usage**:
```tsx
import { OptimizedPostList } from '#app/components/optimized-post-list';

<OptimizedPostList
    posts={posts}
    onView={(post) => router.visit(`/posts/${post.id}`)}
    onEdit={(post) => router.visit(`/posts/${post.id}/edit`)}
    onDelete={(post) => handleDelete(post)}
/>
```

---

### EmptyState

Component for displaying empty states.

**Location**: `resources/js/components/empty-state.tsx`

**Props**:
```typescript
interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    icon?: React.ComponentType;
}
```

**Usage**:
```tsx
import { EmptyState } from '#app/components/empty-state';
import {FileText} from 'lucide-react';

<EmptyState
    title="No posts found"
    description="Get started by creating your first post."
    actionLabel="Create Post"
    actionHref="/posts/create"
    icon={FileText}
/>
```

---

### Toaster

Toast notification component.

**Location**: `resources/js/components/toaster.tsx`

**Usage**:
```tsx
import { Toaster } from '#app/components/toaster';
import { useToast } from '#app/hooks/use-toast';

function App() {
    const { toasts, removeToast } = useToast();
    
    return (
        <>
            {/* Your app content */}
            <Toaster toasts={toasts} onRemove={removeToast} />
        </>
    );
}
```

---

## UI Components

The application uses shadcn/ui components located in `resources/js/components/ui/`. These are standard Radix UI primitives with TailwindCSS styling.

### Available UI Components

- This list is intentionally **non-exhaustive**. The source of truth is the folder `resources/js/components/ui/`.
- Common components include: `alert.tsx`, `alert-dialog.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `collapsible.tsx`, `command.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `input-otp.tsx`, `label.tsx`, `navigation-menu.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `spinner.tsx`, `textarea.tsx`, `toast.tsx`, `toggle.tsx`, `toggle-group.tsx`, `tooltip.tsx`.

**Usage Example**:
```tsx
import { Button } from '#app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '#app/components/ui/card';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';

<Card>
    <CardHeader>
        <CardTitle>Form Title</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="space-y-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" />
            </div>
            <Button>Submit</Button>
        </div>
    </CardContent>
</Card>
```

---

## Layout Components

### AppSidebar

Application sidebar navigation.

**Location**: `resources/js/components/app-sidebar.tsx`

**Features**:
- Navigation items
- Active route highlighting
- Responsive design

---

### AppHeader

Application header with breadcrumbs and user menu.

**Location**: `resources/js/components/app-header.tsx`

**Props**:
```typescript
interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}
```

---

## Chart Components

Custom chart components built without external dependencies.

### BarChart

**Location**: `resources/js/components/charts/bar-chart.tsx`

**Props**:
```typescript
interface BarChartProps {
    data: Array<{ label: string; value: number }>;
    title?: string;
    height?: number;
}
```

**Usage**:
```tsx
import { BarChart } from '#app/components/charts/bar-chart';

<BarChart
    data={[
        { label: 'Jan', value: 10 },
        { label: 'Feb', value: 20 },
    ]}
    title="Monthly Posts"
    height={300}
/>
```

### PieChart

**Location**: `resources/js/components/charts/pie-chart.tsx`

**Props**:
```typescript
interface PieChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    title?: string;
    size?: number;
}
```

### LineChart

**Location**: `resources/js/components/charts/line-chart.tsx`

**Props**:
```typescript
interface LineChartProps {
    data: Array<{ label: string; value: number }>;
    title?: string;
    height?: number;
}
```

---

## Skeleton Loaders

Skeleton loader components for loading states.

### SkeletonCard

**Location**: `resources/js/components/skeleton-loaders/skeleton-card.tsx`

**Usage**:
```tsx
import { SkeletonCard } from '#app/components/skeleton-loaders';

{loading ? (
    <SkeletonCard />
) : (
    <PostCard post={post} />
)}
```

### SkeletonPostItem

**Location**: `resources/js/components/skeleton-loaders/skeleton-post-item.tsx`

### SkeletonPostDetail

**Location**: `resources/js/components/skeleton-loaders/skeleton-post-detail.tsx`

---

## Public Components

### PublicHeader

A public-facing header component for unauthenticated users, displayed on public pages.

**Location**: `resources/js/components/public-header.tsx`

**Features**:
- Logo on the left
- Navigation links (Home, Blog, Categories) in the center
- Guest (not authenticated): `Log in` and `Sign up` actions
- Authenticated admin (`is_admin=true`): `Dashboard`
- Authenticated regular user: `Account`
- On the landing page (`/`), mobile auth actions are shown only inside the hamburger menu dropdown (not on the sticky top bar)
- Responsive mobile menu with sheet component
- Sticky positioning with backdrop blur

**Usage**:
```tsx
import { PublicHeader } from '#app/components/public-header';

export default function PublicHome() {
    return (
        <div>
            <PublicHeader />
            {/* Page content */}
        </div>
    );
}
```

**Props**: None (uses `usePage` hook to access auth state)

---

## Component Usage Examples

### Complete Form Example

```tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { RichTextEditor } from '#app/components/rich-text-editor';
import { TagsInput } from '#app/components/tags-input';
import { Button } from '#app/components/ui/button';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#app/components/ui/select';

function PostForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [category, setCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/posts', {
            title,
            content,
            tags,
            category_id: category,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div>
                <Label>Content</Label>
                <RichTextEditor
                    content={content}
                    onChange={setContent}
                />
            </div>

            <div>
                <Label>Tags</Label>
                <TagsInput
                    tags={tags}
                    onChange={setTags}
                    maxTags={10}
                />
            </div>

            <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Technology</SelectItem>
                        <SelectItem value="2">Design</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit">Create Post</Button>
        </form>
    );
}
```

---

## Best Practices

1. **Use TypeScript**: All components are typed with TypeScript
2. **Follow Naming Conventions**: PascalCase for components
3. **Keep Components Small**: Single responsibility principle
4. **Use Composition**: Build complex UIs from simple components
5. **Memoization**: Use `React.memo` for expensive components
6. **Accessibility**: Include ARIA labels and keyboard navigation
7. **Error Handling**: Handle errors gracefully
8. **Loading States**: Always show loading states for async operations

---

### FloatingActionButton

A floating action button that adapts to the current route, showing the appropriate action.

**Location**: `resources/js/components/floating-action-button.tsx`

**Props**:
```typescript
interface FloatingActionButtonProps {
    href?: string;        // Custom href (optional, auto-detected if not provided)
    onClick?: () => void; // Custom click handler (optional)
    label?: string;       // Custom label (optional, auto-detected if not provided)
    className?: string;   // Additional CSS classes
}
```

**Features**:
- Automatically detects current route and shows appropriate action
- Shows "Create Post" on `/posts` and `/dashboard` routes
- Shows "Create Category" on `/categories` routes
- Responsive design (icon only on mobile, text + icon on desktop)
- Smooth animations and hover effects
- Fixed positioning in bottom-right corner

**Usage**:
```tsx
import { FloatingActionButton } from '#app/components/floating-action-button';

// Auto-detects route and shows appropriate button
<FloatingActionButton />

// Or with custom props
<FloatingActionButton 
    href="/custom/create"
    label="Create Custom"
/>
```

---

**Last Updated:** January 12, 2026  
**Version:** 2.0
