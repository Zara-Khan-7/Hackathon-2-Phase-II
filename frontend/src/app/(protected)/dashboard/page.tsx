"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/contexts/toast-context";
import { useSession } from "@/lib/auth-client";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskFilters } from "@/components/tasks/task-filters";
import { DeleteConfirmation } from "@/components/tasks/delete-confirmation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";
import Link from "next/link";
import type { Task, TaskFilters as FilterType, TaskStatus, CreateTaskInput, UpdateTaskInput } from "@/types/task";

function DashboardContent() {
  // Get session for user display (not for auth - that's handled by layout)
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh,
    isCreating,
    updatingId,
    deletingId,
  } = useTasks();

  // Modal states
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null);

  // Filter state - initialize once from URL using lazy initialization
  const initialStatus = searchParams.get("status") as TaskStatus | null;
  const initialPriority = searchParams.get("priority") as FilterType["priority"] | null;

  const [filters, setFilters] = React.useState<FilterType>({
    status: initialStatus || null,
    priority: initialPriority || null,
  });

  // Track if we've mounted to prevent URL updates on initial render
  const hasMounted = React.useRef(false);

  // Sync filters with URL using replace to avoid history stack issues
  // Only update URL after mount and when filters actually change
  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);

    const query = params.toString();
    const newPath = `/dashboard${query ? `?${query}` : ""}`;

    // Only update if the path actually changed
    const currentPath = window.location.pathname + window.location.search;
    if (newPath !== currentPath) {
      router.replace(newPath, { scroll: false });
    }
  }, [filters, router]);

  const handleFilterChange = React.useCallback((newFilters: FilterType) => {
    setFilters(newFilters);
  }, []);

  // Apply filters to tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, filters]);

  // Calculate task counts
  const taskCounts = React.useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  // Handlers
  const handleCreateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    try {
      await createTask(data as CreateTaskInput);
      setShowCreateModal(false);
      showToast({ type: "success", message: "Task created successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create task",
      });
      throw err;
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data as UpdateTaskInput);
      setEditingTask(null);
      showToast({ type: "success", message: "Task updated successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update task",
      });
      throw err;
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask(taskId, { status });
      showToast({
        type: "success",
        message: `Task marked as ${status.replace("_", " ")}`,
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update status",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      showToast({ type: "success", message: "Task deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete task",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
            <nav className="flex gap-2">
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Chat
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Title & Add Button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
            <p className="text-gray-600">
              Manage your tasks and stay organized
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            taskCounts={taskCounts}
          />
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          error={error}
          onStatusChange={handleStatusChange}
          onEdit={setEditingTask}
          onDelete={(taskId) => {
            const task = tasks.find((t) => t.id === taskId);
            if (task) setDeletingTask(task);
          }}
          onRetry={refresh}
          onAddTask={() => setShowCreateModal(true)}
          updatingId={updatingId}
          deletingId={deletingId}
          emptyMessage={
            filters.status || filters.priority
              ? "No tasks match your filters. Try adjusting or clearing filters."
              : "No tasks yet. Create your first task to get started!"
          }
        />
      </main>

      {/* Create Task Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isCreating}
        />
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            mode="edit"
            initialData={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            isSubmitting={updatingId === editingTask.id}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deletingTask !== null}
        taskTitle={deletingTask?.title || ""}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
        isDeleting={deletingId === deletingTask?.id}
      />
    </div>
  );
}

// Loading fallback for Suspense
function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading dashboard...</span>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
