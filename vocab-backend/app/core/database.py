import os
import logging
from typing import Optional, Any
from supabase import Client, create_client
from app.core.config import settings
from app.core.local_db import LocalDatabaseClient

logger = logging.getLogger("vocaship.database")

_active_client: Optional[Any] = None
DB_INIT_ERROR: Optional[str] = None


def _clean_env(value: Optional[str]) -> str:
    return str(value or "").strip().strip('"').strip("'").strip()


class FallbackQueryBuilder:
    def __init__(
        self,
        local_client: LocalDatabaseClient,
        table_name: str,
        method: str,
        columns: str = "*",
        count: Optional[str] = None,
        data: Any = None,
        update_data: Any = None,
    ):
        self.local_client = local_client
        self.table_name = table_name
        self.method = method
        self.columns = columns
        self.count = count
        self.data = data
        self.update_data = update_data
        self.chain = []

    def eq(self, column: str, value: Any):
        self.chain.append(("eq", (column, value), {}))
        return self

    def lte(self, column: str, value: Any):
        self.chain.append(("lte", (column, value), {}))
        return self

    def gte(self, column: str, value: Any):
        self.chain.append(("gte", (column, value), {}))
        return self

    def order(self, column: str, desc: bool = False):
        self.chain.append(("order", (column,), {"desc": desc}))
        return self

    def limit(self, limit: int):
        self.chain.append(("limit", (limit,), {}))
        return self

    def execute(self):
        tb = self.local_client.table(self.table_name)
        if self.method == "select":
            builder = tb.select(columns=self.columns, count=self.count)
        elif self.method == "insert":
            builder = tb.insert(self.data)
        elif self.method == "update":
            builder = tb.update(self.update_data)
        elif self.method == "delete":
            builder = tb.delete()
        else:
            builder = getattr(tb, self.method)()

        for name, a, kw in self.chain:
            b_method = getattr(builder, name)
            builder = b_method(*a, **kw)
        return builder.execute()


class FallbackTable:
    def __init__(self, local_client: LocalDatabaseClient, table_name: str):
        self.local_client = local_client
        self.table_name = table_name

    def select(self, columns: str = "*", count: Optional[str] = None):
        return FallbackQueryBuilder(
            self.local_client,
            self.table_name,
            "select",
            columns=columns,
            count=count,
        )

    def insert(self, data: Any):
        return FallbackQueryBuilder(
            self.local_client,
            self.table_name,
            "insert",
            data=data,
        )

    def update(self, data: Any):
        return FallbackQueryBuilder(
            self.local_client,
            self.table_name,
            "update",
            update_data=data,
        )

    def delete(self):
        return FallbackQueryBuilder(
            self.local_client,
            self.table_name,
            "delete",
        )


class FallbackDB:
    def __init__(self, local_client: LocalDatabaseClient):
        self.supabase_client = None
        self.local_client = local_client

    def table(self, table_name: str) -> FallbackTable:
        return FallbackTable(self.local_client, table_name)


# Geriye dönük uyumluluk takma adı
FallbackDatabaseClient = FallbackDB


def get_db():
    """
    Mümkün olduğunda doğrudan gerçek supabase.Client nesnesini döndürür (FallbackTable sarmalayıcısı olmadan).
    Yalnızca Supabase ortam değişkenleri eksikse veya create_client hata verirse FallbackDB döner
    ve hatayı DB_INIT_ERROR değişkenine kaydeder.
    """
    global _active_client, DB_INIT_ERROR

    if isinstance(_active_client, Client):
        return _active_client

    supabase_url = _clean_env(os.getenv("SUPABASE_URL") or settings.SUPABASE_URL)
    supabase_key = _clean_env(
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or settings.SUPABASE_KEY
    )

    if supabase_url and supabase_key:
        try:
            client = create_client(
                supabase_url=supabase_url,
                supabase_key=supabase_key,
            )
            _active_client = client
            DB_INIT_ERROR = None
            return _active_client
        except Exception as e:
            DB_INIT_ERROR = f"{type(e).__name__}: {e}"
            logger.error(f"[DB] Supabase create_client basarisiz: {DB_INIT_ERROR}")
    else:
        missing = []
        if not supabase_url:
            missing.append("SUPABASE_URL")
        if not supabase_key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY")
        DB_INIT_ERROR = f"Eksik ortam degiskeni: {', '.join(missing)}"
        logger.error(f"[DB] {DB_INIT_ERROR}")

    if _active_client is None:
        _active_client = FallbackDB(LocalDatabaseClient())
    return _active_client


def get_supabase_client() -> Optional[Client]:
    """Gerçek Supabase Client nesnesini döndürür; oluşturulamadıysa None döndürür."""
    db = get_db()
    if isinstance(db, Client):
        return db
    if hasattr(db, "supabase_client"):
        return db.supabase_client
    return None
