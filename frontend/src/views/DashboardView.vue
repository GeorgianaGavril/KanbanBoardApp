<script setup>
import { auth } from "../../firebaseConfig";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    console.log(authStore.user);

    await signOut(auth);
    await authStore.setUser(null);
    router.push("/login");
  } catch (err) {
    console.error("Logout error: ".err);
  }
};
</script>

<template>
  <div>
    <h1>Pagina Dashboard</h1>
    <div>
      <ul>
        <p v-if="authStore.user">
          Bine ai venit <strong>{{ authStore.user.email }}</strong>
        </p>
        <h5>Home</h5>
        <button @click="handleLogout">Logout</button>
      </ul>
    </div>
    <div>
      <h1>Projects</h1>
    </div>
  </div>
</template>
