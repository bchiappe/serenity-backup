<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Scheduler</div>
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
        >
        </q-input>
      </div>
      <div class="col flex justify-end">
        <q-btn
          color="positive"
          icon="add"
          label="New Schedule"
          to="/scheduler/new"
        />
      </div>
    </div>
    <div class="row q-mt-md q-mx-sm">
      <q-table
        class="record-table"
        :rows="matchedSchedules"
        :columns="columns"
        row-key="_id"
        :loading="loading"
        v-model:pagination="pagination"
      >
        <template v-slot:body-cell-active="props">
          <q-td :props="props">
            <q-toggle v-model="props.row.active" />
          </q-td>
        </template>
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn icon="play_arrow" size="sm" flat dense color="positive" />
            <q-btn
              icon="edit"
              size="sm"
              class="q-ml-sm"
              flat
              dense
              :to="'/scheduler/' + props.row._id"
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
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Scheduler from "src/lib/scheduler";
import { format, date, useQuasar } from "quasar";
const { capitalize } = format;

export default defineComponent({
  name: "SchedulerPage",
  components: {},
  setup() {
    const $q = useQuasar();
    let schedules = [];
    const matchedSchedules = ref([]);
    const totalPages = ref(0);
    const loading = ref(true);
    const searchText = ref("");

    const columns = ref([
      {
        name: "name",
        label: "Name",
        field: "name",
        required: true,
        align: "left",
      },
      {
        name: "cron",
        label: "Cron",
        field: "cron",
        required: true,
        align: "left",
      },
      {
        name: "lastRun",
        label: "Last Run",
        field: (row) => ("lastRun" in row ? row.lastRun.date : ""),
        required: true,
        align: "left",
      },
      {
        name: "nextRun",
        label: "Next Run",
        field: (row) =>
          "nextRun" in row
            ? date.formatDate(row.nextRun, "YYYY-MM-DD HH:mm:ss")
            : "",
        required: true,
        align: "left",
      },
      {
        name: "active",
        label: "Active",
        field: "active",
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

    const s = new Scheduler();
    s.getAll().then((resp) => {
      schedules = [...resp.items];
      matchedSchedules.value = [...schedules];
      totalPages.value = resp.pages;
      pagination.value.rowsNumber = resp.count;
      loading.value = false;
    });

    const deleteSchedule = (id, index) => {
      const s = new Scheduler();
      s.deleteItem(id)
        .then(() => {
          schedules.splice(
            schedules.findIndex((schedule) => schedule._id === id),
            1
          );
          matchedSchedules.value.splice(index, 1);
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the schedule. Please try again later.",
          });
          console.error("Failed to delete schedule", err.message);
        });
    };

    const search = (text) => {
      if (String(text).length > 2) {
        const searchValue = String(text).toLowerCase();
        matchedSchedules.value = schedules.filter((schedule) =>
          String(schedule.name).toLowerCase().includes(searchValue)
        );
      } else {
        matchedSchedules.value = [...schedules];
      }
    };
    return {
      page: ref(1),
      nextPage: ref(null),
      totalPages,
      loading,
      searchText,
      search,
      columns,
      matchedSchedules,
      pagination,
      capitalize,
      confirmDelete: (id, index) => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this schedule? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteSchedule(id, index);
        });
      },
      date,
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
