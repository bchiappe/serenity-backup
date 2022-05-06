<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md">New Host</div>

    <q-form @submit="create">
      <q-card>
        <q-card-section v-if="showError">
          <q-banner class="bg-negative text-white" rounded inline-actions>
            {{ errorMessage }}
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
        <q-card-section class="q-ma-lg">
          <q-input label="Name" v-model="host.name" />
          <div class="q-gutter-sm q-mt-md">
            <q-radio v-model="host.os" val="linux" label="Linux" />
            <q-radio v-model="host.os" val="windows" label="Windows" />
          </div>
          <q-input label="Hostname" v-model="host.host" />
          <q-input label="SSH Port" v-model="host.port" type="number" />
          <q-input label="Username" v-model="host.username" />
          <q-input label="Password" v-model="host.password" type="password" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Create"
            icon="save"
            color="primary"
            type="submit"
          />
          <q-btn
            flat
            label="Clear"
            icon="clear"
            color="negative"
            @click="clear"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Host from "src/lib/host";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "NewHostPage",
  components: {},
  setup() {
    const router = useRouter();
    const host = ref({});
    const showError = ref(false);
    const errorMessage = ref("");
    return {
      host,
      showError,
      errorMessage,
      create: () => {
        const h = new Host();
        h.create(host.value)
          .then(() => {
            router.push("/hosts");
          })
          .catch((err) => {
            errorMessage.value = `An error occurred creating the host: ${err.message}`;
            showError.value = true;
          });
      },
      clear: () => {
        host.value = {};
      },
    };
  },
});
</script>

<style scoped>
.form-wrapper {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
</style>
