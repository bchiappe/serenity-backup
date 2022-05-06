<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md">New Backup</div>

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
          <q-input label="Name" v-model="backup.name" />
          <q-select
            label="Host"
            v-model="backup.host"
            :options="hosts"
            option-value="_id"
            option-label="name"
            map-options
            emit-value
          />
          <q-select
            label="Repository"
            v-model="backup.repository"
            :options="repositories"
            option-value="_id"
            option-label="name"
            map-options
            emit-value
          />
          <q-input label="Path" v-model="backup.path" />
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
import Backup from "src/lib/backup";
import Host from "src/lib/host";
import Repository from "src/lib/repository";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "NewBackupPage",
  components: {},
  setup() {
    const router = useRouter();
    const backup = ref({});
    const hosts = ref([]);
    const repositories = ref([]);
    const showError = ref(false);
    const errorMessage = ref("");

    const h = new Host();
    h.getAll().then((resp) => {
      hosts.value = [...resp.items];
    });

    const r = new Repository();
    r.getAll().then((resp) => {
      repositories.value = [...resp.items];
    });

    return {
      backup,
      hosts,
      repositories,
      showError,
      errorMessage,
      create: () => {
        const b = new Backup();
        b.create(backup.value)
          .then(() => {
            router.push("/backups");
          })
          .catch((err) => {
            errorMessage.value = `An error occurred creating the backup: ${err.message}`;
            showError.value = true;
          });
      },
      clear: () => {
        backup.value = {};
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
