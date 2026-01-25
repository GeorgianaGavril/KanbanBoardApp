<script setup>
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import {
  Button,
  Password,
  IconField,
  InputIcon,
  InputText,
  Message,
} from "primevue";
import "primeicons/primeicons.css";

const username = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const handleSignUp = async () => {
  loading.value = true;
  try {
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    const user = userCredentials.user;
    await authStore.setUser(user);

    await api.post("/user", {
      name: username.value,
      email: email.value,
    });

    router.push("/");
  } catch (err) {
    errorMessage.value = "Incorrect login data!";
    console.error("Sign Up error: ", err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login">
      <div class="sign-in">
        <i class="pi pi-user-plus" style="font-size: 2rem; color: #444"></i>
      </div>

      <div class="login-header">
        <h1 class="text-2xl font-bold">Create an account</h1>
        <p class="text-secondary">
          You already have an account?
          <router-link to="/login" class="link">Sign in here</router-link>
        </p>
      </div>

      <form @submit.prevent="handleSignUp" class="login-box">
        <IconField class="input">
          <InputIcon class="pi pi-user" />
          <InputText
            id="username"
            v-model="username"
            placeholder="Username"
            fluid
            required
          />
        </IconField>

        <IconField class="input">
          <InputIcon class="pi pi-envelope" />
          <InputText
            id="email"
            v-model="email"
            placeholder="Email"
            fluid
            required
          />
        </IconField>

        <IconField class="input">
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="password"
            :feedback="false"
            toggleMask
            placeholder="Password"
            fluid
            required
          />
        </IconField>

        <Button
          type="submit"
          label="Sign Up"
          :loading="loading"
          fluid
          class="p-button-lg"
        />
      </form>

      <Message
        v-if="errorMessage"
        severity="error"
        variant="simple"
        class="mt-4"
      >
        {{ errorMessage }}
      </Message>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.sign-in {
  padding: 10px 10px;
  border-radius: 15px;
  background-color: #ffffff9a;
  box-shadow: 0 4px 16px rgb(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 1rem;
}

.text-secondary {
  color: #666;
  font-size: 0.9rem;
}

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem;
  background: linear-gradient(
    180deg,
    rgb(214 234 255) 0%,
    rgb(226 243 255) 23%,
    rgba(255, 255, 255, 1) 100%
  );
  border-radius: 15px;
  box-shadow: 0 4px 16px rgb(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.login-box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 20px 20px;
}

Button {
  background-color: black;
  border: none;
}

Button:hover {
  background-color: black;
}

.input {
  margin-bottom: 20px;
}

.link {
  color: #000;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.link:hover {
  border-bottom: 1px solid #000;
}
</style>
