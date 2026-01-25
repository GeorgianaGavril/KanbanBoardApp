import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import { definePreset } from "@primevue/themes";
import { useAuthStore } from "./store/authStore";
import "primeicons/primeicons.css";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{zinc.50}",
      100: "{zinc.100}",
      200: "{zinc.200}",
      300: "{zinc.300}",
      400: "{zinc.400}",
      500: "{zinc.900}",
      600: "{zinc.800}",
      700: "{zinc.700}",
      800: "{zinc.600}",
      900: "{zinc.500}",
      950: "{zinc.400}",
    },
  },
});

let vueApp;

onAuthStateChanged(auth, async (user) => {
  if (!vueApp) {
    const pinia = createPinia();

    vueApp = createApp(App);

    vueApp.use(pinia);
    vueApp.use(router);
    vueApp.use(PrimeVue, {
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false,
          borderRadius: "12px",
        },
      },
    });
    vueApp.mount("#app");
  }

  const authStore = useAuthStore();

  if (user) {
    await authStore.setUser(user);
  } else {
    await authStore.setUser(null);
  }
});
