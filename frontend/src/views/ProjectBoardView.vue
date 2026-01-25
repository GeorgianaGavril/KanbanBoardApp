<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { Button } from "primevue";
import { Dialog, InputText, Textarea } from "primevue";

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;

const project = ref(null);
const columns = ref([]);

const isTaskVisible = ref(false);
const selectedColumnId = ref(null);
const newTask = ref({
  title: "",
  description: "",
});

const isColumnVisible = ref(false);
const newColumnName = ref("");

const handleCreateColumn = async () => {
  if (!newColumnName.value.trim()) return;

  try {
    const res = await api.post(`/column/project/${projectId}`, {
      name: newColumnName.value,
      order: columns.value.length,
    });

    columns.value.push({
      ...res.data,
      tasks: [],
    });

    newColumnName.value = "";
    isColumnVisible.value = false;
  } catch (err) {
    console.error("Error when creating a column:", err);
  }
};

const deleteColumn = async (columnId) => {
  if (!confirm("Do you want to delete this column?")) return;

  try {
    await api.delete(`/column/${columnId}`);

    columns.value = columns.value.filter((c) => c.id !== columnId);
  } catch (err) {
    console.error("Error when deleting the column: ", err);
    alert("Couldn't delete the column.");
  }
};

const openAddTaskModal = (columnId) => {
  selectedColumnId.value = columnId;
  newTask.value = { title: "", description: "" };
  isTaskVisible.value = true;
};

const deleteTask = async (columnId, taskId) => {
  if (!confirm("Do you want to delete this task?")) return;

  try {
    await api.delete(`/task/${taskId}`);

    const col = columns.value.find((c) => c.id === columnId);
    if (col) {
      col.tasks = col.tasks.filter((t) => t.id !== taskId);
    }
  } catch (err) {
    alert("The task could not be deleted.");
  }
};

const handleCreateTask = async () => {
  if (!newTask.value.title.trim()) return;

  try {
    const res = await api.post("/task", {
      projectId: projectId,
      columnId: selectedColumnId.value,
      title: newTask.value.title,
      description: newTask.value.description,
    });

    const col = columns.value.find((c) => c.id === selectedColumnId.value);
    if (col) {
      if (!col.tasks) col.tasks = [];
      col.tasks.push(res.data);
    }

    isTaskVisible.value = false;
  } catch (err) {
    console.error("Error when creating the task: ", err);
  }
};

const fetchBoardData = async () => {
  try {
    const projectRes = await api.get(`/project/${projectId}`);
    project.value = projectRes.data;

    const columnsRes = await api.get(`/column/project/${projectId}`);
    columns.value = columnsRes.data;

    console.log(columns.value);
  } catch (err) {
    console.error("Error when fetching data:", err);
  }
};

onMounted(fetchBoardData);
</script>

<template>
  <div class="board-container">
    <header class="board-header">
      <div class="flex items-center gap-4">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push('/')"
        />
        <h1 v-if="project">{{ project.name }}</h1>
      </div>
      <Button
        label="Add Column"
        icon="pi pi-plus"
        size="small"
        @click="isColumnVisible = true"
      />
    </header>

    <Dialog
      v-model:visible="isTaskVisible"
      modal
      header="Add a New Task"
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="taskTitle" class="font-bold">Title *</label>
          <InputText id="taskTitle" v-model="newTask.title" autofocus />
        </div>
        <div class="flex flex-column gap-2">
          <label for="taskDesc" class="font-bold">Description</label>
          <Textarea id="taskDesc" v-model="newTask.description" rows="3" />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          text
          severity="secondary"
          @click="isTaskVisible = false"
        />
        <Button label="Save" icon="pi pi-check" @click="handleCreateTask" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="isColumnVisible"
      modal
      header="Add a New Column"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-column gap-2">
        <label for="colName" class="font-bold">Title</label>
        <InputText
          id="colName"
          v-model="newColumnName"
          autofocus
          @keyup.enter="handleCreateColumn"
        />
      </div>
      <template #footer>
        <Button
          label="Cancel"
          text
          severity="secondary"
          @click="isColumnVisible = false"
        />
        <Button
          label="Add Column"
          icon="pi pi-check"
          @click="handleCreateColumn"
        />
      </template>
    </Dialog>

    <div class="kanban-wrapper">
      <div v-for="column in columns" :key="column.id" class="kanban-column">
        <div class="column-header">
          <h3>{{ column.name }}</h3>
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            size="small"
            @click="deleteColumn(column.id)"
          />
        </div>

        <div class="task-list">
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="task-card group"
          >
            <div class="flex justify-between items-start">
              <div class="task-content">
                {{ task.title }}
              </div>
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                class="delete-task-btn"
                @click="deleteTask(column.id, task.id)"
              />
            </div>
            <p v-if="task.description" class="text-xs text-gray-500 mt-1">
              {{ task.description }}
            </p>
          </div>

          <div
            v-if="!column.tasks || column.tasks.length === 0"
            class="empty-column-msg"
          >
            No tasks
          </div>
        </div>

        <Button
          label="Add Task"
          icon="pi pi-plus"
          text
          fluid
          class="mt-2"
          @click="openAddTaskModal(column.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f3f2ff;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.kanban-wrapper {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-x: auto;
  flex-grow: 1;
}

.kanban-column {
  background-color: #ebedf0;
  min-width: 300px;
  max-width: 300px;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.column-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #272264;
}

.task-list {
  flex-grow: 1;
  overflow-y: auto;
}

.task-card {
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.task-card:hover {
  border-color: #272264;
}

.task-content {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 0.5rem;
}

.task-footer {
  color: #aaa;
  display: flex;
  justify-content: flex-end;
}

.empty-column-msg {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  padding: 2rem 0;
}

.task-card {
  position: relative;
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.task-card:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
}

.task-content {
  font-weight: 500;
  color: #1e293b;
}
</style>
