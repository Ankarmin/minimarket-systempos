#!/bin/bash
# ============================================================
# Configura el PRIMARIO para replicación en streaming (Mirror).
# Se ejecuta una sola vez, durante la inicialización del contenedor.
# ============================================================
set -e

# Rol dedicado de replicación usado por la réplica (hot standby).
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replicator_pwd';
EOSQL

# Permite conexiones de replicación desde cualquier host de la red Docker.
echo "host replication replicator all md5" >> "$PGDATA/pg_hba.conf"

echo "Replicación habilitada: rol 'replicator' creado y pg_hba.conf actualizado."
