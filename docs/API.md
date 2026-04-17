# Routes / HTTP Documentation

This project is a **Laravel + Inertia** application. Most endpoints below return **Inertia/HTML responses** (pages) and perform **redirects** on successful mutations, not JSON REST responses.

Use this document as a **route reference** (paths, auth requirements, rate limits). For the authoritative list, run `php artisan route:list`.

## Authentication

Most API routes require authentication via Laravel Fortify. Public routes (homepage, blog, categories) are accessible without authentication.

### Post-login Redirect Rules

On successful login (Fortify login), the browser is redirected based on the authenticated user:

- Administrator (`email === admin@example.com` OR `is_admin=true`): redirect to `/dashboard`
- Regular user: redirect to `/blog`

The implementation is provided by `App\\Responses\\ConditionalLoginResponse` and wired in `App\\Providers\\FortifyServiceProvider`.

## Public Endpoints (No Authentication Required)

### Infrastructure API (JSON)

These endpoints live under `routes/api.php` and return **JSON** (not Inertia pages).

#### Health Check (DB + Cache + Media)

```
GET /api/health
```

- **Auth**: none
- **Rate limiting**: `throttle:api_general` (see `App\Providers\AppServiceProvider`)
- **Purpose**: fast, production-safe signal for infra readiness. Used by `tests/Feature/InfrastructureTest.php` and the production checklist.
- **Traceability**: the response includes `request_id` (also present in server logs) so you can correlate client checks with backend logs.

**Response contract (200 OK):**

```json
{
  "ok": true,
  "request_id": "req_...",
  "checks": {
    "db": { "ok": true, "error": null },
    "cache": { "ok": true, "error": null },
    "media": { "ok": true, "error": null }
  }
}
```

**Response contract (503 Service Unavailable):** same JSON shape, but:
- `ok: false`
- one or more `checks.*.ok: false`
- `checks.*.error` contains a masked error message suitable for ops triage

#### Client Error Reporting (browser → server logs)

```
POST /api/client-error
```

- **Auth**: none
- **Rate limiting**: `throttle:api_general`
- **Behavior**: validates a small JSON payload and writes a structured log entry (`client_error`) including `request_id` when available.

**Request body contract:**

Required:
- `message` (string, max 2000)

Optional:
- `url` (string, max 2000)
- `stack` (string, max 20000)
- `userAgent` (string, max 2000)
- `componentStack` (string, max 20000)
- `level` (`"error" | "warning" | "info"`)
- `tags` (array)

**Response contract (200 OK):**

```json
{
  "ok": true,
  "request_id": "req_..."
}
```

### Homepage

#### Get Homepage Data
```
GET /
```

**Response (Inertia page props, example shape):**
```json
{
  "featuredPosts": [
    {
      "id": 1,
      "title": "Featured Post Title",
      "slug": "featured-post-title",
      "excerpt": "Post excerpt",
      "published_at": "2026-01-12T12:00:00.000000Z",
      "views_count": 500,
      "featured": true,
      "user": {
        "id": 1,
        "name": "Author Name"
      },
      "categories": [
        {
          "id": 1,
          "name": "Technology",
          "slug": "technology",
          "color": "#3B82F6"
        }
      ]
    }
  ],
  "recentPosts": [...],
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "color": "#3B82F6",
      "posts_count": 12
    }
  ],
  "stats": {
    "totalPosts": 34,
    "totalCategories": 5,
    "totalViews": 98616
  }
}
```

### Public Blog

#### List Published Posts
```
GET /blog
```

**Query Parameters:**
- `search` (string, optional): Search in title, content, excerpt
- `category` (integer, optional): Filter by category ID (not slug)
- `featured` (boolean, optional): Filter featured posts only
- `sort_by` (string, optional): Field to sort by (`published_at`, `views_count`, `title`, default: `published_at`)
- `sort_order` (string, optional): Sort order (`asc` or `desc`, default: `desc`)
- `per_page` (integer, optional): Items per page (default: 12)

**Note:** Only published posts are returned.

**Response:** Inertia page (published posts only).

#### Get Published Post by Slug
```
GET /blog/{slug}
```

**Response:**
```json
{
  "post": {
    "id": 1,
    "title": "Post Title",
    "slug": "post-slug",
    "content": "<p>HTML content</p>",
    "excerpt": "Post excerpt",
    "published_at": "2026-01-12T12:00:00.000000Z",
    "views_count": 500,
    "featured": true,
    "user": {
      "id": 1,
      "name": "Author Name",
      "email": "author@example.com"
    },
    "categories": [...]
  },
  "relatedPosts": [...]
}
```

**Note:** Automatically increments `views_count` on access.

### Public Categories

#### List All Categories
```
GET /categories
```

**Response:** Inertia page (public categories index).
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "color": "#3B82F6",
      "description": "Technology related posts",
      "posts_count": 12
    }
  ]
}
```

**Note:** Only categories with published posts are returned.

#### Get Posts by Category
```
GET /categories/{slug}
```

**Query Parameters:**
- `search` (string, optional): Search in title, content, excerpt
- `sort_by` (string, optional): Field to sort by (default: `published_at`)
- `sort_order` (string, optional): Sort order (default: `desc`)
- `per_page` (integer, optional): Items per page (default: 12)

**Response:**
```json
{
  "category": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "color": "#3B82F6",
    "description": "Technology related posts"
  },
  "posts": {
    "data": [...],
    "current_page": 1,
    "last_page": 3,
    "total": 34
  },
  "categories": [...],
  "filters": {...}
}
```

**Note:** Only published posts in the specified category are returned.

---

## Authenticated Endpoints

All routes below require authentication via Laravel Fortify.

## Endpoints

### Posts

#### List Posts
```
GET /posts
```

**Query Parameters:**
- `search` (string, optional): Search in title, content, excerpt, slug, tags, categories, and users
- `category` (integer, optional): Filter by category ID
- `published` (boolean, optional): Filter by publication status
- `featured` (boolean, optional): Filter featured posts
- `sort_by` (string, optional): Field to sort by (default: `created_at`)
- `sort_order` (string, optional): Sort order (`asc` or `desc`, default: `desc`)
- `per_page` (integer, optional): Items per page (15, 25, 50, 100, default: 15)

**Response:** Inertia page (posts index).
```json
{
  "data": [
    {
      "id": 1,
      "title": "Post Title",
      "slug": "post-title",
      "excerpt": "Post excerpt",
      "published": true,
      "featured": false,
      "views_count": 100,
      "user": {
        "id": 1,
        "name": "User Name",
        "email": "user@example.com"
      },
      "categories": [
        {
          "id": 1,
          "name": "Technology",
          "slug": "technology",
          "color": "#3B82F6"
        }
      ],
      "tags": ["tag1", "tag2"],
      "created_at": "2026-01-09T12:00:00.000000Z"
    }
  ],
  "links": {
    "first": "http://example.com/posts?page=1",
    "last": "http://example.com/posts?page=10",
    "prev": null,
    "next": "http://example.com/posts?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "path": "http://example.com/posts",
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

#### Create Post
```
POST /posts
```

**Request Body:**
```json
{
  "title": "Post Title",
  "slug": "post-title",
  "content": "<p>HTML content</p>",
  "excerpt": "Post excerpt",
  "published": true,
  "published_at": "2026-01-09 12:00:00",
  "featured": false,
  "tags": ["tag1", "tag2"],
  "categories": [1, 2],
  "user_id": 1
}
```

**Response:** `302 Redirect` to `/posts` with success message

**Validation Rules:**
- `title`: required, string, max:255
- `slug`: optional in the UI; if omitted, it is auto-generated from `title` during request preparation (then validated as required), unique
- `content`: nullable, string
- `excerpt`: nullable, string, max:500
- `published`: boolean
- `published_at`: nullable, date
- `featured`: boolean
- `tags`: nullable, array, max:10 items
- `tags.*`: string, max:50
- `categories`: nullable, array
- `categories.*`: exists:categories,id
- `user_id`: nullable, exists:users,id (overriding author requires authorization)

**Authorization:** User must have `create` permission on Post model

#### Get Post
```
GET /posts/{post}
```

**Response:**
```json
{
  "id": 1,
  "title": "Post Title",
  "slug": "post-title",
  "content": "<p>Full HTML content</p>",
  "excerpt": "Post excerpt",
  "published": true,
  "published_at": "2026-01-09T12:00:00.000000Z",
  "featured": false,
  "views_count": 100,
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com"
  },
  "categories": [...],
  "tags": ["tag1", "tag2"],
  "created_at": "2026-01-09T12:00:00.000000Z",
  "updated_at": "2026-01-09T12:00:00.000000Z"
}
```

#### Update Post
```
PUT /posts/{post}
PATCH /posts/{post}
```

**Request Body:** Same as Create Post

**Response:** `302 Redirect` to `/posts` with success message

**Authorization:** Only post owner or admin can update

#### Delete Post
```
DELETE /posts/{post}
```

**Response:** `302 Redirect` to `/posts` with success message

**Note:** Soft delete. Only post owner or admin can delete.

#### Get Editorial Suggestions (AI-assisted)
```
POST /posts/editorial-suggestions
```

**Auth:** Requires `auth` + `verified`.

**Request Body:**
```json
{
  "title": "Post title",
  "content": "<p>Post body</p>",
  "excerpt": "Optional existing excerpt",
  "tags": ["optional", "existing", "tags"]
}
```

**Response (200):**
```json
{
  "message": "Suggestions generated successfully.",
  "data": {
    "excerpt": "Generated concise excerpt...",
    "tags": ["Laravel", "CMS", "Editorial"]
  }
}
```

**Guardrails:**
- `AI_ENABLED=false` → `503` (safe fallback message)
- `AI_EDITORIAL_ADMIN_ONLY=true` + non-admin user → `403`
- Dedicated limiter `ai-editorial` can return `429`

### Categories

> Note: authenticated category management lives under the `dashboard` prefix to avoid clashing with public `/categories/{slug}` routes.

#### List Categories
```
GET /dashboard/categories
```

**Response:** Inertia page (dashboard categories index).
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology related posts",
      "color": "#3B82F6",
      "posts_count": 15,
      "created_at": "2026-01-09T12:00:00.000000Z"
    }
  ]
}
```

#### Create Category
```
POST /dashboard/categories
```

**Request Body:**
```json
{
  "name": "Category Name",
  "slug": "category-name",
  "description": "Category description",
  "color": "#FF0000"
}
```

**Validation Rules:**
- `name`: required, string, max:100, unique
- `slug`: optional in the UI; if omitted, it is auto-generated from `name` during request preparation (then validated as required)
- `description`: nullable, string
- `color`: nullable, string, regex:/^#[0-9A-Fa-f]{6}$/

**Response:** `302 Redirect` to `/dashboard/categories` with success message

#### Category Create Form (page)
```
GET /dashboard/categories/new
```

**Response:** Inertia page (dashboard category create form).

#### Category Detail (redirect)
```
GET /dashboard/categories/{category}
```

**Behavior:** Redirects to the posts list filtered by this category: `GET /posts?category={id}`.

#### Update Category
```
PUT /dashboard/categories/{category}
PATCH /dashboard/categories/{category}
```

**Request Body:** Same as Create Category

**Response:** `302 Redirect` to `/dashboard/categories` with success message

#### Delete Category
```
DELETE /dashboard/categories/{category}
```

**Response:** `302 Redirect` to `/dashboard/categories` with success message

**Note:** Soft delete. If category has associated posts, only admins can delete.

### Dashboard

#### Get Statistics
```
GET /dashboard
```

**Response:** Inertia page (dashboard) with cached stats (5 minutes).
```json
{
  "stats": {
    "totalPosts": 100,
    "publishedPosts": 80,
    "featuredPosts": 10,
    "categories": 5,
    "totalViews": 5000,
    "usersCount": 20,
    "averageViews": 50,
    "postsThisMonth": 15
  },
  "recentPosts": [
    {
      "id": 1,
      "title": "Recent Post",
      "user": {...},
      "categories": [...],
      "created_at": "..."
    }
  ],
  "popularPosts": [
    {
      "id": 2,
      "title": "Popular Post",
      "views_count": 500,
      "user": {...},
      "categories": [...]
    }
  ],
  "categoriesDistribution": [
    {
      "id": 1,
      "name": "Technology",
      "posts_count": 15
    }
  ],
  "lastPublishedPost": {
    "id": 3,
    "title": "Last Published",
    "published_at": "..."
  }
}
```

**Cache:** Results are cached for 5 minutes.

### Images

#### Upload Image
```
POST /upload-image
```

**Request:** `multipart/form-data`
- `image` (file, required): Image file (max 5MB)
  - Allowed types: `jpeg`, `png`, `jpg`, `gif`, `webp`

**Response (JSON):**
```json
{
  "success": true,
  "url": "/storage/posts/images/<uuid>.<ext>"
}
```

**Auth:** Requires `auth` + `verified` middleware.

**Rate Limit:** 10 requests per minute (limiter: `posts`).

**Storage:** Images are stored in `storage/app/public/posts/images/` (public disk), and served via `public/storage` after running `php artisan storage:link`.

### Sitemap

#### Get Sitemap XML
```
GET /sitemap.xml
```

**Response:** XML sitemap containing:
- Home page
- All published posts
- All categories

**Content-Type:** `application/xml`

## Rate Limiting

Rate limits are applied to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| GET /api/health | 120 requests | 1 minute |
| POST /api/client-error | 120 requests | 1 minute |
| POST /posts | 10 requests | 1 minute |
| PUT /posts/{post} | 10 requests | 1 minute |
| POST /posts/editorial-suggestions | Configurable (`AI_EDITORIAL_RATE_LIMIT_ATTEMPTS`, default 6) | 1 minute |
| POST /dashboard/categories | 5 requests | 1 minute |
| PUT /dashboard/categories/{category} | 5 requests | 1 minute |
| GET /posts (search) | 30 requests | 1 minute |
| POST /upload-image | 10 requests | 1 minute |

Notes:
- The **API tier** limits above are enforced by `throttle:api_general` (`AppServiceProvider`) and are keyed by **user id when authenticated, otherwise client IP**.

**Response when rate limited:**
- Status Code: `429 Too Many Requests`
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET requests |
| 201 | Created | Resource created (not used, redirects instead) |
| 302 | Found | Successful POST/PUT/DELETE (redirects) |
| 403 | Forbidden | Authorization failed |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "slug": ["The slug has already been taken."]
  }
}
```

### Authorization Error (403)
```json
{
  "message": "This action is unauthorized."
}
```

### Not Found (404)
```json
{
  "message": "No query results for model [App\\Models\\Post] 123"
}
```

## Best Practices

1. **Always authenticate** before making requests
2. **Handle rate limits** by implementing exponential backoff
3. **Validate data** on client side before sending
4. **Handle errors gracefully** with appropriate user feedback
5. **Use pagination** for large datasets
6. **Cache responses** when appropriate
7. **Follow RESTful conventions** for consistency

## Examples

### Create Post (Inertia)

Most mutations in this app return a **302 redirect** with flash messages (not JSON). Use Inertia's router:

Flash message keys shared to the frontend are:
- `flash.success`
- `flash.error`
- `flash.message`

They are provided by `App\Http\Middleware\HandleInertiaRequests`.

```tsx
import { router } from '@inertiajs/react';

router.post('/posts', {
  title: 'My New Post',
  slug: 'my-new-post',
  content: '<p>Post content</p>',
  excerpt: 'Post excerpt',
  published: true,
  tags: ['laravel', 'php'],
  categories: [1, 2],
});
```

### Search / filter posts (Inertia)

Filtering is typically done via **Inertia GET navigation** (server returns a page with updated props):

```tsx
import { router } from '@inertiajs/react';

router.get('/posts', {
  search: 'laravel',
  published: true,
  per_page: 25,
}, {
  preserveState: true,
  replace: true,
});
```

### Upload Image
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/upload-image', {
  method: 'POST',
  headers: {
    'X-CSRF-TOKEN': csrfToken
  },
  body: formData
});

const { url } = await response.json();
```

---

**Last Updated:** April 2026
