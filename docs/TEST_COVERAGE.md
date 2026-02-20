# Test Coverage

Overview of test suites and what is covered in **c41.ch-be**.

## Summary

- **57 tests** across Unit and Feature suites
- **241+ assertions**
- PHPUnit 11; default DB: SQLite in-memory (CI uses PostgreSQL)

## Test Suites

### Unit (`tests/Unit`)

| Test | Description |
|------|-------------|
| `ExampleTest` | Basic sanity check |

Unit tests are kept minimal; most logic is covered by Feature tests with real HTTP and database.

### Feature (`tests/Feature`)

| Area | Tests | What is covered |
|------|--------|------------------|
| **Auth** | `AuthenticationTest` | Login screen, login/logout, invalid password, rate limiting, two-factor redirect |
| | `EmailVerificationTest` | Verification screen, verify email, invalid hash/user, redirect when already verified |
| | `PasswordConfirmationTest` | Confirm password screen, auth required |
| | `PasswordResetTest` | Reset link screen, request link, reset screen, reset with valid/invalid token |
| | `RegistrationTest` | Registration screen, new user registration |
| | `TwoFactorChallengeTest` | Redirect when not authenticated, challenge screen |
| | `VerificationNotificationTest` | Send verification notification, skip when already verified |
| **Categories** | `CategoryControllerTest` | Guests blocked, index/create/store/update/delete for authenticated users |
| **Posts** | `PostControllerTest` | Guests blocked, index/create/store/show/update for authenticated users, ownership |
| | `PostIntegrationTest` | Create post with categories, update post and categories, admin delete any, user cannot delete other's post |
| **Dashboard** | `DashboardTest` | Guest redirect to login, authenticated can visit, correct statistics |
| **Settings** | `PasswordUpdateTest` | Password page, update password, current password required |
| | `ProfileUpdateTest` | Profile page, update profile, email verification unchanged, delete account, password required |
| | `TwoFactorAuthenticationTest` | Two-factor page, password confirmation when enabling/disabling, forbidden when disabled |

## Running tests

```bash
# Build frontend first (required for Inertia/Vite in Feature tests)
npm run build

# Run all tests
php artisan test

# By suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Filter by test class
php artisan test --filter=PostControllerTest
```

See [README_TEST_DATABASE.md](../README_TEST_DATABASE.md) for test database setup (SQLite vs PostgreSQL).
