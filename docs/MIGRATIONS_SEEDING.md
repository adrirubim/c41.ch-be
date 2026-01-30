# Migrations & Seeding Practice

**Company:** Internet ONE SRL  
**Supervisor:** Matteo Santarcangelo  
**Date:** January 2026  
**Project:** C41.ch BE

**Reference Documentation:**
- [Laravel Migrations](https://laravel.com/docs/12.x/migrations)
- [Laravel Seeding](https://laravel.com/docs/12.x/seeding)

---

## 📋 Table of Contents

1. [Practice Objectives](#practice-objectives)
2. [Implemented Migrations](#implemented-migrations)
3. [Created Seeders and Factories](#created-seeders-and-factories)
4. [Implemented Eloquent Relationships](#implemented-eloquent-relationships)
5. [Results Obtained](#results-obtained)
6. [Executed Commands](#executed-commands)

---

## 🎯 Practice Objectives

1. ✅ Create and modify tables using Migrations
2. ✅ Implement relationships between tables (foreign keys, pivot tables)
3. ✅ Create Factories to generate test data
4. ✅ Implement Seeders to populate the database
5. ✅ Configure DatabaseSeeder to coordinate all seeders
6. ✅ Implement Eloquent relationships in models

---

## 📦 Implemented Migrations

### 1. Create `posts` Table

**Command executed:**
```bash
php artisan make:migration create_posts_table
```

**File created:** `database/migrations/2026_01_09_105109_create_posts_table.php`

**Implementation:**
```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title', 255);
    $table->string('slug', 255)->unique();
    $table->text('content')->nullable();
    $table->text('excerpt')->nullable();
    $table->boolean('published')->default(false);
    $table->timestamp('published_at')->nullable();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->timestamps();
});
```

**Result:** `posts` table created with base columns for a blog system, including relationship with `users` table.

### 2. Add Columns to `posts` Table

**Command executed:**
```bash
php artisan make:migration add_category_and_tags_to_posts_table --table=posts
```

**File created:** `database/migrations/2026_01_09_105316_add_category_and_tags_to_posts_table.php`

**Implementation:**
```php
public function up(): void
{
    Schema::table('posts', function (Blueprint $table) {
        $table->string('category', 100)->nullable()->after('excerpt');
        $table->json('tags')->nullable()->after('category');
        $table->unsignedInteger('views_count')->default(0)->after('tags');
        $table->boolean('featured')->default(false)->after('views_count');
    });
}

public function down(): void
{
    Schema::table('posts', function (Blueprint $table) {
        $table->dropColumn(['category', 'tags', 'views_count', 'featured']);
    });
}
```

**Result:** Added 4 new columns to `posts` table to manage category, tags (as JSON), view count, and featured flag.

### 3. Create `categories` Table

**Command executed:**
```bash
php artisan make:migration create_categories_table
```

**File created:** `database/migrations/2026_01_09_105431_create_categories_table.php`

**Implementation:**
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->unique();
    $table->string('slug', 100)->unique();
    $table->text('description')->nullable();
    $table->string('color', 7)->nullable(); // Hexadecimal color code
    $table->timestamps();
});
```

**Result:** `categories` table created with unique name and slug, optional description, and color for visual identification.

### 4. Create Pivot Table `category_post`

**Command executed:**
```bash
php artisan make:migration create_category_post_table
```

**File created:** `database/migrations/2026_01_09_105444_create_category_post_table.php`

**Implementation:**
```php
Schema::create('category_post', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained()->onDelete('cascade');
    $table->foreignId('post_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    
    // Unique index to prevent duplicates
    $table->unique(['category_id', 'post_id']);
});
```

**Result:** Pivot table created to manage many-to-many relationship between `posts` and `categories`, with unique index to prevent duplicates.

### Migration Execution

**Commands executed:**
```bash
# Run all migrations
php artisan migrate

# Test rollback (2 steps back)
php artisan migrate:rollback --step=2

# Re-migrate
php artisan migrate
```

**Result:** All migrations executed successfully, rollback tested and re-migration completed.

---

## 🌱 Created Seeders and Factories

### 1. Post Factory

**Command executed:**
```bash
php artisan make:factory PostFactory
```

**File created:** `database/factories/PostFactory.php`

**Implementation:**
```php
public function definition(): array
{
    $title = fake()->sentence();
    
    return [
        'title' => $title,
        'slug' => Str::slug($title),
        'content' => fake()->paragraphs(5, true),
        'excerpt' => fake()->sentence(),
        'published' => fake()->boolean(70), // 70% probability of being published
        'published_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
        'user_id' => User::factory(), // Automatically creates a user
        'category' => fake()->randomElement(['Technology', 'Design', 'Marketing', 'Development', 'Business']),
        'tags' => fake()->words(3), // Array of 3 words
        'views_count' => fake()->numberBetween(0, 1000),
        'featured' => fake()->boolean(20), // 20% probability of being featured
    ];
}
```

**Result:** Factory that generates realistic data for posts, including automatic creation of related users.

### 2. PostSeeder

**Command executed:**
```bash
php artisan make:seeder PostSeeder
```

**File created:** `database/seeders/PostSeeder.php`

**Implementation:**
```php
public function run(): void
{
    // Create 20 posts using the factory
    $posts = Post::factory(20)->create();

    // Get all categories
    $categories = Category::all();

    // Assign 1-3 random categories to each post
    foreach ($posts as $post) {
        $randomCategories = $categories->random(rand(1, 3));
        $post->categories()->attach($randomCategories->pluck('id')->toArray());
    }
}
```

**Result:** Seeder that creates 20 posts and randomly assigns 1-3 categories to each post using the many-to-many relationship.

### 3. CategorySeeder

**Command executed:**
```bash
php artisan make:seeder CategorySeeder
```

**File created:** `database/seeders/CategorySeeder.php`

**Implementation:**
```php
public function run(): void
{
    $categories = [
        ['name' => 'Technology', 'slug' => 'technology', 'color' => '#3B82F6'],
        ['name' => 'Design', 'slug' => 'design', 'color' => '#EF4444'],
        ['name' => 'Marketing', 'slug' => 'marketing', 'color' => '#10B981'],
        ['name' => 'Development', 'slug' => 'development', 'color' => '#F59E0B'],
        ['name' => 'Business', 'slug' => 'business', 'color' => '#8B5CF6'],
    ];

    foreach ($categories as $category) {
        DB::table('categories')->insert([
            ...$category,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
```

**Result:** Seeder that inserts 5 specific categories with predefined names, slugs, and colors.

### 4. DatabaseSeeder Configured

**File modified:** `database/seeders/DatabaseSeeder.php`

**Implementation:**
```php
public function run(): void
{
    // Create test user
    User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    // Create admin user (use env or change password after first login)
    User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => Hash::make(env('SEEDER_ADMIN_PASSWORD', 'password')),
        'email_verified_at' => now(),
        'is_admin' => true,
    ]);

    // Create user Adri (optional; same pattern with env for password)
    User::create([
        'name' => 'Adri',
        'email' => 'hello@example.com',
        'password' => Hash::make(env('SEEDER_ADMIN_PASSWORD', 'password')),
        'email_verified_at' => now(),
    ]);

    // Execute seeders in order (important: categories before posts)
    $this->call([
        CategorySeeder::class,  // Categories first
        PostSeeder::class,      // Then posts (needs existing categories)
    ]);
}
```

**Result:** DatabaseSeeder configured to create specific users and coordinate execution of all seeders in the correct order.

### Seeder Execution

**Command executed:**
```bash
php artisan migrate:fresh --seed
```

**Result:** Database completely recreated and populated with all data.

---

## 🔗 Implemented Eloquent Relationships

### 1. Post Model

**File:** `app/Models/Post.php`

**Added:**
```php
// belongsTo relationship with User
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

// many-to-many relationship with Categories
public function categories(): BelongsToMany
{
    return $this->belongsToMany(Category::class, 'category_post')
                ->withTimestamps();
}
```

**Result:** Post can access its author (`$post->user`) and its categories (`$post->categories`).

### 2. User Model

**File:** `app/Models/User.php`

**Added:**
```php
// hasMany relationship with Posts
public function posts(): HasMany
{
    return $this->hasMany(Post::class);
}
```

**Result:** User can access all their posts (`$user->posts`).

### 3. Category Model

**File created:** `app/Models/Category.php`

**Implementation:**
```php
// many-to-many relationship with Posts
public function posts(): BelongsToMany
{
    return $this->belongsToMany(Post::class, 'category_post')
                ->withTimestamps();
}
```

**Result:** Category can access all posts that belong to that category (`$category->posts`).

---

## 📊 Results Obtained

### Data Created in Database

After executing `php artisan migrate:fresh --seed`:

- ✅ **20 Posts** created with realistic data generated by factory
- ✅ **5 Categories** created with specific data (Technology, Design, Marketing, Development, Business)
- ✅ **~40-60 Relationships** between posts and categories (1-3 categories per post)
- ✅ **23 Users** total:
  - 1 user "Test User" (test@example.com)
  - 1 user "Admin User" (admin@example.com) - Administrator
  - 1 user "Adri" (hello@example.com)
  - 20 users automatically created by post factories
- ✅ **Working relationships** between all entities

### Data Verification

**Commands executed in `php artisan tinker`:**

```php
// Count records
Post::count();                    // = 20
Category::count();                // = 5
DB::table('category_post')->count(); // = ~40-60 relationships
User::count();                   // = 23

// Verify a post with its relationships
$post = Post::first();
$post->user;                      // User object
$post->categories;                // Collection of Category objects
```

**Result:** All relationships working correctly.

### Custom Dashboard

**Implementation:**

Created a functional dashboard that displays:
- **5 Real-time Statistics:**
  - Total Posts: 20
  - Published: ~12 (70% probability)
  - Featured: ~3-4 (20% probability)
  - Categories: 5
  - Views: total sum of all views

- **List of last 5 posts** with:
  - Title
  - Author
  - View count
  - Associated categories
  - Status (Published/Draft)
  - Featured indicator (star)

**Modified Files:**
- `routes/web.php`: Added logic to pass data to dashboard
- `resources/js/pages/dashboard.tsx`: React component to display statistics

**Result:** Fully functional dashboard displaying real data from database.

---

## 🛠️ Executed Commands

### Migrations

```bash
# Create migrations
php artisan make:migration create_posts_table
php artisan make:migration add_category_and_tags_to_posts_table --table=posts
php artisan make:migration create_categories_table
php artisan make:migration create_category_post_table

# Execute migrations
php artisan migrate

# Test rollback
php artisan migrate:rollback --step=2

# Re-migrate
php artisan migrate

# Fresh with seed (final command)
php artisan migrate:fresh --seed
```

### Seeders and Factories

```bash
# Create seeder
php artisan make:seeder PostSeeder
php artisan make:seeder CategorySeeder

# Create factory
php artisan make:factory PostFactory

# Execute seeders
php artisan db:seed
php artisan migrate:fresh --seed
```

### Models

```bash
# Create models
php artisan make:model Post
php artisan make:model Category
```

### Verification

```bash
# Open tinker to verify data
php artisan tinker

# Commands executed in tinker:
Post::count();
Category::count();
DB::table('category_post')->count();
User::count();
Post::first();
```

---

## 📁 Created/Modified Files

### Migrations
- `database/migrations/2026_01_09_105109_create_posts_table.php`
- `database/migrations/2026_01_09_105316_add_category_and_tags_to_posts_table.php`
- `database/migrations/2026_01_09_105431_create_categories_table.php`
- `database/migrations/2026_01_09_105444_create_category_post_table.php`

### Seeders
- `database/seeders/PostSeeder.php` (created)
- `database/seeders/CategorySeeder.php` (created)
- `database/seeders/DatabaseSeeder.php` (modified)

### Factories
- `database/factories/PostFactory.php` (created)
- `database/factories/CategoryFactory.php` (created)

### Models
- `app/Models/Post.php` (created and modified)
- `app/Models/Category.php` (created)
- `app/Models/User.php` (modified)

### Frontend
- `routes/web.php` (modified for dashboard)
- `resources/js/pages/dashboard.tsx` (modified to display statistics)

---

## ✅ Completed Checklist

### Migrations
- [x] Create `posts` table with all necessary columns
- [x] Add columns to existing table (`posts`)
- [x] Create `categories` table with unique constraints
- [x] Create pivot table `category_post` for many-to-many relationship
- [x] Implement foreign keys with `onDelete('cascade')`
- [x] Add composite unique index in pivot table
- [x] Execute migration rollback
- [x] Re-migrate after rollback

### Seeders
- [x] Create PostFactory with realistic data using Faker
- [x] Create PostSeeder that uses the factory
- [x] Create CategorySeeder with specific data
- [x] Configure DatabaseSeeder to coordinate all seeders
- [x] Create many-to-many relationships between posts and categories in seeder
- [x] Execute `migrate:fresh --seed` successfully

### Eloquent Relationships
- [x] Add `belongsTo` relationship in Post (Post → User)
- [x] Add `hasMany` relationship in User (User → Posts)
- [x] Add `belongsToMany` relationship in Post (Post ↔ Categories)
- [x] Add `belongsToMany` relationship in Category (Category ↔ Posts)
- [x] Verify relationships working in tinker

### Dashboard
- [x] Modify route to pass data to dashboard
- [x] Create React component to display statistics
- [x] Display list of recent posts with relationships

---

## 🎓 Conclusions

This practice allowed to:

1. **Implement** a complete migration system to manage database schema
2. **Create** factories and seeders to populate database with realistic data
3. **Implement** complex relationships between entities (one-to-many, many-to-many)
4. **Verify** functionality through custom dashboard
5. **Apply** best practices following official Laravel 12 documentation

All objectives have been successfully achieved. The system is now functional with:
- Structured and versioned database
- Realistic test data
- Working Eloquent relationships
- Dashboard displaying real-time statistics

---

**Practice completed successfully** ✅

*Document created for Internet ONE SRL - January 2026*  
*Author: Adrián Morillas Pérez*

---

**Last Updated:** January 2026
