<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md flex justify-between">
      Edit Repository
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
              <q-input label="Name" v-model="repository.name" />
              <div class="q-gutter-sm q-mt-md">
                <q-radio
                  v-model="repository.type"
                  val="s3"
                  label="S3 Object Storage"
                />
                <q-radio
                  v-model="repository.type"
                  val="b2"
                  label="Backblaze B2"
                />
              </div>
              <q-input
                label="Hostname"
                v-model="repository.host"
                v-if="repository.type === 's3'"
              />
              <q-input
                label="Port"
                v-model="repository.port"
                type="number"
                v-if="repository.type === 's3'"
              />
              <q-input
                label="Bucket Name"
                v-model="repository.bucketName"
                v-if="repository.type === 'b2'"
              />
              <q-input
                label="Path"
                v-model="repository.path"
                v-if="repository.type === 'b2'"
              />
              <q-input
                label="Access Key Id"
                v-model="repository.accessKeyId"
                v-if="repository.type === 's3'"
              />
              <q-input
                label="Secret Access Key"
                v-model="repository.secretAccessKey"
                v-if="repository.type === 's3'"
              />
              <q-input
                label="Account ID"
                v-model="repository.accountId"
                v-if="repository.type === 'b2'"
              />
              <q-input
                label="Account Key"
                v-model="repository.accountKey"
                v-if="repository.type === 'b2'"
              />
              <q-input label="Password" v-model="repository.password" />
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
                            repository.lastConnection.result === 'success',
                          'text-negative':
                            repository.lastConnection.result === 'fail',
                          flex: true,
                          'justify-end': true,
                        }"
                      >
                        {{ repository.lastConnection.date }}
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
          <backup-table :repository="id"></backup-table>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col q-pa-sm">
        <q-card>
          <activity-table :repository="id"></activity-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Repository from "src/lib/repository";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "EditRepositoryPage",
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
    const repository = ref({ lastConnection: {}, lastBackup: {} });
    let repoOrig = {};
    const password = ref("");
    const showAlert = ref(false);
    const alertMessage = ref("");
    const alertType = ref("success");
    const id = route.params.id;
    const r = new Repository();
    r.getItem(id).then((resp) => {
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
      repository.value = { ...data };
      repoOrig = { ...data };
    });

    const deleteRepo = () => {
      const r = new Repository();
      r.deleteItem(id)
        .then(() => {
          router.push("/repositories");
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the repository. Please try again later.",
          });
          console.error("Failed to delete repository", err.message);
        });
    };

    return {
      id,
      repository,
      password,
      alertType,
      showAlert,
      alertMessage,
      deleteRepo,
      update: () => {
        const r = new Repository();
        const updates = {
          name: repository.value.name,
          type: repository.value.type,
          host: repository.value.host,
          port: Number(repository.value.port),
          bucketName: repository.value.bucketName,
          path: repository.value.path,
          accessKeyId: repository.value.accessKeyId,
          secretAccessKey: repository.value.secretAccessKey,
          accountId: repository.value.accountId,
          accountKey: repository.value.accountKey,
          password: repository.value.password,
        };
        r.update(id, updates)
          .then(() => {
            alertType.value = "success";
            alertMessage.value = "Repository updated successfully.";
            showAlert.value = true;
          })
          .catch((err) => {
            alertType.value = "error";
            alertMessage.value = `An error occurred updating the repository: ${err.message}`;
            showAlert.value = true;
          });
      },
      revert: () => {
        repository.value = { ...repoOrig };
      },
      confirmDelete: () => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this repository? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteRepo();
        });
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

.actions-card {
  height: 100%;
}
</style>
