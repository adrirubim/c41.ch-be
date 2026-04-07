#
# Production-grade multi-stage image for Laravel 13 + Vite (React/Inertia) + optional Inertia SSR.
#
# Goals:
# - Small runtime image (no Node toolchain)
# - Deterministic builds (composer/npm in build stages)
# - Works with either SQLite (default) or Postgres (via env)
#

############################
# Stage 1: PHP deps (vendor)
############################
FROM composer:2.8 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

# Install PHP deps (no dev) into /app/vendor
RUN composer install \
  --no-dev \
  --no-interaction \
  --no-progress \
  --prefer-dist \
  --optimize-autoloader


#####################################
# Stage 2: Node build (Vite + SSR)
#####################################
FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources/ resources/
COPY vite.config.ts tsconfig.json eslint.config.js ./
COPY public/ public/

# SSR build produces `bootstrap/ssr/*` by default (see `.gitignore` and Inertia config).
RUN npm run build:ssr


#####################################
# Stage 3: Runtime (PHP-FPM)
#####################################
FROM php:8.4-fpm-alpine AS app

WORKDIR /var/www/html

ENV APP_ENV=production \
  APP_DEBUG=false \
  PHP_OPCACHE_ENABLE=1

# System deps + PHP extensions commonly required by Laravel
RUN apk add --no-cache \
    bash \
    curl \
    icu-data-full \
    icu-libs \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma \
    postgresql-libs \
  && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    icu-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j"$(nproc)" \
    bcmath \
    intl \
    opcache \
    pdo \
    pdo_pgsql \
    pdo_sqlite \
    zip \
    gd \
  && apk del .build-deps

# Opcache tuned for prod (safe defaults; can be overridden via php.ini if needed)
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.enable_cli=0"; \
    echo "opcache.memory_consumption=256"; \
    echo "opcache.interned_strings_buffer=16"; \
    echo "opcache.max_accelerated_files=20000"; \
    echo "opcache.validate_timestamps=0"; \
  } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Copy app source
COPY . .

# Bring in built artifacts
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build
COPY --from=frontend /app/bootstrap/ssr ./bootstrap/ssr

# Laravel expected writable dirs
RUN mkdir -p storage bootstrap/cache \
  && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]

#
# Multi-stage production Dockerfile for Laravel + Inertia (Vite)
#
# Stages:
# 1) node-builder: builds Vite assets into public/build
# 2) php-builder: installs PHP dependencies (no-dev) and optimizes autoloader
# 3) runtime: PHP-FPM with required extensions + optimized app + built assets
#

############################################
# 1) Node build stage
############################################
FROM node:22-alpine AS node-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY vite.config.ts tsconfig.json components.json postcss.config.* tailwind.config.* ./
COPY public ./public

# Build production assets (manifest + hashed files)
RUN npm run build:frontend


############################################
# 2) PHP deps stage
############################################
FROM composer:2 AS php-builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
  --no-dev \
  --no-interaction \
  --prefer-dist \
  --optimize-autoloader \
  --no-progress

COPY . .

# Pre-warm optimized classmap for production
RUN composer dump-autoload --no-dev --classmap-authoritative


############################################
# 3) Runtime stage
############################################
FROM php:8.4-fpm-alpine AS runtime

WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    mysql-client \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j"$(nproc)" \
    bcmath \
    gd \
    intl \
    opcache \
    pdo_mysql \
    zip \
  && rm -rf /var/cache/apk/*

# Opcache tuning
COPY docker/php/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# App source + vendor from builder
COPY --from=php-builder /app /var/www/html

# Frontend build artifacts
COPY --from=node-builder /app/public/build /var/www/html/public/build

# Entrypoint for startup optimizations
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Ensure writable directories
RUN mkdir -p storage bootstrap/cache \
  && chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R ug+rwX storage bootstrap/cache

USER www-data

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm", "-F"]

