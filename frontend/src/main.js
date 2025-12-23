import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

let app;

onAuthStateChanged(auth, (user) => {
  if (!app) {
    const pinia = createPinia();

    app = createApp(App).use(pinia).use(router).mount("#app");
  }
});
