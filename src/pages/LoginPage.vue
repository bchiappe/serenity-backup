<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card
          v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }"
        >
          <q-card-section>
            <q-avatar size="103px" class="absolute-center shadow-10">
              <img src="~assets/profile.svg" />
            </q-avatar>
          </q-card-section>
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">Serenity Backup</div>
            </div>
          </q-card-section>
          <q-card-section v-if="showError">
            <q-banner class="bg-negative text-white" rounded inline-actions>
              Login failed. Please try again.
              <template v-slot:action>
                <q-btn
                  flat
                  color="white"
                  label="Dismiss"
                  @click="showError = false"
                />
              </template>
            </q-banner>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md" @submit="login">
              <q-input
                filled
                v-model="username"
                label="Username"
                lazy-rules
                :rules="[(val) => !!val || 'Username is required']"
                required
              />

              <q-input
                type="password"
                filled
                v-model="password"
                label="Password"
                lazy-rules
                :rules="[(val) => !!val || 'Password is required']"
                required
              />

              <div>
                <q-btn
                  label="Login"
                  type="submit"
                  color="primary"
                  :disabled="username === '' || password === ''"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Users from "src/lib/user";

export default defineComponent({
  setup() {
    const router = useRouter();
    const username = ref("");
    const password = ref("");
    const showError = ref(false);

    const login = () => {
      const u = new Users();
      u.login(username.value, password.value)
        .then(() => {
          router.push("/");
        })
        .catch(() => {
          showError.value = true;
        });
    };

    return {
      username: username,
      password: password,
      showError: showError,
      login: login,
    };
  },
});
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, #34b7eb 0%, #0b8cbf 100%);
}
</style>
