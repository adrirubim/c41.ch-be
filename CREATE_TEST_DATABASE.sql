-- Create the test database for c41.ch-be (PostgreSQL).
-- Run once, e.g.: sudo -u postgres psql -f CREATE_TEST_DATABASE.sql
-- Or from psql: \i CREATE_TEST_DATABASE.sql

CREATE DATABASE c41_test OWNER postgres ENCODING 'UTF8';

-- If the database already exists, you can drop and recreate (use with care):
-- DROP DATABASE IF EXISTS c41_test;
-- Then run the CREATE DATABASE above.
