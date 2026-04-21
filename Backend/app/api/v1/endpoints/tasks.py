from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import (
    create_task,
    delete_task,
    get_accessible_task,
    list_tasks,
    update_task,
)

router = APIRouter()


@router.get("", response_model=list[TaskResponse], status_code=status.HTTP_200_OK)
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskResponse]:
    tasks = list_tasks(db, current_user)
    return [TaskResponse.model_validate(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = create_task(db, payload, current_user)
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = get_accessible_task(db, task_id, current_user)
    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def update_existing_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = get_accessible_task(db, task_id, current_user)
    updated_task = update_task(db, task, payload, current_user)
    return TaskResponse.model_validate(updated_task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    task = get_accessible_task(db, task_id, current_user)
    delete_task(db, task)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
