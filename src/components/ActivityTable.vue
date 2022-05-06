<template>
  <q-table
    class="record-table"
    :rows="activity"
    :columns="columns"
    row-key="_id"
    :loading="loading"
    v-model:pagination="pagination"
    :filter="filter"
    @request="onRequest"
    title="Activity"
  >
    <template v-slot:top-right>
      <q-btn icon="refresh" flat @click="refresh" />
    </template>
    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        <q-badge
          :label="props.row.status"
          :color="statusColor(props.row.status, 'black')"
          align="middle"
        ></q-badge>
      </q-td>
    </template>
    <template v-slot:body-cell-progress="props">
      <q-td :props="props">
        <q-linear-progress
          size="15px"
          :value="
            props.row.progress > 0
              ? props.row.progress / 100
              : props.row.progress
          "
          :color="statusColor(props.row.status, 'blue')"
          rounded
          stripe
        >
        </q-linear-progress>
      </q-td>
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <q-btn
          icon="message"
          size="sm"
          class="q-ml-sm"
          flat
          dense
          @click="showMessages(props.row.messages)"
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
import {
  defineComponent,
  defineAsyncComponent,
  ref,
  onMounted,
  onUnmounted,
} from "vue";
import Activity from "src/lib/activity";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "ActivityTable",
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
    schedule: {
      type: String,
      required: false,
      default: null,
    },
    fields: {
      type: Array,
      required: false,
      default: () => {
        return [
          "backup",
          "host",
          "repository",
          "type",
          "status",
          "progress",
          "messages",
          "date",
        ];
      },
    },
  },
  components: {},
  setup(props) {
    const $q = useQuasar();
    const loading = ref(true);
    const filter = ref("");
    const activity = ref([]);

    const columns = ref([
      {
        name: "action",
        label: "",
        field: "action",
        sortable: false,
        align: "center",
      },
    ]);

    console.log("Fields", props.fields);
    if (props.fields.includes("date")) {
      columns.value.unshift({
        name: "created",
        label: "Date",
        field: "created",
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("message")) {
      columns.value.unshift({
        name: "message",
        label: "Message",
        field: (row) =>
          Array.isArray(row.messages)
            ? row.messages[row.messages.length - 1]
            : "",
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("progress")) {
      columns.value.unshift({
        name: "progress",
        label: "Progress",
        field: "progress",
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("status")) {
      columns.value.unshift({
        name: "status",
        label: "Status",
        field: "status",
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("type")) {
      columns.value.unshift({
        name: "type",
        label: "Type",
        field: "type",
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("schedule")) {
      columns.value.unshift({
        name: "scheduleName",
        label: "Schedule",
        field: (row) => ("schedule" in row ? row.schedule.name : ""),
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("repository")) {
      columns.value.unshift({
        name: "repositoryName",
        label: "Repository",
        field: (row) => ("repository" in row ? row.repository.name : ""),
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("host")) {
      columns.value.unshift({
        name: "hostName",
        label: "Host",
        field: (row) => ("host" in row ? row.host.name : ""),
        required: true,
        align: "left",
      });
    }
    if (props.fields.includes("backup")) {
      columns.value.unshift({
        name: "backupName",
        label: "Backup",
        field: (row) => ("backup" in row ? row.backup.name : ""),
        required: true,
        align: "left",
      });
    }

    const pagination = ref({
      sortBy: "created",
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    const onRequest = async (tableProps) => {
      const { page, rowsPerPage, sortBy, descending } = tableProps.pagination;
      const filter = tableProps.filter;

      loading.value = true;

      // Fetch data from server
      const a = new Activity();
      const resp = await a.getAll({
        backupId: props.backup,
        hostId: props.host,
        repositoryId: props.repository,
        scheduleId: props.schedule,
        page: page,
        limit: rowsPerPage,
      });
      // Update total number of rows
      pagination.value.rowsNumber = resp.count;
      // Clear out existing data and add new
      activity.value.splice(0, activity.value.length, ...resp.items);
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

    const statusColor = (status, primary) => {
      if (status === "Error") {
        return "negative";
      } else if (status === "Complete") {
        return "positive";
      } else {
        return primary;
      }
    };

    const showMessages = (messages) => {
      let html = "";
      for (const message of messages) {
        let color = "black";
        if (message.level === "error") {
          color = "negative";
        } else if (message.level === "warning") {
          color = "warning";
        }
        html += `<p class="text-${color}">${message.date} ${message.level} ${message.message}`;
      }
      $q.dialog({
        html: true,
        title: "Messages",
        message: html,
        cancel: false,
      });
    };

    const deleteActivity = (id) => {
      const a = new Activity();
      a.deleteItem(id)
        .then(() => {
          activity.value.splice(
            activity.value.findIndex((item) => item._id === id),
            1
          );
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the activity. Please try again later.",
          });
          console.error("Failed to delete activity", err.message);
        });
    };

    return {
      loading,
      filter,
      pagination,
      activity,
      columns,
      onRequest,
      refresh,
      statusColor,
      showMessages,
      confirmDelete: (id, index) => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this activity? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteActivity(id, index);
        });
      },
    };
  },
});
</script>
