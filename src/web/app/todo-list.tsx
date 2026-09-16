'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch {
        // If parsing fails, just use empty array
        setTasks([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: input,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setInput('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  if (isLoading) {
    return <div className="text-center text-zinc-500">Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Add task form */}
      <form onSubmit={addTask} className="flex gap-2 mb-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Add a new task..."
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          Add
        </button>
      </form>

      {/* Task list */}
      <ul className="space-y-2">
        {tasks.length === 0 && (
          <li className="text-zinc-400 text-center py-8">No tasks yet. Add one above!</li>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 px-4 py-3"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`h-5 w-5 rounded border-2 flex-shrink-0 transition-colors ${
                task.completed
                  ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50'
                  : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500'
              }`}
              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.completed && (
                <svg viewBox="0 0 12 12" className="text-white dark:text-zinc-900 w-full h-full p-0.5">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                task.completed
                  ? 'line-through text-zinc-400'
                  : 'text-zinc-800 dark:text-zinc-100'
              }`}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              aria-label="Delete task"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {tasks.length > 0 && (
        <p className="mt-4 text-xs text-zinc-400 text-right">
          {tasks.filter((t) => t.completed).length} / {tasks.length} completed
        </p>
      )}
    </div>
  );
}
