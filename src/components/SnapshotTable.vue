<template>
  <q-table
    class="record-table"
    :rows="snapshots"
    :columns="columns"
    row-key="_id"
    :loading="loading"
    v-model:pagination="pagination"
    :filter="filter"
    @request="onRequest"
    title="Snapshots"
  >
    <template v-slot:top-right>
      <q-btn icon="refresh" flat @click="refresh" />
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <q-btn
          icon="folder_open"
          size="sm"
          class="q-ml-sm"
          flat
          dense
          :to="'/restore/' + props.row._id"
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
import Snapshot from "src/lib/snapshot";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "SnapshotTable",
  props: {
    backup: {
      type: String,
      required: false,
      default: null,
    },
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
    const $q = useQuasar();
    const loading = ref(true);
    const filter = ref({});
    const snapshots = ref([]);

    const columns = ref([
      {
        name: "identifier",
        label: "Identifier",
        field: "identifier",
        required: true,
        align: "left",
      },
      {
        name: "backupName",
        label: "Backup",
        field: (row) => ("backup" in row ? row.backup.name : ""),
        required: true,
        align: "left",
      },
      {
        name: "hostName",
        label: "Host",
        field: (row) => ("host" in row ? row.host.name : ""),
        required: true,
        align: "left",
      },
      {
        name: "repositoryName",
        label: "Repository",
        field: (row) => ("repository" in row ? row.repository.name : ""),
        required: true,
        align: "left",
      },
      {
        name: "filesNew",
        label: "New Files",
        field: "filesNew",
        required: true,
        align: "left",
      },
      {
        name: "filesChanged",
        label: "Changed Files",
        field: "filesChanged",
        required: true,
        align: "left",
      },
      // {
      //   name: "filesUnmodified",
      //   label: "Unmodified Files",
      //   field: "filesUnmodified",
      //   required: true,
      //   align: "left",
      // },
      {
        name: "dirNew",
        label: "New Directories",
        field: "dirNew",
        required: true,
        align: "left",
      },
      {
        name: "dirChanged",
        label: "Changed Directories",
        field: "dirChanged",
        required: true,
        align: "left",
      },
      // {
      //   name: "dirUnmodified",
      //   label: "Unmodified Directories",
      //   field: "dirUnmodified",
      //   required: true,
      //   align: "left",
      // },
      {
        name: "dataAdded",
        label: "Data Added",
        field: "dataAdded",
        required: true,
        align: "left",
      },
      {
        name: "totalFilesProcessed",
        label: "Total Files Processed",
        field: "totalFilesProcessed",
        required: true,
        align: "left",
      },
      // {
      //   name: "totalBytesProcessed",
      //   label: "Total Bytes Processed",
      //   field: "totalBytesProcessed",
      //   required: true,
      //   align: "left",
      // },
      {
        name: "totalDuration",
        label: "Total Duration",
        field: (row) =>
          "totalDuration" in row ? row.totalDuration.$numberDecimal : "",
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
      sortBy: "identifier",
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
      const s = new Snapshot();
      const resp = await s.getAll({
        backupId: props.backup,
        hostId: props.host,
        repositoryId: props.repository,
        page: page,
        limit: rowsPerPage,
      });
      // Update total number of rows
      pagination.value.rowsNumber = resp.count;
      // Clear out existing data and add new
      snapshots.value.splice(0, snapshots.value.length, ...resp.items);
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

    const deleteSnapshot = (id) => {
      const s = new Snapshot();
      s.deleteItem(id)
        .then(() => {
          snapshots.value.splice(
            snapshots.value.findIndex((item) => item._id === id),
            1
          );
          $q.notify({
            type: "positive",
            message: "Snapshot has been successfully purged.",
          });
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the snapshot. Please try again later.",
          });
          console.error("Failed to delete snapshot", err.message);
        });
    };

    return {
      loading,
      pagination,
      snapshots,
      onRequest,
      refresh,
      filter,
      columns,
      confirmDelete: (id, index) => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this snapshot? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteSnapshot(id, index);
        });
      },
    };
  },
});
</script>
