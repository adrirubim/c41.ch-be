# API Documentation

## Authentication

Most API routes require authentication via Laravel Fortify. Public routes (homepage, blog, categories) are accessible without authentication.

## Public Endpoints (No Authentication Required)

### Homepage

#### Get Homepage Data
```
GET /
```

**Response:**
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
- `category` (integer, optional): Filter by category ID
- `featured` (boolean, optional): Filter featured posts only
- `sort_by` (string, optional): Field to sort by (`published_at`, `views_count`, `title`, default: `published_at`)
- `sort_order` (string, optional): Sort order (`asc` or `desc`, default: `desc`)
- `per_page` (integer, optional): Items per page (default: 12)

**Note:** Only published posts are returned.

**Response:** Same format as authenticated `/posts` endpoint, but only includes published posts.

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

**Response:**
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

**Response:**
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
- `slug`: required, string, max:255, unique
- `content`: nullable, string
- `excerpt`: nullable, string, max:500
- `published`: boolean
- `published_at`: nullable, date
- `featured`: boolean
- `tags`: nullable, array, max:10 items
- `tags.*`: string, max:50
- `categories`: nullable, array
- `categories.*`: exists:categories,id

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

### Categories

#### List Categories
```
GET /categories
```

**Response:**
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
POST /categories
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
- `slug`: auto-generated from name if not provided
- `description`: nullable, string
- `color`: nullable, string, regex:/^#[0-9A-Fa-f]{6}$/

**Response:** `302 Redirect` to `/categories` with success message

#### Update Category
```
PUT /categories/{category}
PATCH /categories/{category}
```

**Request Body:** Same as Create Category

**Response:** `302 Redirect` to `/categories` with success message

#### Delete Category
```
DELETE /categories/{category}
```

**Response:** `302 Redirect` to `/categories` with success message

**Note:** Soft delete. If category has associated posts, only admins can delete.

### Dashboard

#### Get Statistics
```
GET /dashboard
```

**Response:**
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

**Cache:** Results are cached for 5 minutes

### Images

#### Upload Image
```
POST /upload-image
```

**Request:** `multipart/form-data`
- `image` (file, required): Image file (max 5MB)
  - Allowed types: `jpeg`, `png`, `jpg`, `gif`, `webp`

**Response:**
```json
{
  "imageUrl": "/storage/posts/images/2026/01/09/image-name.jpg"
}
```

**Rate Limit:** 5 requests per minute

**Storage:** Images are stored in `storage/app/public/posts/images/`

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
| POST /posts | 10 requests | 1 minute |
| PUT /posts/{post} | 10 requests | 1 minute |
| POST /categories | 10 requests | 1 minute |
| PUT /categories/{category} | 10 requests | 1 minute |
| GET /posts (search) | 30 requests | 1 minute |
| POST /upload-image | 5 requests | 1 minute |

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

### Create Post with Categories
```javascript
const response = await fetch('/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken
  },
  body: JSON.stringify({
    title: 'My New Post',
    slug: 'my-new-post',
    content: '<p>Post content</p>',
    excerpt: 'Post excerpt',
    published: true,
    tags: ['laravel', 'php'],
    categories: [1, 2]
  })
});
```

### Search Posts
```javascript
const response = await fetch('/posts?search=laravel&published=true&per_page=25');
const data = await response.json();
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

const { imageUrl } = await response.json();
```

---

**Last Updated:** January 2026
