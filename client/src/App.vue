<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as todosApi from './api/todos';
import type { Todo } from './types';
import TodoForm from './components/TodoForm.vue';
import TodoList from './components/TodoList.vue';

const todos = ref<Todo[]>([]);
const loading = ref(true);
const error = ref('');
const health = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    todos.value = await todosApi.fetchTodos();
  } catch {
    error.value = '无法加载待办，请确认后端与数据库已启动';
  } finally {
    loading.value = false;
  }
}

async function checkHealth() {
  try {
    const res = await todosApi.checkHealth();
    health.value = res.database === 'connected' ? 'API 正常' : '数据库未连接';
  } catch {
    health.value = 'API 不可用';
  }
}

async function onAdd(title: string) {
  try {
    const created = await todosApi.createTodo(title);
    todos.value = [created, ...todos.value];
  } catch {
    error.value = '添加失败';
  }
}

async function onToggle(id: number, completed: boolean) {
  try {
    const updated = await todosApi.updateTodo(id, { completed });
    todos.value = todos.value.map((t) => (t.id === id ? updated : t));
  } catch {
    error.value = '更新失败';
  }
}

async function onUpdate(id: number, title: string) {
  try {
    const updated = await todosApi.updateTodo(id, { title });
    todos.value = todos.value.map((t) => (t.id === id ? updated : t));
  } catch {
    error.value = '保存失败';
  }
}

async function onRemove(id: number) {
  try {
    await todosApi.deleteTodo(id);
    todos.value = todos.value.filter((t) => t.id !== id);
  } catch {
    error.value = '删除失败';
  }
}

onMounted(() => {
  checkHealth();
  load();
});
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>TodoList</h1>
      <p class="subtitle">Vue 3 + Express + MySQL</p>
      <span v-if="health" class="health" :class="{ ok: health === 'API 正常' }">{{ health }}</span>
    </header>

    <main class="main">
      <TodoForm @submit="onAdd" />
      <p v-if="error" class="error">{{ error }}</p>
      <TodoList
        :todos="todos"
        :loading="loading"
        @toggle="onToggle"
        @update="onUpdate"
        @remove="onRemove"
      />
    </main>

    <footer class="footer">
      <button type="button" class="refresh" @click="load">刷新列表</button>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0.35rem 0 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.health {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.health.ok {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error {
  margin: 0;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius);
  color: #fca5a5;
  font-size: 0.9rem;
}

.footer {
  margin-top: 2rem;
  text-align: center;
}

.refresh {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.refresh:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
</style>
