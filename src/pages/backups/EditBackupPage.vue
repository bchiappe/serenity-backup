<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md flex justify-between">
      Edit Backup
      <q-btn
        label="Delete"
        icon="delete"
        color="negative"
        @click="confirmDelete"
      />
    </div>

    <div class="row">
      <div class="col q-pa-sm">
        <q-form @submit="update">
          <q-card>
            <q-card-section v-if="showAlert">
              <q-banner
                :class="{
                  'bg-negative': alertType === 'error',
                  'bg-positive': alertType === 'success',
                  'text-white': true,
                }"
                rounded
                inline-actions
              >
                {{ alertMessage }}
                <template v-slot:action>
                  <q-btn
                    flat
                    color="white"
                    label="Dismiss"
                    @click="showAlert = false"
                  />
                </template>
              </q-banner>
            </q-card-section>
            <q-card-section>
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
                label="Save"
                icon="save"
                color="primary"
                type="submit"
              />
              <q-btn
                flat
                label="Revert"
                icon="clear"
                color="negative"
                @click="revert"
              />
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
      <div class="col q-pa-sm">
        <q-card class="actions-card">
          <q-card-section>
            <q-card-section class="justify-center">
              <q-list separator>
                <q-item>
                  <q-item-section>
                    <q-item dense>
                      <q-item-section>Last Run</q-item-section>
                      <q-item-section
                        side
                        :class="{
                          'text-positive': backup.lastRun.result === 'success',
                          'text-negative': backup.lastRun.result === 'fail',
                          flex: true,
                          'justify-end': true,
                        }"
                      >
                        {{
                          date.formatDate(
                            backup.lastRun.date,
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        }}
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section></q-item-section>
                      <q-item-section side>
                        <q-btn
                          label="Run Now"
                          flat
                          dense
                          icon="backup"
                          color="primary"
                          @click="runBackup"
                        />
                      </q-item-section>
                    </q-item>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col q-pa-sm">
        <q-card>
          <snapshot-table :backup="id"></snapshot-table>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col q-pa-sm">
        <q-card>
          <activity-table :backup="id"></activity-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Backup from "src/lib/backup";
import Host from "src/lib/host";
import Repository from "src/lib/repository";
import { useRouter, useRoute } from "vue-router";
import { useQuasar, date } from "quasar";

export default defineComponent({
  name: "EditBackupPage",
  components: {
    SnapshotTable: defineAsyncComponent(() =>
      import("/src/components/SnapshotTable.vue")
    ),
    ActivityTable: defineAsyncComponent(() =>
      import("/src/components/ActivityTable.vue")
    ),
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();
    const backup = ref({ lastRun: {} });
    let backupOrig = {};
    const hosts = ref([]);
    const repositories = ref([]);
    const showAlert = ref(false);
    const alertMessage = ref("");
    const alertType = ref("success");
    const id = route.params.id;
    const b = new Backup();
    b.getItem(id).then((resp) => {
      const data = resp;
      if (!("lastRun" in data)) {
        data.lastRun = {
          result: "unknown",
          date: "N/A",
        };
      }
      backup.value = { ...data };
      backupOrig = { ...data };
    });

    const getBackup = () => {
      const b = new Backup();
      b.getItem(id).then((resp) => {
        const data = resp;
        if (!("lastRun" in data)) {
          data.lastRun = {
            result: "unknown",
            date: "N/A",
          };
        }
        backup.value = { ...data };
        backupOrig = { ...data };
      });
    };
    getBackup();

    const deleteBackup = () => {
      const b = new Backup();
      b.deleteItem(id)
        .then(() => {
          router.push("/backups");
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the backup. Please try again later.",
          });
          console.error("Failed to delete backup", err.message);
        });
    };

    const h = new Host();
    h.getAll().then((resp) => {
      hosts.value = [...resp.items];
    });

    const r = new Repository();
    r.getAll().then((resp) => {
      repositories.value = [...resp.items];
    });

    return {
      id,
      backup,
      hosts,
      repositories,
      alertType,
      showAlert,
      alertMessage,
      deleteBackup,
      update: () => {
        const b = new Backup();
        const updates = {
          name: backup.value.name,
          host: backup.value.host,
          repository: backup.value.repository,
          path: backup.value.path,
        };
        b.update(id, updates)
          .then(() => {
            alertType.value = "success";
            alertMessage.value = "Backup updated successfully.";
            showAlert.value = true;
          })
          .catch((err) => {
            alertType.value = "error";
            alertMessage.value = `An error occurred updating the backup: ${err.message}`;
            showAlert.value = true;
          });
      },
      revert: () => {
        backup.value = { ...backupOrig };
      },
      confirmDelete: () => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this backup? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteBackup();
        });
      },
      runBackup: () => {
        const b = new Backup();
        b.run(id)
          .then(() => {
            $q.notify({
              type: "positive",
              message: `Backup started successfully`,
            });
            getBackup();
          })
          .catch((err) => {
            $q.notify({
              type: "negative",
              message: `An error occurred starting the backup: ${err.message}`,
            });
            getBackup();
          });
      },
      date,
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

.actions-card {
  height: 100%;
}
</style>
