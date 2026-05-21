<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Todo } from '../types';

const props = defineProps<{
  todo: Todo;
}>();

const emit = defineEmits<{
  toggle: [id: number, completed: boolean];
  update: [id: number, title: string];
  remove: [id: number];
}>();

const editing = ref(false);
const editTitle = ref(props.todo.title);

watch(
  () => props.todo.title,
  (t) => {
    if (!editing.value) editTitle.value = t;
  }
);

function startEdit() {
  editing.value = true;
  editTitle.value = props.todo.title;
}

function saveEdit() {
  const value = editTitle.value.trim();
  editing.value = false;
  if (value && value !== props.todo.title) {
    emit('update', props.todo.id, value);
  }
}

function cancelEdit() {
  editing.value = false;
  editTitle.value = props.todo.title;
}
</script>

<template>
  <li class="todo-item" :class="{ completed: todo.completed }">
    <label class="checkbox-wrap">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="emit('toggle', todo.id, ($event.target as HTMLInputElement).checked)"
      />
      <span class="checkmark" />
    </label>

    <div v-if="editing" class="edit-row">
      <input
        v-model="editTitle"
        type="text"
        maxlength="255"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
      />
      <button type="button" class="btn-sm" @click="saveEdit">保存</button>
      <button type="button" class="btn-sm ghost" @click="cancelEdit">取消</button>
    </div>

    <span v-else class="title" @dblclick="startEdit">{{ todo.title }}</span>

    <div v-if="!editing" class="actions">
      <button type="button" class="btn-sm ghost" title="双击标题也可编辑" @click="startEdit">
        编辑
      </button>
      <button type="button" class="btn-sm danger" @click="emit('remove', todo.id)">删除</button>
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  list-style: none;
}

.todo-item.completed .title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-wrap input {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--accent);
}

.title {
  flex: 1;
  word-break: break-word;
}

.edit-row {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-row input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
}

.actions {
  display: flex;
  gap: 0.35rem;
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  background: var(--surface-hover);
  color: var(--text);
}

.btn-sm.ghost {
  background: transparent;
  border: 1px solid var(--border);
}

.btn-sm.danger {
  color: var(--danger);
  border: 1px solid transparent;
}

.btn-sm.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.btn-sm:hover {
  background: var(--surface-hover);
}
</style>
