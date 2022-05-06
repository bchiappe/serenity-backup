<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md flex justify-between">
      Edit Schedule
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
              <q-input label="Name" v-model="schedule.name" />
              <q-input label="Cron" v-model="schedule.cron" />
              <q-toggle label="Active" v-model="schedule.active" />
              <div class="task-list">
                <div class="task-list-text">
                  Backups will be executed in descending order.
                </div>
                <draggable
                  tag="div"
                  v-model="schedule.tasks"
                  handle=".handle"
                  item-key="index"
                  class="q-list q-list--bordered q-list--separator"
                >
                  <template #item="{ element, index }">
                    <q-item>
                      <q-item-section class="handle icon-section">
                        <q-icon name="drag_handle"></q-icon>
                      </q-item-section>
                      <q-item-section>
                        <q-select
                          label="Backup"
                          v-model="element.backup"
                          :options="backups"
                          option-value="_id"
                          option-label="name"
                          map-options
                          emit-value
                          dense
                        />
                      </q-item-section>
                      <q-item-section class="icon-section">
                        <q-btn
                          icon="delete"
                          size="sm"
                          class="q-ml-sm"
                          flat
                          dense
                          color="negative"
                          @click="schedule.tasks.splice(index, 1)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                </draggable>
                <q-btn
                  color="positive"
                  icon="add"
                  label="Add Backup Task"
                  size="sm"
                  class="q-mt-sm"
                  @click="schedule.tasks.push({ backup: '' })"
                />
              </div>
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
                          'text-positive':
                            schedule.lastRun.result === 'success',
                          'text-negative': schedule.lastRun.result === 'fail',
                          flex: true,
                          'justify-end': true,
                        }"
                      >
                        {{
                          date.formatDate(
                            schedule.lastRun.date,
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
                          @click="runSchedule"
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
          <activity-table
            :schedule="id"
            :fields="['date', 'status', 'progress', 'message']"
          ></activity-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Scheduler from "src/lib/scheduler";
import Backup from "src/lib/backup";
import { useRouter, useRoute } from "vue-router";
import { useQuasar, date } from "quasar";
import draggable from "vuedraggable";

export default defineComponent({
  name: "EditSchedulePage",
  components: {
    ActivityTable: defineAsyncComponent(() =>
      import("/src/components/ActivityTable.vue")
    ),
    draggable,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();
    const schedule = ref({
      tasks: [{ backup: "" }],
      active: false,
      lastRun: {},
    });
    let scheduleOrig = {};
    const backups = ref([]);
    const showAlert = ref(false);
    const alertMessage = ref("");
    const alertType = ref("success");
    const id = route.params.id;

    const getSchedule = () => {
      const s = new Scheduler();
      s.getItem(id).then((resp) => {
        const data = resp;
        if (!("lastRun" in data)) {
          data.lastRun = {
            result: "unknown",
            date: "N/A",
          };
        }
        schedule.value = { ...data };
        scheduleOrig = { ...data };
      });
    };
    getSchedule();

    const deleteSchedule = () => {
      const s = new Scheduler();
      s.deleteItem(id)
        .then(() => {
          router.push("/scheduler");
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

    const b = new Backup();
    b.getAll().then((resp) => {
      backups.value = [...resp.items];
    });

    return {
      id,
      schedule,
      backups,
      alertType,
      showAlert,
      alertMessage,
      deleteSchedule,
      update: () => {
        const s = new Scheduler();
        const updates = {
          name: schedule.value.name,
          cron: schedule.value.cron,
          active: schedule.value.active,
          tasks: [...schedule.value.tasks],
        };
        s.update(id, updates)
          .then(() => {
            alertType.value = "success";
            alertMessage.value = "Schedule updated successfully.";
            showAlert.value = true;
          })
          .catch((err) => {
            alertType.value = "error";
            alertMessage.value = `An error occurred updating the schedule: ${err.message}`;
            showAlert.value = true;
          });
      },
      revert: () => {
        schedule.value = { ...scheduleOrig };
      },
      confirmDelete: () => {
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
          deleteSchedule();
        });
      },
      runSchedule: () => {
        const s = new Scheduler();
        s.run(id)
          .then(() => {
            $q.notify({
              type: "positive",
              message: `Schedule started successfully`,
            });
            getSchedule();
          })
          .catch((err) => {
            $q.notify({
              type: "negative",
              message: `An error occurred starting the schedule: ${err.message}`,
            });
            getSchedule();
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

.task-list {
  max-width: 700px;
  margin-top: 1.5rem;
  margin-left: auto;
  margin-right: auto;
}

.task-list-text {
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  margin-bottom: 0.5rem;
}

.icon-section {
  flex: none;
}
</style>
