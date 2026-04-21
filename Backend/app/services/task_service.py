from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.task import TaskStatus
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, payload: TaskCreate, current_user: User) -> Task:
    task_data = payload.model_dump()
    if current_user.role != UserRole.ADMIN:
        task_data["status"] = TaskStatus.PENDING

    task = Task(**task_data, owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task_by_id(db: Session, task_id: int) -> Task | None:
    return db.query(Task).filter(Task.id == task_id).first()


def get_accessible_task(db: Session, task_id: int, current_user: User) -> Task:
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    if current_user.role != UserRole.ADMIN and task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this task.",
        )

    return task


def list_tasks(db: Session, current_user: User) -> list[Task]:
    query = db.query(Task).order_by(Task.created_at.desc())
    if current_user.role == UserRole.ADMIN:
        return query.all()
    return query.filter(Task.owner_id == current_user.id).all()


def update_task(db: Session, task: Task, payload: TaskUpdate, current_user: User) -> Task:
    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change task status.",
        )

    for field, value in update_data.items():
        setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
