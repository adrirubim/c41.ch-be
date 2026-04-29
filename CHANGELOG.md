# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- N/A

### Changed

- Updated stack documentation (`VERSION_STACK.md`) to reflect current Laravel/React/Vite/TypeScript versions after dependency upgrades.
- Updated `VERSION_STACK.md` with the latest local toolchain snapshot (PHP 8.5.x, PHPUnit, PHPStan).
- Updated Composer to 2.9.7 to address recent security advisories flagged by `composer diagnose`.
- Updated dev tooling versions after `composer update` (PHPUnit 13.1.7, Pint 1.29.1).
- Updated frontend tooling versions after npm updates (Vite 8.0.10, Tailwind CSS 4.2.4, ESLint 10.2.1).
- Updated backend deps after Composer upgrade (Laravel AI 0.6.0, prism-php/prism 0.100.1).
- Upgraded runtime targets (Node 24 LTS, PHP 8.5, PostgreSQL 17) and aligned CI + Docker to match.
- Updated Laravel 13 deps after Composer update (Laravel 13.7.0, Fortify 1.37.0, Laravel AI 0.6.4, PHPStan 2.1.53).
- Updated frontend lockfile to latest compatible versions (Vite 8.0.10, Tailwind CSS 4.2.4, TipTap patch updates, etc.).
- Removed `prism-php/prism` dependency in favor of the first-party `laravel/ai` integration.

### Fixed

- N/A
- Fixed PHPStan findings after dependency upgrades (cache generics, controller return types, GD image handling).

