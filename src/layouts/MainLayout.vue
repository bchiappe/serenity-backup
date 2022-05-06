<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          icon="menu"
          aria-label="Menu"
        />
        <q-toolbar-title> Serenity Backup </q-toolbar-title>
        <q-space />
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            round
            dense
            flat
            color="white"
            icon="notifications"
            v-if="false"
          >
            <q-badge color="red" text-color="white" floating> 5 </q-badge>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-card class="text-center no-shadow no-border">
                  <q-btn
                    label="View All"
                    style="max-width: 120px !important"
                    flat
                    dense
                    class="text-indigo-8"
                  ></q-btn>
                </q-card>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn round flat>
            <q-avatar size="26px">
              <img :src="avatar" />
            </q-avatar>

            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup to="/profile">
                  <q-item-section avatar>
                    <q-avatar rounded icon="account_box" />
                  </q-item-section>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-avatar rounded icon="logout" />
                  </q-item-section>
                  <q-item-section>Log out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="leftDrawerMini"
      @mouseover="leftDrawerMini = false"
      @mouseout="leftDrawerMini = true"
      mini-to-overlay
      bordered
      class="bg-primary text-white"
      :width="200"
    >
      <q-list>
        <q-item to="/" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/hosts" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="computer" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Hosts</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/repositories" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="cloud" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Repositories</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/backups" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="backup" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Backup</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/restore" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="restore" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Restore</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/scheduler" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Scheduler</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/activity" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="insert_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Activity</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/settings" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Settings</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import User from "src/lib/user";

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const leftDrawerMini = ref(true);
    const avatar = ref("");

    const u = new User();
    u.getMe().then((user) => {
      console.log("User", user);
      avatar.value = user.profile.avatar;
    });

    return {
      leftDrawerOpen,
      leftDrawerMini,
      avatar,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      logout() {
        const u = new User();
        u.logout().then(() => {
          router.push("/login");
        });
      },
    };
  },
});
</script>
