import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../../firebaseConfig";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/signup",
    name: "SignUp",
    component: () => import("../views/SignUpView.vue"),
  },
  {
    path: "/",
    name: "Dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/createProject",
    name: "CreateProject",
    component: () => import("../views/CreateProjectView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/project/:id",
    name: "ProjectBoard",
    component: () => import("../views/ProjectBoardView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = auth.currentUser;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
