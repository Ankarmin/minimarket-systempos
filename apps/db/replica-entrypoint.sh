#!/bin/bash
# ============================================================
# Arranque de la RÉPLICA (Mirror / hot standby).
# En el primer arranque clona el primario con pg_basebackup y deja
# configurada la conexión de streaming (-R). En arranques posteriores
# simplemente inicia PostgreSQL en modo standby.
# ============================================================
set -e

DATA_DIR="/var/lib/postgresql/data"

if [ -z "$(ls -A "$DATA_DIR" 2>/dev/null)" ]; then
  echo "Réplica: clonando el primario con pg_basebackup..."
  until pg_basebackup \
      -d "postgresql://replicator:replicator_pwd@postgres-primary:5432/minimarket_db" \
      -D "$DATA_DIR" -Fp -Xs -P -R
  do
    echo "Primario no disponible todavía, reintentando en 2s..."
    sleep 2
  done
  echo "Réplica: clonación completada. standby.signal escrito por -R."
fi

# PostgreSQL exige permisos 0700 (o 0750) en el directorio de datos; el
# volumen de Docker puede quedar con permisos más abiertos tras el basebackup.
chmod 0700 "$DATA_DIR"

# hot_standby=on permite consultas de sólo lectura sobre la réplica.
exec postgres -c hot_standby=on
