from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User, UserRole


def initialize_database() -> None:
    Base.metadata.create_all(bind=engine)
    migrate_task_statuses()
    seed_initial_admin()


def migrate_task_statuses() -> None:
    if engine.dialect.name != "postgresql":
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_enum
                        WHERE enumlabel = 'running'
                          AND enumtypid = 'task_status'::regtype
                    ) THEN
                        ALTER TYPE task_status ADD VALUE 'running';
                    END IF;
                EXCEPTION
                    WHEN undefined_object THEN
                        NULL;
                END $$;
                """
            )
        )

    # PostgreSQL requires the enum ALTER TYPE transaction to commit
    # before the new value can be referenced in subsequent statements.
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                UPDATE tasks
                SET status = CASE
                    WHEN status::text = 'in_progress' THEN 'running'::task_status
                    WHEN status::text = 'done' THEN 'completed'::task_status
                    ELSE status
                END
                WHERE status::text IN ('in_progress', 'done');
                """
            )
        )


def seed_initial_admin() -> None:
    if not settings.INITIAL_ADMIN_EMAIL or not settings.INITIAL_ADMIN_PASSWORD:
        return

    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL).first()
        if admin:
            return

        admin = User(
            email=settings.INITIAL_ADMIN_EMAIL,
            full_name=settings.INITIAL_ADMIN_FULL_NAME,
            hashed_password=hash_password(settings.INITIAL_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()
