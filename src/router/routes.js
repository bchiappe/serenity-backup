const routes = [
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "hosts/new",
        component: () => import("pages/hosts/NewHostPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "hosts/:id",
        component: () => import("pages/hosts/EditHostPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "hosts",
        component: () => import("pages/hosts/HostsPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "repositories",
        component: () => import("pages/repositories/RepositoriesPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "repositories/new",
        component: () => import("pages/repositories/NewRepositoryPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "repositories/:id",
        component: () => import("pages/repositories/EditRepositoryPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "backups",
        component: () => import("pages/backups/BackupsPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "backups/new",
        component: () => import("pages/backups/NewBackupPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "backups/:id",
        component: () => import("pages/backups/EditBackupPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "restore",
        component: () => import("pages/restore/RestorePage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "restore/:id",
        component: () => import("pages/restore/RestoreFilesPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "scheduler",
        component: () => import("pages/scheduler/SchedulerPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "scheduler/new",
        component: () => import("pages/scheduler/NewSchedulePage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "scheduler/:id",
        component: () => import("pages/scheduler/EditSchedulePage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "activity",
        component: () => import("pages/activity/ActivityPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "settings",
        component: () => import("pages/settings/SettingsPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        component: () => import("pages/ProfilePage.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
