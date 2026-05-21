<script setup lang="ts">
import type { Todo } from '../types';
import TodoItem from './TodoItem.vue';

defineProps<{
  todos: Todo[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  toggle: [id: number, completed: boolean];
  update: [id: number, title: string];
  remove: [id: number];
}>();
</script>

<template>
  <div class="todo-list-wrap">
    <p v-if="loading" class="hint">加载中…</p>
    <p v-else-if="todos.length === 0" class="hint empty">暂无待办，添加一条吧</p>
    <ul v-else class="todo-list">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="(id, c) => emit('toggle', id, c)"
        @update="(id, t) => emit('update', id, t)"
        @remove="(id) => emit('remove', id)"
      />
    </ul>
  </div>
</template>

<style scoped>
.todo-list {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 0;
}

.hint.empty {
  font-size: 0.95rem;
}
</style>
