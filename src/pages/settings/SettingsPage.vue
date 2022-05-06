<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Settings</div>
    <q-separator />
    <div class="row q-mt-md q-mx-sm">
      <q-card class="settings-card">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="general" label="General" />
          <q-tab name="alerts" label="Alerts" />
          <q-tab name="users" label="Users" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="general">
            <div class="text-h6">General</div>
            <div class="q-pa-md row items-start q-gutter-md">
              <q-card flat bordered class="alert-card">
                <q-card-section>
                  <div class="text-h6">SMTP Configuration</div>
                  <q-input label="Host" v-model="smtp.host" />
                  <q-input label="Port" v-model="smtp.port" />
                  <q-input label="User" v-model="smtp.user" />
                  <q-input
                    label="Password"
                    v-model="smtp.password"
                    type="password"
                  />
                  <q-btn
                    label="Save"
                    icon="save"
                    color="positive"
                    @click="save('smtp', smtp)"
                    size="sm"
                    class="q-mt-md"
                  />
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="alerts">
            <div class="text-h6">Alerts</div>
            <div class="q-pa-md row items-start q-gutter-md">
              <q-card flat bordered class="alert-card">
                <q-card-section>
                  <div class="text-h6">Success Notification</div>
                  <q-toggle
                    v-model="notifications.success.send"
                    label="Send email on schedule run success"
                  />
                </q-card-section>
                <q-card-section>
                  <q-input label="From" v-model="notifications.success.from" />
                  <q-input label="To" v-model="notifications.success.to" />
                  <q-input label="CC" v-model="notifications.success.cc" />
                  <q-input label="BCC" v-model="notifications.success.bcc" />
                  <q-input
                    label="Subject"
                    v-model="notifications.success.subject"
                  />
                  <q-input
                    type="textarea"
                    label="Body"
                    v-model="notifications.success.body"
                  />
                </q-card-section>
              </q-card>
              <q-card flat bordered class="alert-card">
                <q-card-section>
                  <div class="text-h6">Failure Notification</div>
                  <q-toggle
                    v-model="notifications.failure.send"
                    label="Send email on schedule run failure"
                  />
                </q-card-section>
                <q-card-section>
                  <q-input label="From" v-model="notifications.failure.from" />
                  <q-input label="To" v-model="notifications.failure.to" />
                  <q-input label="CC" v-model="notifications.failure.cc" />
                  <q-input label="BCC" v-model="notifications.failure.bcc" />
                  <q-input
                    label="Subject"
                    v-model="notifications.failure.subject"
                  />
                  <q-input
                    type="textarea"
                    label="Body"
                    v-model="notifications.failure.body"
                  />
                </q-card-section>
              </q-card>
              <q-btn
                label="Save"
                icon="save"
                color="positive"
                @click="save('notifications', notifications)"
              />
            </div>
          </q-tab-panel>

          <q-tab-panel name="users">
            <div class="text-h6">Users</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import Settings from "src/lib/settings";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "SettingsPage",
  components: {},
  setup() {
    const $q = useQuasar();
    const tab = ref("general");
    const notifications = ref({
      success: {
        send: false,
      },
      failure: {
        send: false,
      },
    });
    const smtp = ref({});

    const s = new Settings();
    s.getAll().then((resp) => {
      console.log(resp);
      const settings = resp.items.reduce(
        (obj, item) => ((obj[item.name] = item.value), obj),
        {}
      );
      console.log("Settings", settings);
      if ("notifications" in settings) {
        notifications.value = { ...settings.notifications };
      }
      if ("smtp" in settings) {
        smtp.value = { ...settings.smtp };
      }
    });

    const save = async (name, value) => {
      const s = new Settings();
      s.update(name, value)
        .then(() => {
          $q.notify({
            type: "positive",
            message: `Setting saved successfully`,
          });
        })
        .catch((err) => {
          console.error("Failed to save setting", err.message);
          $q.notify({
            type: "negative",
            message: `An error occurred saving the setting: ${err.message}`,
          });
        });
    };

    return { tab, notifications, smtp, save };
  },
});
</script>

<style scoped>
.settings-card {
  width: 100%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.alert-card {
  width: 50%;
  max-width: 450px;
}
</style>
