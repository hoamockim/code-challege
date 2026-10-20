#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" <<-EOSQL

    CREATE USER inventory WITH PASSWORD 'Inventory^&12' CREATEDB;
    CREATE DATABASE inventory OWNER inventory;

    REVOKE ALL ON DATABASE inventory FROM PUBLIC;

    GRANT ALL PRIVILEGES ON DATABASE inventory TO inventory;
EOSQL

# PostgreSQL 15+ does not let the database owner create objects in public
# until this grant is in place. Migrations run as the inventory user.
psql -v ON_ERROR_STOP=1 \
    --username "$POSTGRES_USER" \
    --dbname inventory <<-EOSQL
    GRANT ALL ON SCHEMA public TO inventory;
EOSQL

echo "Database inventory is ready. Apply schema with: npm run db:migrate"