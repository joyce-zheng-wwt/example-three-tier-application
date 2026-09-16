'use client';

import { useState } from 'react';
import Calculator from './calculator';
import SnakeGame from './snake';
import TodoList from './todo-list';

type Tab = 'todo' | 'calculator' | 'snake';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('todo');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'todo', label: 'To-Do List', icon: '✓' },
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'snake', label: 'Snake Game', icon: '🐍' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 text-center">
          Mini Apps
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          {activeTab === 'todo' && <TodoList />}
          {activeTab === 'calculator' && <Calculator />}
          {activeTab === 'snake' && <SnakeGame />}
        </div>
      </div>
    </div>
  );
}
