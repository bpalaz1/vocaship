import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


class ResponseResult:
    def __init__(self, data: Optional[List[Dict[str, Any]]] = None, count: Optional[int] = None):
        self.data = data or []
        self.count = count


class QueryBuilder:
    def __init__(self, client: "LocalDatabaseClient", table: str, mode: str, **kwargs):
        self.client = client
        self.table = table
        self.mode = mode  # 'select', 'insert', 'update', 'delete'
        self.columns = kwargs.get("columns", "*")
        self.count_mode = kwargs.get("count", None)
        self.insert_data = kwargs.get("data", None)
        self.update_data = kwargs.get("update_data", None)
        self.filters: List[tuple] = []
        self.order_by: Optional[str] = None
        self.order_desc: bool = False
        self.limit_val: Optional[int] = None

    def eq(self, column: str, value: Any) -> "QueryBuilder":
        self.filters.append((column, "=", value))
        return self

    def lte(self, column: str, value: Any) -> "QueryBuilder":
        self.filters.append((column, "<=", value))
        return self

    def gte(self, column: str, value: Any) -> "QueryBuilder":
        self.filters.append((column, ">=", value))
        return self

    def order(self, column: str, desc: bool = False) -> "QueryBuilder":
        self.order_by = column
        self.order_desc = desc
        return self

    def limit(self, limit: int) -> "QueryBuilder":
        self.limit_val = limit
        return self

    def execute(self) -> ResponseResult:
        if self.mode == "select":
            return self._execute_select()
        elif self.mode == "insert":
            return self._execute_insert()
        elif self.mode == "update":
            return self._execute_update()
        elif self.mode == "delete":
            return self._execute_delete()
        return ResponseResult([], 0)

    def _execute_select(self) -> ResponseResult:
        where_clauses = []
        params = []
        for col, op, val in self.filters:
            if isinstance(val, bool):
                val = 1 if val else 0
            if val is None:
                where_clauses.append(f"{col} IS NULL")
            else:
                where_clauses.append(f"{col} {op} ?")
                params.append(val)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        order_sql = f" ORDER BY {self.order_by} {'DESC' if self.order_desc else 'ASC'}" if self.order_by else ""
        limit_sql = f" LIMIT {self.limit_val}" if self.limit_val is not None else ""

        exact_count = None
        with self.client.get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            if self.count_mode == "exact":
                count_query = f"SELECT COUNT(*) as c FROM {self.table}{where_sql}"
                cursor.execute(count_query, params)
                c_row = cursor.fetchone()
                exact_count = c_row["c"] if c_row else 0

            # Column selection
            cols = self.columns
            if cols != "*":
                # Ensure comma-separated
                cols_split = [c.strip() for c in cols.split(",") if c.strip()]
                cols = ", ".join(cols_split)

            query = f"SELECT {cols} FROM {self.table}{where_sql}{order_sql}{limit_sql}"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = [self.client.deserialize_row(self.table, dict(r)) for r in rows]

            return ResponseResult(data=results, count=exact_count if exact_count is not None else len(results))

    def _execute_insert(self) -> ResponseResult:
        items = self.insert_data
        if isinstance(items, dict):
            items = [items]

        inserted_rows = []
        now_iso = datetime.now(timezone.utc).isoformat()

        with self.client.get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            for item in items:
                row_data = dict(item)
                if not row_data.get("id"):
                    row_data["id"] = str(uuid.uuid4())
                if "created_at" not in row_data or not row_data["created_at"]:
                    row_data["created_at"] = now_iso
                if self.table == "users" and not row_data.get("email"):
                    uname = row_data.get("username") or row_data["id"]
                    row_data["email"] = f"{uname}@vorego.local"

                # Serialize JSON fields
                serialized = self.client.serialize_row(self.table, row_data)
                cols = list(serialized.keys())
                placeholders = [f":{c}" for c in cols]
                sql = f"INSERT INTO {self.table} ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
                cursor.execute(sql, serialized)

                cursor.execute(f"SELECT * FROM {self.table} WHERE id = ?", (row_data["id"],))
                res_row = cursor.fetchone()
                if res_row:
                    inserted_rows.append(self.client.deserialize_row(self.table, dict(res_row)))
            conn.commit()

        return ResponseResult(data=inserted_rows, count=len(inserted_rows))

    def _execute_update(self) -> ResponseResult:
        where_clauses = []
        params = []
        for col, op, val in self.filters:
            if isinstance(val, bool):
                val = 1 if val else 0
            if val is None:
                where_clauses.append(f"{col} IS NULL")
            else:
                where_clauses.append(f"{col} {op} ?")
                params.append(val)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        serialized = self.client.serialize_row(self.table, dict(self.update_data))

        set_clauses = [f"{k} = ?" for k in serialized.keys()]
        sql_params = list(serialized.values()) + params

        updated_rows = []
        with self.client.get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Find matching ids first
            cursor.execute(f"SELECT id FROM {self.table}{where_sql}", params)
            matching_ids = [r["id"] for r in cursor.fetchall()]

            if matching_ids and set_clauses:
                sql = f"UPDATE {self.table} SET {', '.join(set_clauses)}{where_sql}"
                cursor.execute(sql, sql_params)
                conn.commit()

                placeholders = ",".join("?" for _ in matching_ids)
                cursor.execute(f"SELECT * FROM {self.table} WHERE id IN ({placeholders})", matching_ids)
                updated_rows = [self.client.deserialize_row(self.table, dict(r)) for r in cursor.fetchall()]

        return ResponseResult(data=updated_rows, count=len(updated_rows))

    def _execute_delete(self) -> ResponseResult:
        where_clauses = []
        params = []
        for col, op, val in self.filters:
            if val is None:
                where_clauses.append(f"{col} IS NULL")
            else:
                where_clauses.append(f"{col} {op} ?")
                params.append(val)

        where_sql = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        deleted_rows = []

        with self.client.get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute(f"SELECT * FROM {self.table}{where_sql}", params)
            deleted_rows = [self.client.deserialize_row(self.table, dict(r)) for r in cursor.fetchall()]

            cursor.execute(f"DELETE FROM {self.table}{where_sql}", params)
            conn.commit()

        return ResponseResult(data=deleted_rows, count=len(deleted_rows))


class LocalTable:
    def __init__(self, client: "LocalDatabaseClient", name: str):
        self.client = client
        self.name = name

    def select(self, columns: str = "*", count: Optional[str] = None) -> QueryBuilder:
        return QueryBuilder(self.client, self.name, "select", columns=columns, count=count)

    def insert(self, data: Union[Dict[str, Any], List[Dict[str, Any]]]) -> QueryBuilder:
        return QueryBuilder(self.client, self.name, "insert", data=data)

    def update(self, data: Dict[str, Any]) -> QueryBuilder:
        return QueryBuilder(self.client, self.name, "update", update_data=data)

    def delete(self) -> QueryBuilder:
        return QueryBuilder(self.client, self.name, "delete")


class LocalDatabaseClient:
    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            base_dir = Path(__file__).resolve().parent.parent.parent
            db_dir = base_dir / "database"
            db_dir.mkdir(parents=True, exist_ok=True)
            voca_db = db_dir / "vocaship_local.db"
            old_db = db_dir / "quizwise_local.db"
            if not voca_db.exists() and old_db.exists():
                try:
                    import shutil
                    shutil.copy2(old_db, voca_db)
                except Exception:
                    pass
            db_path = str(voca_db if voca_db.exists() or not old_db.exists() else old_db)
        self.db_path = db_path
        self._init_db()

    def get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def table(self, table_name: str) -> LocalTable:
        return LocalTable(self, table_name)

    def _init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT,
                is_pro INTEGER DEFAULT 0,
                is_educator INTEGER DEFAULT 0,
                subscription_id TEXT,
                daily_ai_requests INTEGER DEFAULT 0,
                last_request_date TEXT,
                total_xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                streak_days INTEGER DEFAULT 1,
                last_active_date TEXT,
                created_at TEXT
            );
            """)

            def _safe_add_columns(table_name: str, columns: List[tuple]) -> None:
                try:
                    cursor.execute(f"PRAGMA table_info({table_name});")
                    existing_cols = {col[1] for col in cursor.fetchall()}
                except Exception:
                    existing_cols = set()
                for col_name, col_def in columns:
                    if col_name not in existing_cols:
                        try:
                            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def};")
                            existing_cols.add(col_name)
                        except Exception:
                            pass

            # Dynamic migration for existing users table
            _safe_add_columns("users", [
                ("total_xp", "INTEGER DEFAULT 0"),
                ("level", "INTEGER DEFAULT 1"),
                ("streak_days", "INTEGER DEFAULT 1"),
                ("subscription_status", "TEXT"),
                ("pro_expires_at", "TEXT"),
                ("plan_tier", "TEXT DEFAULT 'basic'"),
                ("last_active_date", "TEXT"),
                ("coins", "INTEGER DEFAULT 300"),
                ("active_avatar", "TEXT DEFAULT '🌟'"),
                ("active_avatar_id", "TEXT DEFAULT 'char_default'"),
                ("username", "TEXT"),
                ("password_hash", "TEXT"),
                ("role", "TEXT DEFAULT 'user'"),
                ("daily_custom_texts_used", "INTEGER DEFAULT 0"),
                ("daily_speaking_sessions_used", "INTEGER DEFAULT 0"),
                ("last_quota_reset_date", "TEXT"),
                ("inventory_keys", "TEXT DEFAULT '{}'"),
                ("avatar_url", "TEXT"),
                ("email_confirmed", "INTEGER DEFAULT 0"),
                ("trial_ends_at", "TEXT"),
                ("lemon_customer_id", "TEXT"),
                ("lemon_subscription_id", "TEXT"),
            ])

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                name TEXT NOT NULL,
                color TEXT DEFAULT '#6366f1',
                created_at TEXT
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS decks (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                folder_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                source_lang TEXT DEFAULT 'tr',
                target_lang TEXT DEFAULT 'en',
                is_public INTEGER DEFAULT 0,
                created_at TEXT
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS flashcards (
                id TEXT PRIMARY KEY,
                deck_id TEXT,
                word TEXT NOT NULL,
                phonetic TEXT,
                meanings TEXT,
                grammar_notes TEXT,
                example_sentences TEXT,
                collocations TEXT,
                ease_factor REAL DEFAULT 2.5,
                interval_days INTEGER DEFAULT 0,
                repetitions INTEGER DEFAULT 0,
                repetition_number INTEGER DEFAULT 0,
                mistake_count INTEGER DEFAULT 0,
                consecutive_correct INTEGER DEFAULT 0,
                needs_review INTEGER DEFAULT 0,
                next_review_date TEXT,
                last_reviewed_at TEXT,
                created_at TEXT
            );
            """)

            _safe_add_columns("flashcards", [
                ("mistake_count", "INTEGER DEFAULT 0"),
                ("consecutive_correct", "INTEGER DEFAULT 0"),
                ("needs_review", "INTEGER DEFAULT 0"),
            ])

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS shared_items (
                id TEXT PRIMARY KEY,
                pin TEXT UNIQUE NOT NULL,
                item_type TEXT NOT NULL,
                item_id TEXT,
                title TEXT,
                payload TEXT,
                created_at TEXT
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS teacher_stories (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                level TEXT DEFAULT 'Intermediate',
                topic TEXT DEFAULT 'Genel',
                content TEXT NOT NULL,
                target_vocabulary TEXT,
                comprehension_questions TEXT,
                status TEXT DEFAULT 'pending',
                visibility TEXT DEFAULT 'class_only',
                share_code TEXT,
                created_at TEXT
            );
            """)

            cursor.executescript("""
            CREATE TABLE IF NOT EXISTS unlocked_characters (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                character_id TEXT NOT NULL,
                unlocked_at TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS classrooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                grade_level TEXT DEFAULT 'Intermediate',
                code TEXT UNIQUE NOT NULL,
                student_count INTEGER DEFAULT 0,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS classroom_assignments (
                id TEXT PRIMARY KEY,
                classroom_id TEXT NOT NULL,
                class_code TEXT NOT NULL,
                title TEXT NOT NULL,
                story_content TEXT,
                target_words TEXT,
                questions TEXT,
                due_date TEXT,
                completed_percent INTEGER DEFAULT 0,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS session_rewards (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                rank INTEGER NOT NULL,
                xp INTEGER NOT NULL,
                coins INTEGER NOT NULL,
                key_reward TEXT,
                claimed_at TEXT,
                UNIQUE (session_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS class_members (
                id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                class_code TEXT NOT NULL,
                user_id TEXT NOT NULL,
                joined_at TEXT,
                UNIQUE (class_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS speaking_archives (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_title TEXT NOT NULL,
                transcript TEXT NOT NULL,
                metrics TEXT NOT NULL,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS xp_transactions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                xp_amount INTEGER NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS payout_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                account_type TEXT DEFAULT 'individual',
                legal_full_name TEXT NOT NULL,
                identity_number TEXT NOT NULL,
                iban TEXT NOT NULL,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS classes (
                id TEXT PRIMARY KEY,
                teacher_id TEXT NOT NULL,
                name TEXT NOT NULL,
                price REAL DEFAULT 0.0,
                currency TEXT DEFAULT 'TRY',
                billing_type TEXT DEFAULT 'one_time',
                schedule_mode TEXT DEFAULT 'fixed',
                duration_minutes INTEGER DEFAULT 60,
                monthly_credits INTEGER DEFAULT 0,
                invite_slug TEXT UNIQUE NOT NULL,
                code TEXT,
                student_count INTEGER DEFAULT 0,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS class_sessions (
                id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                session_date_utc TEXT NOT NULL,
                duration_minutes INTEGER DEFAULT 60,
                status TEXT DEFAULT 'scheduled',
                join_code TEXT,
                notes TEXT,
                started_at TEXT,
                ended_at TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS session_attendees (
                id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                session_id TEXT,
                user_id TEXT NOT NULL,
                payment_status TEXT DEFAULT 'free',
                joined_at TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS material_deliveries (
                id TEXT PRIMARY KEY,
                teacher_id TEXT NOT NULL,
                class_id TEXT NOT NULL,
                subject TEXT NOT NULL,
                message_body TEXT NOT NULL,
                attachment_url TEXT,
                sent_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'delivered',
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS word_cache (
                id TEXT PRIMARY KEY,
                cache_key TEXT UNIQUE NOT NULL,
                word TEXT NOT NULL,
                target_lang TEXT NOT NULL,
                native_lang TEXT NOT NULL,
                phonetic TEXT DEFAULT '',
                translation TEXT NOT NULL,
                definition TEXT DEFAULT '',
                part_of_speech TEXT DEFAULT '',
                example_target TEXT DEFAULT '',
                example_native TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                source TEXT DEFAULT 'memory_cache',
                created_at TEXT,
                updated_at TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_word_cache_lookup
                ON word_cache (word, target_lang, native_lang);
            """)

            _safe_add_columns("unlocked_characters", [
                ("created_at", "TEXT"),
            ])

            _safe_add_columns("class_sessions", [
                ("join_code", "TEXT"),
                ("notes", "TEXT"),
            ])

            # Ensure default user exists
            cursor.execute("SELECT id FROM users LIMIT 1;")
            if not cursor.fetchone():
                cursor.execute("""
                INSERT INTO users (id, email, full_name, created_at)
                VALUES (?, ?, ?, ?);
                """, (
                    "00000000-0000-0000-0000-000000000001",
                    "user@vocaship.com",
                    "Varsayılan Kullanıcı",
                    datetime.now(timezone.utc).isoformat()
                ))

            conn.commit()

    def serialize_row(self, table: str, row: Dict[str, Any]) -> Dict[str, Any]:
        result = {}
        for k, v in row.items():
            if table == "flashcards" and k in ("meanings", "example_sentences", "collocations"):
                if isinstance(v, (list, dict)):
                    result[k] = json.dumps(v, ensure_ascii=False)
                else:
                    result[k] = v
            elif table == "flashcards" and k == "needs_review":
                result[k] = 1 if v else 0
            elif table == "users" and k in ("is_pro", "is_educator"):
                result[k] = 1 if v else 0
            elif table == "shared_items" and k in ("payload",):
                if isinstance(v, (list, dict)):
                    result[k] = json.dumps(v, ensure_ascii=False)
                else:
                    result[k] = v
            elif table == "teacher_stories" and k in ("target_vocabulary", "comprehension_questions"):
                if isinstance(v, (list, dict)):
                    result[k] = json.dumps(v, ensure_ascii=False)
                else:
                    result[k] = v
            else:
                result[k] = v
        return result

    def deserialize_row(self, table: str, row: Dict[str, Any]) -> Dict[str, Any]:
        result = {}
        for k, v in row.items():
            if table == "flashcards" and k in ("meanings", "example_sentences", "collocations"):
                if isinstance(v, str) and v.strip():
                    try:
                        result[k] = json.loads(v)
                    except Exception:
                        result[k] = []
                elif v is None:
                    result[k] = []
                else:
                    result[k] = v
            elif table == "flashcards" and k == "needs_review":
                result[k] = bool(v)
            elif table == "users" and k in ("is_pro", "is_educator"):
                result[k] = bool(v)
            elif table == "shared_items" and k in ("payload",):
                if isinstance(v, str) and v.strip():
                    try:
                        result[k] = json.loads(v)
                    except Exception:
                        result[k] = {}
                elif v is None:
                    result[k] = {}
                else:
                    result[k] = v
            elif table == "teacher_stories" and k in ("target_vocabulary", "comprehension_questions"):
                if isinstance(v, str) and v.strip():
                    try:
                        result[k] = json.loads(v)
                    except Exception:
                        result[k] = []
                elif v is None:
                    result[k] = []
                else:
                    result[k] = v
            else:
                result[k] = v
        return result

    def get_word_cache(
        self, word: str, target_lang: str, native_lang: str
    ) -> Optional[Dict[str, Any]]:
        norm_word = " ".join((word or "").strip().lower().split())
        t_lang = (target_lang or "en").strip().lower()
        n_lang = (native_lang or "tr").strip().lower()
        if not norm_word:
            return None
        cache_key = f"{t_lang}:{n_lang}:{norm_word}"
        try:
            with self.get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT * FROM word_cache WHERE cache_key = ? LIMIT 1",
                    (cache_key,),
                )
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception:
            return None

    def upsert_word_cache(
        self,
        word: str,
        target_lang: str,
        native_lang: str,
        translation: str,
        phonetic: str = "",
        definition: str = "",
        part_of_speech: str = "",
        example_target: str = "",
        example_native: str = "",
        notes: str = "",
        source: str = "memory_cache",
    ) -> None:
        norm_word = " ".join((word or "").strip().lower().split())
        t_lang = (target_lang or "en").strip().lower()
        n_lang = (native_lang or "tr").strip().lower()
        clean_trans = (translation or "").strip()
        if not norm_word or not clean_trans:
            return
        cache_key = f"{t_lang}:{n_lang}:{norm_word}"
        now_iso = datetime.now(timezone.utc).isoformat()
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO word_cache (
                        id, cache_key, word, target_lang, native_lang,
                        phonetic, translation, definition, part_of_speech,
                        example_target, example_native, notes, source,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(cache_key) DO UPDATE SET
                        phonetic = CASE WHEN excluded.phonetic != '' THEN excluded.phonetic ELSE word_cache.phonetic END,
                        translation = excluded.translation,
                        definition = CASE WHEN excluded.definition != '' THEN excluded.definition ELSE word_cache.definition END,
                        part_of_speech = CASE WHEN excluded.part_of_speech != '' THEN excluded.part_of_speech ELSE word_cache.part_of_speech END,
                        example_target = CASE WHEN excluded.example_target != '' THEN excluded.example_target ELSE word_cache.example_target END,
                        example_native = CASE WHEN excluded.example_target != '' THEN excluded.example_native ELSE word_cache.example_native END,
                        notes = CASE WHEN excluded.notes != '' THEN excluded.notes ELSE word_cache.notes END,
                        source = excluded.source,
                        updated_at = excluded.updated_at
                    """,
                    (
                        str(uuid.uuid4()),
                        cache_key,
                        norm_word,
                        t_lang,
                        n_lang,
                        (phonetic or "").strip(),
                        clean_trans,
                        (definition or "").strip(),
                        (part_of_speech or "").strip(),
                        (example_target or "").strip(),
                        (example_native or "").strip(),
                        (notes or "").strip(),
                        (source or "memory_cache").strip(),
                        now_iso,
                        now_iso,
                    ),
                )
                conn.commit()
        except Exception:
            pass
