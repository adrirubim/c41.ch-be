# Custom Hooks Documentation

This document provides comprehensive documentation for all custom React hooks in the C41.ch Backend application.

## 📋 Table of Contents

- [useToast](#usetoast)
- [useAutosave](#useautosave)
- [useFilterPresets](#usefilterpresets)
- [useKeyboardShortcuts](#usekeyboardshortcuts)
- [useLoadingState](#useloadingstate)
- [useAppearance](#useappearance)
- [useMobile](#usemobile)
- [useClipboard](#useclipboard)
- [useInitials](#useinitials)
- [useActiveUrl](#useactiveurl)
- [useMobileNavigation](#usemobilenavigation)
- [useTwoFactorAuth](#usetwofactorauth)
- [Hook Usage Examples](#hook-usage-examples)

---

## useToast

Toast notification hook for displaying temporary messages.

**Location**: `resources/js/hooks/use-toast.tsx`

**Returns**:
```typescript
{
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}
```

**Toast Interface**:
```typescript
interface Toast {
    id: string;
    title: string;
    description: string;
    variant: 'default' | 'destructive' | 'success';
}
```

**Features**:
- Automatic flash message handling from Inertia
- Auto-dismiss after 5 seconds
- Duplicate prevention
- Multiple toast support

**Usage**:
```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
    const { addToast, toasts, removeToast } = useToast();

    const handleSuccess = () => {
        addToast({
            title: 'Success',
            description: 'Post created successfully!',
            variant: 'success',
        });
    };

    const handleError = () => {
        addToast({
            title: 'Error',
            description: 'Something went wrong.',
            variant: 'destructive',
        });
    };

    return (
        <>
            <button onClick={handleSuccess}>Show Success</button>
            <button onClick={handleError}>Show Error</button>
        </>
    );
}
```

---

## useAutosave

Automatic draft saving hook with localStorage persistence.

**Location**: `resources/js/hooks/use-autosave.tsx`

**Parameters**:
```typescript
interface UseAutosaveOptions {
    data: Record<string, any>;  // Data to save
    storageKey: string;          // localStorage key
    interval?: number;            // Save interval in ms (default: 30000)
    enabled?: boolean;            // Enable/disable autosave (default: true)
    onSave?: () => void;          // Callback after save
}
```

**Returns**:
```typescript
{
    saveDraft: () => void;        // Manual save function
    isSaving: boolean;            // Saving state
    lastSaved: Date | null;       // Last save timestamp
    clearAutosave: () => void;    // Clear saved draft
}
```

**Features**:
- Automatic saving at intervals
- localStorage persistence
- Change detection (only saves if data changed)
- Manual save function
- Clear function

**Usage**:
```tsx
import { useAutosave } from '@/hooks/use-autosave';

function PostEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const { isSaving, lastSaved, clearAutosave } = useAutosave({
        data: { title, content },
        storageKey: 'post-draft-123',
        interval: 30000, // 30 seconds
        enabled: true,
        onSave: () => {
            console.log('Draft saved');
        },
    });

    const handlePublish = () => {
        clearAutosave(); // Clear draft after publishing
        // Publish post...
    };

    return (
        <div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            {isSaving && <span>Saving...</span>}
            {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
        </div>
    );
}
```

---

## useFilterPresets

Hook for managing filter presets with localStorage persistence.

**Location**: `resources/js/hooks/use-filter-presets.tsx`

**Returns**:
```typescript
{
    presets: FilterPreset[];
    savePreset: (name: string, filters: Record<string, any>) => FilterPreset;
    deletePreset: (id: string) => void;
    applyPreset: (id: string) => Record<string, any> | null;
}
```

**FilterPreset Interface**:
```typescript
interface FilterPreset {
    id: string;
    name: string;
    filters: Record<string, any>;
    createdAt: Date;
}
```

**Features**:
- Save filter configurations
- Load presets from localStorage
- Apply saved presets
- Delete presets

**Usage**:
```tsx
import { useFilterPresets } from '@/hooks/use-filter-presets';

function PostFilters() {
    const [filters, setFilters] = useState({});
    const { presets, savePreset, deletePreset, applyPreset } = useFilterPresets();

    const handleSavePreset = () => {
        const name = prompt('Preset name:');
        if (name) {
            savePreset(name, filters);
        }
    };

    const handleApplyPreset = (presetId: string) => {
        const presetFilters = applyPreset(presetId);
        if (presetFilters) {
            setFilters(presetFilters);
        }
    };

    return (
        <div>
            <button onClick={handleSavePreset}>Save Preset</button>
            {presets.map((preset) => (
                <div key={preset.id}>
                    <span>{preset.name}</span>
                    <button onClick={() => handleApplyPreset(preset.id)}>Apply</button>
                    <button onClick={() => deletePreset(preset.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}
```

---

## useKeyboardShortcuts

Hook for managing keyboard shortcuts.

**Location**: `resources/js/hooks/use-keyboard-shortcuts.tsx`

**Parameters**:
```typescript
interface KeyboardShortcut {
    key: string;                    // Key to press
    ctrlKey?: boolean;              // Require Ctrl (Windows/Linux)
    metaKey?: boolean;              // Require Cmd (Mac)
    shiftKey?: boolean;             // Require Shift
    altKey?: boolean;               // Require Alt
    callback: () => void;           // Callback function
    preventDefault?: boolean;       // Prevent default behavior (default: true)
}
```

**Usage**:
```tsx
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function MyComponent() {
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrlKey: true,
            metaKey: true, // Works on both Ctrl (Windows) and Cmd (Mac)
            callback: () => {
                // Open command palette
                setCommandPaletteOpen(true);
            },
        },
        {
            key: 'n',
            ctrlKey: true,
            metaKey: true,
            callback: () => {
                // Create new post
                router.visit('/posts/create');
            },
        },
    ]);

    return <div>Press Cmd/Ctrl+K to open command palette</div>;
}
```

---

## useLoadingState

Hook for managing loading states.

**Location**: `resources/js/hooks/use-loading-state.tsx`

**Returns**:
```typescript
{
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
    setLoading: (loading: boolean) => void;
}
```

**Usage**:
```tsx
import { useLoadingState } from '@/hooks/use-loading-state';

function MyComponent() {
    const { isLoading, startLoading, stopLoading } = useLoadingState();

    const handleSubmit = async () => {
        startLoading();
        try {
            await submitForm();
        } finally {
            stopLoading();
        }
    };

    return (
        <div>
            {isLoading ? (
                <Spinner />
            ) : (
                <button onClick={handleSubmit}>Submit</button>
            )}
        </div>
    );
}
```

---

## useAppearance

Hook for managing theme/appearance (light/dark mode).

**Location**: `resources/js/hooks/use-appearance.tsx`

**Returns**:
```typescript
{
    appearance: 'light' | 'dark' | 'system';
    resolvedAppearance: 'light' | 'dark';
    updateAppearance: (mode: 'light' | 'dark' | 'system') => void;
}
```

**Features**:
- System preference detection
- localStorage persistence
- Cookie persistence for SSR
- Automatic theme application

**Usage**:
```tsx
import { useAppearance } from '@/hooks/use-appearance';

function ThemeToggle() {
    const { appearance, resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <select value={appearance} onChange={(e) => updateAppearance(e.target.value as any)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
        </select>
    );
}
```

---

## useMobile

Hook for detecting mobile devices.

**Location**: `resources/js/hooks/use-mobile.tsx`

**Returns**:
```typescript
{
    isMobile: boolean;
}
```

**Usage**:
```tsx
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
    const { isMobile } = useMobile();

    return (
        <div>
            {isMobile ? (
                <MobileLayout />
            ) : (
                <DesktopLayout />
            )}
        </div>
    );
}
```

---

## useClipboard

Hook for clipboard operations.

**Location**: `resources/js/hooks/use-clipboard.ts`

**Returns**:
```typescript
[
    copied: boolean,           // Whether text was copied
    copy: (text: string) => void  // Copy function
]
```

**Usage**:
```tsx
import { useClipboard } from '@/hooks/use-clipboard';

function CopyButton({ text }: { text: string }) {
    const [copied, copy] = useClipboard();

    return (
        <button onClick={() => copy(text)}>
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}
```

---

## useInitials

Hook for generating user initials from full name.

**Location**: `resources/js/hooks/use-initials.tsx`

**Returns**:
```typescript
(name: string) => string
```

**Usage**:
```tsx
import { useInitials } from '@/hooks/use-initials';

function UserAvatar({ name }: { name: string }) {
    const getInitials = useInitials();

    return (
        <div className="avatar">
            {getInitials(name)}
        </div>
    );
}
```

---

## useActiveUrl

Hook for checking if a URL is active.

**Location**: `resources/js/hooks/use-active-url.ts`

**Returns**:
```typescript
(url: string) => boolean
```

**Usage**:
```tsx
import { useActiveUrl } from '@/hooks/use-active-url';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const isActive = useActiveUrl();

    return (
        <Link
            href={href}
            className={isActive(href) ? 'active' : ''}
        >
            {children}
        </Link>
    );
}
```

---

## useMobileNavigation

Hook for managing mobile navigation state.

**Location**: `resources/js/hooks/use-mobile-navigation.ts`

**Returns**:
```typescript
{
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: () => void;
}
```

**Usage**:
```tsx
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

function MobileNav() {
    const { isOpen, toggle, close } = useMobileNavigation();

    return (
        <>
            <button onClick={toggle}>Menu</button>
            {isOpen && (
                <nav>
                    {/* Navigation items */}
                    <button onClick={close}>Close</button>
                </nav>
            )}
        </>
    );
}
```

---

## useTwoFactorAuth

Hook for managing two-factor authentication.

**Location**: `resources/js/hooks/use-two-factor-auth.ts`

**Returns**:
```typescript
{
    enabled: boolean;
    enable: () => Promise<void>;
    disable: () => Promise<void>;
    // ... other 2FA methods
}
```

**Usage**:
```tsx
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';

function SecuritySettings() {
    const { enabled, enable, disable } = useTwoFactorAuth();

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => {
                        if (e.target.checked) {
                            enable();
                        } else {
                            disable();
                        }
                    }}
                />
                Enable Two-Factor Authentication
            </label>
        </div>
    );
}
```

---

## Hook Usage Examples

### Combined Hook Usage

```tsx
import { useToast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/use-autosave';
import { useLoadingState } from '@/hooks/use-loading-state';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function PostEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { addToast } = useToast();
    const { isLoading, startLoading, stopLoading } = useLoadingState();

    // Autosave draft
    useAutosave({
        data: { title, content },
        storageKey: 'post-draft',
        interval: 30000,
    });

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 's',
            ctrlKey: true,
            metaKey: true,
            callback: async () => {
                startLoading();
                try {
                    await savePost();
                    addToast({
                        title: 'Saved',
                        description: 'Post saved successfully!',
                        variant: 'success',
                    });
                } catch (error) {
                    addToast({
                        title: 'Error',
                        description: 'Failed to save post.',
                        variant: 'destructive',
                    });
                } finally {
                    stopLoading();
                }
            },
        },
    ]);

    return (
        <div>
            {isLoading && <Spinner />}
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
    );
}
```

---

## Best Practices

1. **Custom Hooks Naming**: Always start with `use` prefix
2. **Single Responsibility**: Each hook should have one clear purpose
3. **Reusability**: Design hooks to be reusable across components
4. **TypeScript**: Always type hook parameters and return values
5. **Documentation**: Document complex hooks with JSDoc comments
6. **Performance**: Use `useCallback` and `useMemo` when appropriate
7. **Cleanup**: Always clean up side effects in `useEffect` return

---

**Last Updated:** January 12, 2026  
**Version:** 1.0
