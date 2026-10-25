import logging
from typing import Optional, Any
from supabase import Client, create_client
from app.core.config import settings
from app.core.local_db import LocalDatabaseClient

logger = logging.getLogger("vocaship.database")

_active_client: Optional[Any] = None
_use_local: bool = False


class FallbackQueryBuilder:
    def __init__(
        self,
        supabase_client: Optional[Client],
        local_client: LocalDatabaseClient,
        table_name: str,
        method: str,
        columns: str = "*",
        count: Optional[str] = None,
        data: Any = None,
        update_data: Any = None,
    ):
        self.supabase_client = supabase_client
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
        global _use_local
        if not _use_local and self.supabase_client:
            try:
                tb = self.supabase_client.table(self.table_name)
                if self.method == "select":
                    kwargs = {}
                    if self.count:
                        kwargs["count"] = self.count
                    builder = tb.select(self.columns, **kwargs)
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
            except Exception as e:
                logger.warning(
                    f"[UYARI] Supabase baglantisi basarisiz ({type(e).__name__}: {e}). "
                    f"Otomatik olarak yerel SQLite veritabanina (vocaship_local.db) gecildi."
                )
                _use_local = True

        # Local DB Fallback
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
    def __init__(
        self,
        supabase_client: Optional[Client],
        local_client: LocalDatabaseClient,
        table_name: str,
    ):
        self.supabase_client = supabase_client
        self.local_client = local_client
        self.table_name = table_name

    def select(self, columns: str = "*", count: Optional[str] = None):
        return FallbackQueryBuilder(
            self.supabase_client,
            self.local_client,
            self.table_name,
            "select",
            columns=columns,
            count=count,
        )

    def insert(self, data: Any):
        return FallbackQueryBuilder(
            self.supabase_client,
            self.local_client,
            self.table_name,
            "insert",
            data=data,
        )

    def update(self, data: Any):
        return FallbackQueryBuilder(
            self.supabase_client,
            self.local_client,
            self.table_name,
            "update",
            update_data=data,
        )

    def delete(self):
        return FallbackQueryBuilder(
            self.supabase_client,
            self.local_client,
            self.table_name,
            "delete",
        )


class FallbackDatabaseClient:
    def __init__(self, supabase_client: Optional[Client], local_client: LocalDatabaseClient):
        self.supabase_client = supabase_client
        self.local_client = local_client

    def table(self, table_name: str) -> FallbackTable:
        return FallbackTable(self.supabase_client, self.local_client, table_name)


def get_db():
    global _active_client
    if _active_client is None:
        local_client = LocalDatabaseClient()
        supabase_client = None

        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                supabase_client = create_client(
                    supabase_url=settings.SUPABASE_URL,
                    supabase_key=settings.SUPABASE_KEY,
                )
            except Exception as e:
                logger.warning(f"Supabase client olusturulamadi: {e}")

        _active_client = FallbackDatabaseClient(supabase_client, local_client)

    return _active_client
