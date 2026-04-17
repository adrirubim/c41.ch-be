# Development Guide

## Project Structure

### Architecture

The project follows a layered architecture pattern:

```
app/
├── Http/
│   ├── Controllers/     # Controllers (coordinate only)
│   └── Requests/        # Form validation
├── Services/            # Business logic
├── Repositories/        # Data access
├── Models/              # Eloquent models
├── Policies/            # Authorization
├── Events/              # Events
└── Listeners/           # Event listeners
```

### Data Flow

1. **Request** → `Controller`
2. **Controller** → `Service` (business logic)
3. **Service** → `Repository` (data access)
4. **Repository** → `Model` (Eloquent)
5. **Service** → Dispatches `Event` (optional)
6. **Listener** → Processes event (logging, notifications, etc.)

## Code Conventions

### Services

- Contain business logic
- Do not access database directly
- Dispatch events when necessary
- Manage cache

**Example:**
```php
public function create(array $data, ?array $categoryIds = null): Post
{
    $post = $this->repository->create($data);
    
    if ($categoryIds !== null) {
        $post->categories()->sync($categoryIds);
    }
    
    event(new PostCreated($post));
    $this->clearCache();
    
    return $post;
}
```

### Repositories

- Encapsulate data access
- Contain complex queries
- Return models or collections

**Example:**
```php
use App\Domain\Post\DTO\PostFiltersData;

public function getFiltered(PostFiltersData $filters): LengthAwarePaginator
{
    $query = Post::with(['user', 'categories'])->withoutTrashed();

    if ($filters->search !== null) {
        $query->where(function($q) use ($filters) {
            $q->where('title', 'like', "%{$filters->search}%")
              ->orWhere('content', 'like', "%{$filters->search}%");
        });
    }

    return $query->paginate($filters->perPage);
}
```

### Policies

- Handle authorization
- Verify permissions before actions
- Use `is_admin` field to verify administrators

**Example:**
```php
public function update(User $user, Post $post): bool
{
    return $user->id === $post->user_id || $user->is_admin;
}
```

## Testing

### Running Tests

```bash
php artisan test
```

### Test Structure

- `tests/Feature/` - Integration and feature tests
- `tests/Unit/` - Unit tests

### Creating Tests

```bash
php artisan make:test PostControllerTest
```

### Test Database

- Default: SQLite in-memory (`:memory:`), configured in `phpunit.xml`
- Automatically cleaned with `RefreshDatabase` (Feature tests)
- Optional: PostgreSQL to match CI (see `testing/TEST_DATABASE.md`)

### Test Example

```php
public function test_user_can_create_post(): void
{
    $user = User::factory()->create();
    
    $this->actingAs($user)
         ->post(route('posts.store'), [
             'title' => 'Test Post',
             'slug' => 'test-post',
             'content' => 'Content',
             'published' => true,
         ])
         ->assertRedirect(route('posts.index'));
    
    $this->assertDatabaseHas('posts', [
        'title' => 'Test Post',
        'user_id' => $user->id,
    ]);
}
```

## Events and Listeners

### Available Events

- `PostCreated` - Dispatched when a post is created
- `PostUpdated` - Dispatched when a post is updated
- `PostDeleted` - Dispatched when a post is deleted
- `CategoryCreated` - Dispatched when a category is created
- `CategoryUpdated` - Dispatched when a category is updated
- `CategoryDeleted` - Dispatched when a category is deleted

### Listeners

- `LogPostActivity` - Logs post activity to logs
- `LogCategoryActivity` - Logs category activity to logs

### Adding New Listeners

1. Create the listener:
```bash
php artisan make:listener SendPostNotification
```

2. Register in `AppServiceProvider::boot()`:
```php
Event::listen(
    PostCreated::class,
    SendPostNotification::class
);
```

3. Implement the handler:
```php
public function handle(PostCreated $event): void
{
    // Send notification logic
}
```

## Caching

### Cache Strategy

- **Public pages (high traffic):** cached in `App\Repositories\PostRepository` with tags + keyset fallback
  - `/blog` (index) — short TTL (60s)
  - `/blog/{slug}` (show) — 300s
  - related posts — 300s
  - `sitemap.xml` — 24h
- **Dashboard stats & widgets:** cached via `Cache::remember(...)` (see `DashboardController`)
- **Category lists:** cached via `Cache::flexible(...)` in `CategoryService`

### Cache Keys

```php
'dashboard.stats'
'dashboard.recent_posts'
'dashboard.popular_posts'
'dashboard.categories_distribution'
'categories.list'
'categories.with_post_count'
```

### Clearing Cache

Cache freshness is guaranteed by two mechanisms:

- **Public caches**: invalidated via Eloquent Observers:
  - `app/Observers/PostObserver.php`
  - `app/Observers/CategoryObserver.php`
- **Dashboard/category service caches**: cleared inside services after mutations, and also by `CategoryObserver` for cross-call-site safety.

Manual clearing:
```bash
php artisan cache:clear
```

## Roles and Permissions

### Role System

Currently implemented with `is_admin` field in `users` table:

- **Regular User:** `is_admin = false`
  - Can only edit/delete own posts
  - Can create posts
  - Category management is admin-only (see `CategoryPolicy` and `EnsureAdmin`)

- **Administrator:** `is_admin = true`
  - Can edit/delete any post
  - Can manage categories (CRUD)
  - Can permanently delete posts
  - Can access AI editorial suggestions when enabled and configured as admin-only

### Creating Admin User

```php
User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => Hash::make('password'),
    'is_admin' => true,
]);
```

### Checking Permissions

```php
// In Policy
if ($user->is_admin) {
    return true;
}

// In Controller
$this->authorize('update', $post);
```

### Post-login Redirect Rules

After a successful Fortify login, users are redirected based on their role:

- Administrator (`email === admin@example.com` OR `is_admin=true`): redirect to `/dashboard`
- Regular user: redirect to `/blog`

Implementation: `App\\Responses\\ConditionalLoginResponse` registered via `App\\Providers\\FortifyServiceProvider`.

## Migrations

### Running Migrations

```bash
php artisan migrate
php artisan migrate:fresh --seed
```

### Important Migrations

- `add_is_admin_to_users_table` - Adds admin field
- `add_indexes_for_performance` - Performance indexes
- `add_soft_deletes_to_posts_table` - Soft deletes for posts
- `add_soft_deletes_to_categories_table` - Soft deletes for categories

### Creating Migrations

```bash
php artisan make:migration add_field_to_table --table=table_name
```

## Useful Commands

```bash
# Development
composer run dev                    # Start Laravel app, TypeScript watcher, queue and logs
php artisan serve                   # Laravel server only
npm run dev:frontend                # Vite dev server only

# Database
php artisan migrate                 # Run migrations
php artisan migrate:fresh --seed    # Reset and seed
php artisan db:seed --class=DatabaseSeeder # Seed demo users/categories/posts (see env flags)
php artisan tinker                  # Interactive console

# Testing
npm run build:frontend              # Build frontend for feature tests (Vite manifest)
php artisan test                    # Run all tests
php artisan test --filter=PostControllerTest  # Filter tests

# Cache
php artisan cache:clear             # Clear cache
php artisan config:clear            # Clear config

# Operations (scheduled in bootstrap/app.php)
php artisan app:db-backup           # Create compressed DB dump (storage/app/backups/db/*.sql.gz)
php artisan app:media-cleanup       # Remove orphaned media directories (storage/app/public/media/*)

# Storage
php artisan storage:link            # Create symbolic link

# Code Quality
php artisan route:list              # List all routes
php artisan make:model Post -m      # Create model with migration
php artisan make:controller PostController --resource  # Resource controller
```

### Demo Seed Flags (Development)

- `SEED_DEMO_USERS_COUNT` — number of demo users (in addition to `admin@example.com` and `test@example.com`).
- `SEED_DEMO_RESET`
  - `true`: clears demo data (`posts` and `category_post` pivot) before re-generating the demo dataset.
  - `false` (default): removes only previous demo posts/legacy data to avoid accumulation.

- `SEED_POST_TONE` — demo post title tone (`mixed`, `tecnico`, `ux`, `marketing`). Affects only `PostSeeder`.
  - Recommended (default in this repo): `tecnico`.

## Best Practices

1. **Always use Services** for business logic
2. **Use Repositories** for complex data access
3. **Validate with Form Requests** before reaching Service
4. **Authorize with Policies** in controllers and Form Requests
5. **Dispatch events** for important actions
6. **Clear cache** after modifications
7. **Use soft deletes** for important data
8. **Write tests** for new functionality
9. **Follow PSR-12** coding standards
10. **Document complex logic** with comments

## Code Style

### PHP

- Follow PSR-12 coding standard
- Use type hints for parameters and return types
- Use strict types: `declare(strict_types=1);`
- Prefer early returns
- Use meaningful variable names

### TypeScript/React

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

## Debugging

### Laravel Debugging

```bash
# Enable debug mode in .env
APP_DEBUG=true

# View logs
tail -f storage/logs/laravel.log

# Use dd() or dump() for debugging
dd($variable);
```

### Database Queries

```php
// Enable query logging
DB::enableQueryLog();
// ... your code ...
dd(DB::getQueryLog());
```

### Tinker

```bash
php artisan tinker

# In tinker
$post = Post::first();
$post->categories;
$user = User::find(1);
$user->posts;
```

## Performance Tips

1. **Use eager loading** to prevent N+1 queries
2. **Add indexes** for frequently queried columns
3. **Cache expensive operations**
4. **Use pagination** for large datasets
5. **Optimize queries** with specific selects
6. **Monitor query performance** with Laravel Debugbar

## Security Tips

1. **Always validate input** with Form Requests
2. **Use authorization** with Policies
3. **Sanitize HTML** content (HTMLPurifier)
4. **Use rate limiting** on sensitive endpoints
5. **Never expose sensitive data** in responses
6. **Use HTTPS** in production
7. **Keep dependencies updated**

---

**Last Updated:** April 2026
