<template>
  <q-table
    class="record-table"
    :rows="backups"
    :columns="columns"
    row-key="_id"
    :loading="loading"
    v-model:pagination="pagination"
    :filter="filter"
    @request="onRequest"
    title="Backups"
  >
    <template v-slot:top-right>
      <q-btn icon="refresh" flat @click="refresh" />
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
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
</template>

<script>
import { defineComponent, defineAsyncComponent, ref, onMounted } from "vue";
import Backup from "src/lib/backup";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "BackupTable",
  props: {
    host: {
      type: String,
      required: false,
      default: null,
    },
    repository: {
      type: String,
      required: false,
      default: null,
    },
  },
  components: {},
  setup(props) {
    const loading = ref(true);
    const filter = ref({});
    const backups = ref([]);

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

    const deleteBackup = (id, index) => {
      const b = new Backup();
      b.deleteItem(id)
        .then(() => {
          backups.value.splice(index, 1);
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

    const onRequest = async (tableProps) => {
      const { page, rowsPerPage, sortBy, descending } = tableProps.pagination;
      const filter = tableProps.filter;

      loading.value = true;

      // Fetch data from server
      const b = new Backup();
      const resp = await b.getAll({
        hostId: props.host,
        repositoryId: props.repository,
        page: page,
        limit: rowsPerPage,
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
        filter: undefined,
      });
    };

    onMounted(() => {
      // get initial data from server (1st page)
      refresh();
    });

    return {
      loading,
      pagination,
      filter,
      backups,
      onRequest,
      refresh,
      columns,
    };
  },
});
</script>
