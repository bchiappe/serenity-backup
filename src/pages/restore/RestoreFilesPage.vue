<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Restore Snapshot</div>
    <q-separator />
    <div class="row q-ma-md">
      <div class="col">
        <!-- <q-input
          outlined
          label="Search..."
          dense
          class="search-box"
          :modelValue="searchText"
          @update:modelValue="search($event)"
        >
        </q-input> -->
      </div>
    </div>
    <div class="row q-mt-md q-mx-sm">
      <q-table
        class="record-table"
        :rows="files"
        :columns="columns"
        row-key="_id"
        :loading="loading"
        :pagination="pagination"
        title="Files"
      >
        <template v-slot:top-right>
          <q-btn icon="refresh" flat @click="refresh" />
        </template>
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-icon name="folder" v-if="props.row.type === 'dir'" />
          </q-td>
        </template>
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <q-btn
              flat
              no-caps
              @click="refresh(props.row.path)"
              v-if="props.row.type === 'dir'"
              >{{ props.row.name }}</q-btn
            >
            <span v-if="props.row.type !== 'dir'">{{ props.row.name }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              icon="folder_open"
              size="sm"
              class="q-ml-sm"
              flat
              dense
              v-if="props.row.type === 'dir'"
              :to="'/restore/' + id + '?path=' + props.row.path"
            />
            <q-btn
              icon="restore"
              size="sm"
              class="q-ml-sm"
              flat
              dense
              @click="confirmRestore(props.row.path)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, onMounted } from "vue";
import Snapshot from "src/lib/snapshot";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "RestoreFilesPage",
  components: {},
  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const filter = ref({});
    const files = ref([]);
    const route = useRoute();
    const id = route.params.id;
    const path = route.query.path !== undefined ? route.query.path : "";

    const columns = ref([
      {
        name: "type",
        label: "",
        field: "type",
        required: true,
        align: "left",
      },
      {
        name: "name",
        label: "Name",
        field: "name",
        required: true,
        align: "left",
      },
      {
        name: "path",
        label: "Path",
        field: "path",
        required: true,
        align: "left",
      },
      {
        name: "accessed",
        label: "Last Accessed",
        field: "atime",
        required: true,
        align: "left",
      },
      {
        name: "modified",
        label: "Last Modified",
        field: "mtime",
        required: true,
        align: "left",
      },
      {
        name: "action",
        label: "",
        field: "action",
        sortable: false,
        align: "center",
      },
    ]);

    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
    });

    // const onRequest = async (tableProps) => {
    //   const { page, rowsPerPage, sortBy, descending } = tableProps.pagination;
    //   const filter = tableProps.filter;

    //   loading.value = true;

    //   // Update local pagination object
    //   pagination.value.page = page;
    //   pagination.value.rowsPerPage = rowsPerPage;
    //   pagination.value.sortBy = sortBy;
    //   pagination.value.descending = descending;

    //   // ...and turn of loading indicator
    //   loading.value = false;
    // };

    const refresh = async (path) => {
      loading.value = true;
      // Fetch data from server
      const s = new Snapshot();
      const resp = await s.listFiles(id, path);
      // Clear out existing data and add new
      console.log("Files", resp.items);
      files.value = [...resp.items];
      loading.value = false;
      // onRequest({
      //   pagination: pagination.value,
      //   filter: undefined,
      // });
    };

    onMounted(() => {
      // get initial data from server (1st page)
      refresh(path);
    });

    const restoreFile = (file) => {
      const s = new Snapshot();
      s.restoreFile(id, file)
        .then(() => {
          $q.notify({
            type: "positive",
            message: "File has been successfully queued for restoring.",
          });
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred restoring the file. Please try again later.",
          });
          console.error("Failed to restore file", err.message);
        });
    };
    return {
      loading,
      pagination,
      id,
      files,
      // onRequest,
      refresh,
      filter,
      columns,
      confirmRestore: (file) => {
        $q.dialog({
          title: "Confirm Restore",
          message: `Are you sure you want to store the file ${file}? Any existing file will be overwritten.`,
          cancel: true,
          persistent: true,
          ok: {
            color: "warning",
            label: "Restore",
            flat: true,
          },
        }).onOk(() => {
          restoreFile(file);
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
.record-table {
  width: 100%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}
</style>
