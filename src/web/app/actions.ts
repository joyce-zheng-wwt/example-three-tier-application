'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

export type Alarm = {
  id: number;
  label: string;
  time: string;
  enabled: boolean;
  created_at: string;
};

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  revalidatePath('/');
}

export async function toggleTask(id: number, completed: boolean) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  revalidatePath('/');
}

export async function deleteTask(id: number) {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  revalidatePath('/');
}

export async function getAlarms(): Promise<Alarm[]> {
  const res = await fetch(`${API_URL}/alarms`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch alarms');
  return res.json();
}

export async function createAlarm(formData: FormData) {
  const time = formData.get('time') as string;
  const label = formData.get('label') as string;
  await fetch(`${API_URL}/alarms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ time, label }),
  });
  revalidatePath('/alarm');
}

export async function toggleAlarm(id: number, enabled: boolean) {
  await fetch(`${API_URL}/alarms/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  revalidatePath('/alarm');
}

export async function deleteAlarm(id: number) {
  await fetch(`${API_URL}/alarms/${id}`, { method: 'DELETE' });
  revalidatePath('/alarm');
}
