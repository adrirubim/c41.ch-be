# Multi-stage production Dockerfile for Laravel + Inertia (Vite)
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
    postgresql-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j"$(nproc)" \
    bcmath \
    gd \
    intl \
    opcache \
    pdo_pgsql \
    pdo_sqlite \
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

