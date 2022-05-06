<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Backups</div>
    <q-separator />
    <div class="row q-ma-md">
      <div class="col">
        <q-input
          outlined
          label="Search..."
          dense
          class="search-box"
          debounce="300"
          v-model="filter"
        >
        </q-input>
      </div>
      <div class="col flex justify-end">
        <q-btn
          color="positive"
          icon="add"
          label="New Backup"
          to="/backups/new"
        />
      </div>
    </div>
    <div class="row q-mt-md q-mx-sm">
      <q-table
        class="record-table"
        :rows="backups"
        :columns="columns"
        row-key="_id"
        :loading="loading"
        v-model:pagination="pagination"
        :filter="filter"
        @request="onRequest"
      >
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              icon="play_arrow"
              size="sm"
              flat
              dense
              color="positive"
              @click="runBackup(props.row._id)"
            />
            <q-btn
              icon="edit"
              size="sm"
              class="q-ml-sm"
              flat
              dense
              :to="'/backups/' + props.row._id"
            />
            <q-btn
              icon="delete"
              size="sm"
              class="q-ml-sm"
              flat
              dense
              color="negative"
              @click="confirmDelete(props.row._id, index)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, onMounted } from "vue";
import Backup from "src/lib/backup";
import { format, useQuasar } from "quasar";
const { capitalize } = format;

export default defineComponent({
  name: "BackupsPage",
  components: {},
  setup() {
    const $q = useQuasar();
    const filter = ref("");
    const backups = ref([]);
    const loading = ref(true);

    const columns = ref([
      {
        name: "name",
        label: "Name",
        field: "name",
        required: true,
        align: "left",
      },
      {
        name: "hostName",
        label: "Host",
        field: (row) => row.host.name,
        required: true,
        align: "left",
      },
      {
        name: "repositoryName",
        label: "Repository",
        field: (row) => row.repository.name,
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
        name: "action",
        label: "",
        field: "action",
        sortable: false,
        align: "center",
      },
    ]);

    const pagination = ref({
      sortBy: "name",
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    const onRequest = async (tableProps) => {
      const { page, rowsPerPage, sortBy, descending } = tableProps.pagination;
      const filter = tableProps.filter;

      loading.value = true;

      // Fetch data from server
      const b = new Backup();
      const resp = await b.getAll({
        page: page,
        limit: rowsPerPage,
        filter: filter,
      });
      // Update total number of rows
      pagination.value.rowsNumber = resp.count;
      // Clear out existing data and add new
      backups.value.splice(0, backups.value.length, ...resp.items);
      // Update local pagination object
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
      pagination.value.sortBy = sortBy;
      pagination.value.descending = descending;

      // ...and turn of loading indicator
      loading.value = false;
    };

    const refresh = () => {
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    };

    onMounted(() => {
      // get initial data from server (1st page)
      refresh();
    });

    const deleteBackup = (id, index) => {
      const b = new Backup();
      b.deleteItem(id)
        .then(() => {
          backups.value.splice(
            backups.value.findIndex((backup) => backup._id === id),
            1
          );
          matchedBackups.value.splice(index, 1);
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

    const runBackup = (id) => {
      const b = new Backup();
      b.run(id)
        .then(() => {
          $q.notify({
            type: "positive",
            message: `Backup started successfully`,
          });
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message: `An error occurred starting the backup: ${err.message}`,
          });
        });
    };

    return {
      page: ref(1),
      nextPage: ref(null),
      loading,
      columns,
      backups,
      pagination,
      filter,
      onRequest,
      capitalize,
      confirmDelete: (id, index) => {
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
          deleteBackup(id, index);
        });
      },
      runBackup,
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
