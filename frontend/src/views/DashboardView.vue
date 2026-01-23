<script setup>
import { auth } from "../../firebaseConfig";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import api from "../services/api";
import { onMounted, ref } from "vue";
import { Card, Button } from "primevue";
import dayjs from "dayjs";

const router = useRouter();
const authStore = useAuthStore();
const user = ref(null);
const projects = ref(null);

const handleLogout = async () => {
  try {
    await signOut(auth);
    await authStore.setUser(null);
    router.push("/login");
  } catch (err) {
    console.error("Logout error: ".err);
  }
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
        <h3>
          <router-link to="/createProject" class="link"
            >Create a new project</router-link
          >
        </h3>
        <Button @click="handleLogout">Logout</Button>
      </ul>
    </div>

    <div class="project-section">
      <h1>Your Projects</h1>

      <div class="projects-grid">
        <Card
          v-for="project in projects"
          :key="project.id"
          class="project-card"
        >
          <template #title>
            {{ project.name }}
          </template>

          <template #content>
            <p class="descriere">{{ project.description }}</p>
            <small>
              Created at: {{ formatFirestoreDate(project.creation_date) }}
            </small>
          </template>

          <template #footer>
            <Button
              label="Vezi Board"
              icon="pi pi-arrow-right"
              @click="goToProject(project.id)"
            />
          </template>
        </Card>
      </div>
    </div>
  </div>
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

.descriere {
  min-height: 3rem;
}

.project-card Button {
  background-color: #272264;
  color: #ffffff;
}

.sidebar Button {
  background-color: #f3f2ff;
  color: #272264;
}

.link {
  color: #f3f2ff;
  text-decoration: none;
}
</style>
