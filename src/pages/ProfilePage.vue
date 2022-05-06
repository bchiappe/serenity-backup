<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Profile</div>
    <q-separator />
    <div class="row q-mt-md q-mx-sm">
      <q-card class="profile-card">
        <q-card-section>
          <q-input label="First Name" v-model="user.firstName" />
          <q-input label="Last Name" v-model="user.lastName" />
          <q-input label="Email" v-model="user.email" />
          <q-input label="Username" v-model="user.username" />
          <q-input label="Password" v-model="password" type="password" />
          <q-btn
            label="Save"
            icon="save"
            color="positive"
            @click="save()"
            size="sm"
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import User from "src/lib/user";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "ProfilePage",
  components: {},
  setup() {
    const $q = useQuasar();
    const user = ref({});
    const password = ref("");

    const u = new User();
    u.getMe().then((resp) => {
      console.log(resp);
      user.value = { ...resp.profile };
    });

    const save = async () => {
      const profile = { ...user.value };
      if (password.value !== "") {
        profile.password = password.value;
      }
      const u = new User();
      u.updateMe(profile)
        .then(() => {
          $q.notify({
            type: "positive",
            message: `Profile saved successfully`,
          });
          password.value = "";
        })
        .catch((err) => {
          console.error("Failed to save profile", err.message);
          $q.notify({
            type: "negative",
            message: `An error occurred saving profile: ${err.message}`,
          });
        });
    };

    return { user, password, save };
  },
});
</script>

<style scoped>
.profile-card {
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.alert-card {
  width: 50%;
  max-width: 450px;
}
</style>
