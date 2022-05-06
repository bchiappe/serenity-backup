<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md flex justify-between">
      Edit Host
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
              <q-input label="Name" v-model="host.name" />
              <div class="q-gutter-sm q-mt-md">
                <q-radio v-model="host.os" val="linux" label="Linux" />
                <q-radio v-model="host.os" val="windows" label="Windows" />
              </div>
              <q-input label="Hostname" v-model="host.host" />
              <q-input label="SSH Port" v-model="host.port" type="number" />
              <q-input label="Username" v-model="host.username" />
              <q-input label="Password" v-model="password" type="password" />
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
                      <q-item-section>Last Connection</q-item-section>
                      <q-item-section
                        side
                        :class="{
                          'text-positive':
                            host.lastConnection.result === 'success',
                          'text-negative':
                            host.lastConnection.result === 'fail',
                          flex: true,
                          'justify-end': true,
                        }"
                      >
                        {{
                          date.formatDate(
                            host.lastConnection.date,
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        }}
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section></q-item-section>
                      <q-item-section side>
                        <q-btn
                          label="Test Connection"
                          flat
                          dense
                          icon="sensors"
                          color="warning"
                          @click="connect"
                        />
                      </q-item-section>
                    </q-item>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item dense>
                      <q-item-section>Last Backup</q-item-section>
                      <q-item-section
                        side
                        :class="{
                          'text-positive': host.lastBackup.result === 'success',
                          'text-negative': host.lastBackup.result === 'fail',
                          flex: true,
                          'justify-end': true,
                        }"
                      >
                        {{
                          date.formatDate(
                            host.lastBackup.date,
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        }}
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section></q-item-section>
                      <q-item-section side>
                        <q-btn
                          label="Backup Now"
                          flat
                          dense
                          icon="backup"
                          color="primary"
                        />
                      </q-item-section>
                    </q-item>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item dense>
                      <q-item-section>Restic Version</q-item-section>
                      <q-item-section side>
                        {{ host.resticVersion }}
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section></q-item-section>
                      <q-item-section side>
                        <q-btn
                          label="Check Now"
                          flat
                          dense
                          icon="update"
                          color="primary"
                          @click="checkVersion"
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
          <backup-table :host="id"></backup-table>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col q-pa-sm">
        <q-card>
          <activity-table :host="id"></activity-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Host from "src/lib/host";
import { useRouter, useRoute } from "vue-router";
import { useQuasar, date } from "quasar";

export default defineComponent({
  name: "EditHostPage",
  components: {
    BackupTable: defineAsyncComponent(() =>
      import("/src/components/BackupTable.vue")
    ),
    ActivityTable: defineAsyncComponent(() =>
      import("/src/components/ActivityTable.vue")
    ),
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();
    const host = ref({ lastConnection: {}, lastBackup: {} });
    let hostOrig = {};
    const password = ref("");
    const showAlert = ref(false);
    const alertMessage = ref("");
    const alertType = ref("success");
    const id = route.params.id;

    const getHost = () => {
      const h = new Host();
      h.getItem(id).then((resp) => {
        const data = resp;
        if (!("lastConnection" in data)) {
          data.lastConnection = {
            result: "unknown",
            date: "N/A",
          };
        }
        if (!("lastBackup" in data)) {
          data.lastBackup = {
            result: "unknown",
            date: "N/A",
          };
        }
        host.value = { ...data };
        hostOrig = { ...data };
      });
    };
    getHost();

    const deleteHost = () => {
      const h = new Host();
      h.deleteItem(id)
        .then(() => {
          router.push("/hosts");
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the host. Please try again later.",
          });
          console.error("Failed to delete host", err.message);
        });
    };

    return {
      id,
      host,
      password,
      alertType,
      showAlert,
      alertMessage,
      getHost,
      deleteHost,
      update: () => {
        const h = new Host();
        const updates = {
          name: host.value.name,
          os: host.value.os,
          host: host.value.host,
          port: Number(host.value.port),
          username: host.value.username,
        };
        if (password.value.length > 0) {
          updates.password = password.value;
        }
        h.update(id, updates)
          .then(() => {
            alertType.value = "success";
            alertMessage.value = "Host updated successfully.";
            showAlert.value = true;
          })
          .catch((err) => {
            alertType.value = "error";
            alertMessage.value = `An error occurred updating the host: ${err.message}`;
            showAlert.value = true;
          });
      },
      revert: () => {
        host.value = { ...hostOrig };
      },
      confirmDelete: () => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this host? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteHost();
        });
      },
      connect: () => {
        const h = new Host();
        h.connect(id)
          .then(() => {
            $q.notify({
              type: "positive",
              message: "Connected to the host successfully",
            });
            getHost();
          })
          .catch((err) => {
            $q.notify({
              type: "negative",
              message: "An error occurred connecting to the host",
            });
            getHost();
          });
      },
      checkVersion: () => {
        const h = new Host();
        h.checkVersion(id)
          .then((data) => {
            $q.notify({
              type: "positive",
              message: `Software version is ${data.version}`,
            });
            getHost();
          })
          .catch((err) => {
            $q.notify({
              type: "negative",
              message: "An error occurred retrieving the software version",
            });
            getHost();
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
