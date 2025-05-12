
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  userId: string;
  createdAt: string;
};

type TaskFilter = "all" | "completed" | "pending";

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  addTask: (task: Omit<Task, "id" | "userId" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  filteredTasks: Task[];
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadTasks = () => {
      if (user) {
        try {
          // In a real app, this would be an API call
          const savedTasks = localStorage.getItem("tasks");
          if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks) as Task[];
            // Only show tasks that belong to the current user
            setTasks(parsedTasks.filter(task => task.userId === user.id));
          }
        } catch (error) {
          console.error("Error loading tasks:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load tasks. Please try again.",
          });
        }
      }
      setIsLoading(false);
    };

    loadTasks();
  }, [user, toast]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      // In a real app, we would sync with the backend
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      ...taskData,
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast({
      title: "Task Added",
      description: `"${taskData.title}" has been added to your tasks.`,
    });
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...taskData } : task
      )
    );
    
    toast({
      title: "Task Updated",
      description: "Task has been updated successfully.",
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    
    toast({
      title: "Task Deleted",
      description: "Task has been deleted successfully.",
    });
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Filter tasks based on the current filter
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true; // "all" filter
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        filter,
        setFilter,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        filteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
