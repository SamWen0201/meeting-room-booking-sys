// import { createRouter, createWebHistory } from "vue-router";
// import HomeView from "@/views/HomeView.vue";
// import ManagementView from "@/views/ManagementView.vue";
// import LoginPage from "@/pages/LoginPage.vue";

// // import user store
// import { useUser } from "@/stores/userStore";

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     { 
//       path: '/login',
//       component: LoginPage,
//       meta: { requireAuth: false }
//     },
//     {
//       path: "/",
//       name: "home",
//       component: HomeView,
//       meta: { title: "日程總覽" , requireAuth: true},
//     },
//     {
//       path: "/room-management",
//       name: "management",
//       // route level code-splitting
//       // this generates a separate chunk (About.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () => import("../views/ManagementView.vue"),
//       meta: { title: "會議室維護" , requireAuth: true, requireAdmin: true},
//     },
//   ],
// });

// router.beforeEach( (to, from, next) => {
//   const userStore = useUser();  

//   if (to.meta.requireAuth && !userStore.isLoggedIn) {
//     next( {path: '/login', query: { redirect: to.fullPath}})
//     return; 
//   }

//   if (to.meta.requireAdmin && !userStore.isAdmin) {
//     next('/');
//     return;
//   }

//   next(); // 正常導航
// })

// export default router;
import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/pages/LoginPage.vue";
import AppLayout from "@/layouts/AppLayout.vue";
import { useUser } from "@/stores/userStore";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    title?: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // LoginPage 獨立在外面，不進 AppLayout
      path: "/login",
      component: LoginPage,
    },
    {
      // AppLayout 是外層框架
      path: "/",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          // path 是空字串，對應到 /
          path: "",
          component: () => import("@/views/HomeView.vue"),
          meta: { title: "日程總覽", requiresAuth: true },
        },
        {
          path: "room-management",
          component: () => import("@/views/ManagementView.vue"),
          meta: { title: "會議室維護", requiresAuth: true, requiresAdmin: true },
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUser();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next("/");
    return;
  }

  next();
});

export default router;