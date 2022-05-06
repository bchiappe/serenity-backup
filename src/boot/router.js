import { boot } from "quasar/wrappers";
import User from "src/lib/user";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ router }) => {
  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.meta.requiresAuth === true;

    const u = new User();
    const authorized = await u.isAuthenticated();
    console.log("Authorized", authorized);

    if (requiresAuth && !authorized && to.path !== "/login") {
      next("/login");
    } else next();
  });
});
