
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, Plus, Edit, Trash2 } from "lucide-react";
import { useTasks, Task } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { filteredTasks, addTask, updateTask, deleteTask, toggleTaskStatus, filter, setFilter } = useTasks();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setCurrentTaskId(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;
    
    addTask({
      title,
      description,
      dueDate: dueDate.toISOString(),
      completed: false,
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTaskId || !dueDate) return;
    
    updateTask(currentTaskId, {
      title,
      description,
      dueDate: dueDate.toISOString(),
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(new Date(task.dueDate));
    setCurrentTaskId(task.id);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Tasks</h2>
            <p className="text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task to keep track of your work.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTask}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about your task"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update your task details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditTask}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about your task"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Update Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No tasks found. Add a new task to get started.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className={cn("overflow-hidden transition-all", 
                task.completed ? "border-l-4 border-l-taskComplete" : "")}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 w-full">
                      <CardTitle className={cn("text-xl line-clamp-1", task.completed && "task-completed")}>
                        {task.title}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <CalendarIcon className="w-3.5 h-3.5 mr-1" /> 
                        {format(new Date(task.dueDate), "PP")}
                      </CardDescription>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskStatus(task.id)}
                        title={task.completed ? "Mark as pending" : "Mark as completed"}
                      >
                        <Check className={cn("h-5 w-5", task.completed ? "text-taskComplete" : "text-muted-foreground")} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-sm", task.completed && "task-completed")}>
                    {task.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => openEditDialog(task)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
