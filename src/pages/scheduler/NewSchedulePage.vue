<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md">New Schedule</div>

    <q-form @submit="create">
      <q-card>
        <q-card-section v-if="showError">
          <q-banner class="bg-negative text-white" rounded inline-actions>
            {{ errorMessage }}
            <template v-slot:action>
              <q-btn
                flat
                color="white"
                label="Dismiss"
                @click="showError = false"
              />
            </template>
          </q-banner>
        </q-card-section>
        <q-card-section class="q-ma-lg">
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
            label="Create"
            icon="save"
            color="primary"
            type="submit"
          />
          <q-btn
            flat
            label="Clear"
            icon="clear"
            color="negative"
            @click="clear"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Scheduler from "src/lib/scheduler";
import Backup from "src/lib/backup";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";

export default defineComponent({
  name: "NewSchedulerPage",
  components: {
    draggable,
  },
  setup() {
    const router = useRouter();
    const schedule = ref({ tasks: [{ backup: "" }], active: false });
    const backups = ref([]);
    const showError = ref(false);
    const errorMessage = ref("");

    const b = new Backup();
    b.getAll().then((resp) => {
      backups.value = [...resp.items];
    });

    return {
      schedule,
      backups,
      showError,
      errorMessage,
      create: () => {
        const s = new Scheduler();
        s.create(schedule.value)
          .then(() => {
            router.push("/scheduler");
          })
          .catch((err) => {
            errorMessage.value = `An error occurred creating the schedule: ${err.message}`;
            showError.value = true;
          });
      },
      clear: () => {
        schedule.value = {};
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
