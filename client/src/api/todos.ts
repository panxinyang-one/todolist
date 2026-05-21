import axios from 'axios';
import type { Todo } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchTodos(): Promise<Todo[]> {
  const { data } = await api.get<Todo[]>('/todos');
  return data;
}

export async function createTodo(title: string): Promise<Todo> {
  const { data } = await api.post<Todo>('/todos', { title });
  return data;
}

export async function updateTodo(
  id: number,
  payload: Partial<Pick<Todo, 'title' | 'completed'>>
): Promise<Todo> {
  const { data } = await api.patch<Todo>(`/todos/${id}`, payload);
  return data;
}

export async function deleteTodo(id: number): Promise<void> {
  await api.delete(`/todos/${id}`);
}

export async function checkHealth(): Promise<{ status: string; database: string }> {
  const { data } = await api.get('/health');
  return data;
}
