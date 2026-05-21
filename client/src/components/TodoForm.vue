<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  submit: [title: string];
}>();

const title = ref('');
const busy = ref(false);

async function onSubmit() {
  const value = title.value.trim();
  if (!value || busy.value) return;
  busy.value = true;
  try {
    emit('submit', value);
    title.value = '';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <form class="todo-form" @submit.prevent="onSubmit">
    <input
      v-model="title"
      type="text"
      placeholder="添加一条待办…"
      maxlength="255"
      :disabled="busy"
    />
    <button type="submit" :disabled="busy || !title.trim()">添加</button>
  </form>
</template>

<style scoped>
.todo-form {
  display: flex;
  gap: 0.75rem;
}

.todo-form input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
}

.todo-form input:focus {
  outline: none;
  border-color: var(--accent);
}

.todo-form button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.todo-form button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.todo-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
