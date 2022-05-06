<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Repositories</div>
    <q-separator />
    <div class="row q-ma-md">
      <div class="col">
        <q-input
          outlined
          label="Search..."
          dense
          class="search-box"
          :modelValue="searchText"
          @update:modelValue="search($event)"
        />
      </div>
      <div class="col flex justify-end">
        <q-btn
          color="positive"
          icon="add"
          label="New Repository"
          to="/repositories/new"
        />
      </div>
    </div>
    <div class="row q-mt-md q-mx-sm">
      <div
        class="col-lg-3 col-sm-12 col-xs-12 col-md-3 q-ma-sm"
        v-for="(repository, index) in matchedRepositories"
        :key="repository._id"
      >
        <q-card>
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-icon name="computer" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h5">{{ repository.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-card-section class="justify-center">
            <q-list separator>
              <q-item>
                <q-item-section>Type</q-item-section>
                <q-item-section side>
                  {{
                    repository.type === "b2"
                      ? "Backblaze B2"
                      : "S3 Object Storage"
                  }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section v-if="repository.type === 's3'"
                  >Hostname</q-item-section
                >
                <q-item-section v-if="repository.type === 'b2'"
                  >Bucket</q-item-section
                >
                <q-item-section side>
                  {{
                    repository.type === "b2"
                      ? repository.bucketName
                      : `${repository.host}:${repository.port}`
                  }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Last Connection</q-item-section>
                <q-item-section
                  side
                  :class="{
                    'text-positive':
                      repository.lastConnection.result === 'success',
                    'text-negative':
                      repository.lastConnection.result === 'fail',
                  }"
                >
                  {{ repository.lastConnection.date }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn icon="edit" flat :to="'/repositories/' + repository._id" />
            <q-btn
              color="negative"
              icon="delete"
              flat
              @click="confirmDelete(repository._id, index)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <div class="row q-ma-md justify-center" v-if="totalPages > 0">
      <q-pagination
        v-model="page"
        :max="totalPages"
        :input="true"
        input-class="text-orange-10"
      >
      </q-pagination>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Repository from "src/lib/repository";
import { format, useQuasar } from "quasar";
const { capitalize } = format;

export default defineComponent({
  name: "RepositoriesPage",
  components: {},
  setup() {
    const $q = useQuasar();
    let repositories = [];
    const matchedRepositories = ref([]);
    const totalPages = ref(0);
    const searchText = ref("");
    const r = new Repository();
    r.getAll().then((resp) => {
      repositories = [...resp.items];
      for (let repo of repositories) {
        if (!("lastConnection" in repo)) {
          repo.lastConnection = { result: "unknown", date: "" };
        }
        if (!("lastBackup" in repo)) {
          repo.lastBackup = { result: "unknown", date: "" };
        }
      }
      matchedRepositories.value = [...repositories];
      totalPages.value = resp.pages;
    });

    const deleteRepository = (id, index) => {
      const r = new Repository();
      r.deleteItem(id)
        .then(() => {
          repositories.splice(
            repositories.findIndex((repository) => repository._id === id),
            1
          );
          matchedRepositories.value.splice(index, 1);
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

    const search = (text) => {
      if (String(text).length > 0) {
        const searchValue = String(text).toLowerCase();
        matchedRepositories.value = [
          ...repositories.filter(
            (repository) =>
              String(repository.name).toLowerCase().includes(searchValue) ||
              String(repository.type).toLowerCase().includes(searchValue) ||
              String(repository.host).toLowerCase().includes(searchValue)
          ),
        ];
      } else {
        matchedRepositories.value = [...repositories];
      }
    };
    return {
      page: ref(1),
      nextPage: ref(null),
      totalPages,
      searchText,
      search,
      matchedRepositories,
      capitalize,
      confirmDelete: (id, index) => {
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
          deleteRepository(id, index);
        });
      },
    };
  },
});
</script>

<style scoped>
.search-box {
  max-width: 300px;
}
</style>
