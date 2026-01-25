<script setup>
import { auth } from "../../firebaseConfig";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import api from "../services/api";
import { onMounted, ref, computed } from "vue";
import {
  Card,
  Button,
  Dialog,
  InputText,
  Textarea,
  Tag,
  SelectButton,
} from "primevue";
import dayjs from "dayjs";

const isProjectVisible = ref(false);
const newProject = ref({
  name: "",
  description: "",
  status: "Active",
});

const router = useRouter();
const authStore = useAuthStore();
const user = ref(null);
const projects = ref(null);

const searchQuery = ref("");
const statusFilter = ref("All");

const filteredProjects = computed(() => {
  if (!projects.value) return [];

  return projects.value.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    const matchesStatus =
      statusFilter.value === "All" || project.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    await authStore.setUser(null);
    router.push("/login");
  } catch (err) {
    console.error("Logout error: ".err);
  }
};

const handleCreateProject = async () => {
  if (!newProject.value.name.trim()) return;

  try {
    const res = await api.post("/project", {
      name: newProject.value.name,
      description: newProject.value.description,
      status: newProject.value.status,
    });

    if (projects.value) {
      projects.value.push(res.data);
    } else {
      projects.value = [res.data];
    }

    isProjectVisible.value = false;
    newProject.value = { name: "", description: "", status: "Active" };
  } catch (err) {
    console.error("Eroare la crearea proiectului:", err);
  }
};

const deleteProject = async (projectId) => {
  if (!confirm("Do you want to delete this project?")) return;
  try {
    await api.delete(`/project/${projectId}`);
    projects.value = projects.value.filter((p) => p.id !== projectId);
  } catch (err) {
    alert("Error when deleting the project: ", err);
  }
};

const toggleStatus = async (project) => {
  const nextStatus = project.status === "Active" ? "Completed" : "Active";
  try {
    await api.put(`/project/${project.id}`, { status: nextStatus });
    project.status = nextStatus;
  } catch (err) {
    alert("Could not change the status");
  }
};

const getStatusSeverity = (status) => {
  return status === "Active" ? "success" : "info";
};

const fetchUser = async () => {
  try {
    const id = authStore?.user.uid;

    if (id) {
      const res = await api.get(`/user/${id}`);
      user.value = res.data;
    }
  } catch (err) {
    console.error("Error fetching user: ", err);
  }
};

const fetchProjects = async () => {
  try {
    const res = await api.get("/project");
    projects.value = res.data.map((project) => ({
      ...project,
      creation_date: project.creation_date?.seconds
        ? new Date(project.creation_date.seconds * 1000)
        : project.creation_date,
    }));
  } catch (err) {
    console.log("Error fetching projects: ", err);
  }
};

const goToProject = (projectId) => {
  if (projectId) {
    router.push(`/project/${projectId}`);
  } else {
    console.error("Project doesn't have a valid ID.");
  }
};

const formatFirestoreDate = (date) => {
  if (!date) return "";

  return dayjs.unix(date._seconds).format("DD.MM.YYYY");
};

onMounted(() => {
  fetchUser();
  fetchProjects();
});
</script>

<template>
  <div class="dashboard">
    <div class="sidebar">
      <p v-if="authStore.user">
        Welcome back, <strong>{{ user?.name }}!</strong>
      </p>
      <ul>
        <h3>Home</h3>
        <div class="sidebar-item" @click="isProjectVisible = true">
          <h3>Create a project</h3>
        </div>
        <Button @click="handleLogout">Logout</Button>
      </ul>
    </div>

    <div class="project-section">
      <h1>Your Projects</h1>

      <div class="filter-bar flex gap-3 mb-4 items-center">
        <span class="p-input-icon-left flex-grow-1">
          <i class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Search projects..."
            class="w-full"
          />
        </span>

        <SelectButton
          v-model="statusFilter"
          :options="['All', 'Active', 'Completed']"
          aria-labelledby="basic"
        />
      </div>

      <div class="projects-grid">
        <Card
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
        >
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="project-title">{{ project.name }}</span>
              <Tag
                :value="project.status"
                :severity="getStatusSeverity(project.status)"
                class="cursor-pointer status-tag"
                @click="toggleStatus(project)"
              />
            </div>
          </template>

          <template #content>
            <p class="description">{{ project.description }}</p>

            <div
              class="flex justify-content-between align-items-center mt-3 dateDelete"
            >
              <small class="text-gray-500 createDate">
                <small class="pi pi-calendar mr-1"></small>
                {{ formatFirestoreDate(project.creation_date) }}
              </small>
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                @click="deleteProject(project.id)"
              />
            </div>
          </template>

          <template #footer>
            <Button
              label="See Board"
              icon="pi pi-arrow-right"
              fluid
              @click="goToProject(project.id)"
            />
          </template>
        </Card>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="isProjectVisible"
    modal
    header="Create a New Project"
    :style="{ width: '30vw' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
  >
    <div class="flex flex-column gap-4">
      <div class="flex flex-column gap-2">
        <label for="p-name" class="font-semibold">Title</label>
        <InputText id="p-name" v-model="newProject.name" autofocus />
      </div>

      <div class="flex flex-column gap-2">
        <label for="p-desc" class="font-semibold">Description</label>
        <Textarea id="p-desc" v-model="newProject.description" rows="3" />
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        severity="secondary"
        @click="isProjectVisible = false"
      />
      <Button label="Create" icon="pi pi-check" @click="handleCreateProject" />
    </template>
  </Dialog>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  background-color: #272264;
}

.sidebar {
  width: 300px;
  background-color: #272264;
  padding: 2rem 1rem;
  color: #e2e8f0;
}

.sidebar p {
  font-size: 2.1rem;
  margin-bottom: 4rem;
  border-bottom: 1px solid rgba(243, 242, 255, 0.1);
  padding-bottom: 1.5rem;
  text-align: center;
}

.sidebar ul {
  text-align: center;
  padding-left: 0;
}

.sidebar ul h3 {
  margin-bottom: 30px;
}

.project-section {
  display: flex;
  flex-direction: column;
  width: 80%;
  padding: 20px 40px;
  /* background: linear-gradient(
    180deg,
    rgb(224 246 255) 0%,
    rgb(236 251 255) 23%,
    rgba(255, 255, 255, 1) 100%
  ); */
  background-color: #f3f2ff;
  border-bottom-left-radius: 25px;
  border-top-left-radius: 25px;
  box-shadow: 2px 4px 16px black;
}

.project-section h1 {
  color: #272264;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.project-card {
  background-color: #ffffff;
  color: #272264;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(39, 34, 100, 0.2);
}

.description {
  min-height: 3rem;
}

.project-card Button {
  background-color: #272264;
  color: #ffffff;
}

.dateDelete {
  display: flex;
  justify-content: space-between;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 700;
  max-width: 180px;
  margin-right: 30px;
}

.status-tag:hover {
  cursor: pointer;
}

.sidebar Button {
  background-color: #f3f2ff;
  color: #272264;
}

.link {
  color: #f3f2ff;
  text-decoration: none;
}

.filter-bar {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
}

.p-input-icon-left {
  position: relative;
}

.p-input-icon-left i {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: #94a3b8;
}

.p-input-icon-left input {
  padding-left: 35px;
}
</style>
