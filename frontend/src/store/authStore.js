import { defineStore } from "pinia";
import { ref } from "vue";
import { getIdToken } from "firebase/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);

  const setUser = async (firebaseUser) => {
    user.value = firebaseUser;
    if (firebaseUser) {
      token.value = await getIdToken(firebaseUser);
    } else {
      token.value = null;
    }
  };

  return { user, token, setUser };
});
