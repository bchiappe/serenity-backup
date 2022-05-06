<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Hosts</div>
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
        <q-btn color="positive" icon="add" label="New Host" to="/hosts/new" />
      </div>
    </div>
    <div class="row q-mt-md q-mx-sm">
      <div
        class="col-lg-3 col-sm-12 col-xs-12 col-md-3 q-ma-sm"
        v-for="(host, index) in matchedHosts"
        :key="host._id"
      >
        <q-card>
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-icon name="computer" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h5">{{ host.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-card-section class="justify-center">
            <q-list separator>
              <q-item>
                <q-item-section>Operation System</q-item-section>
                <q-item-section side>
                  {{ capitalize(host.os) }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Hostname</q-item-section>
                <q-item-section side>
                  {{ `${host.host}:${host.port}` }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Last Connection</q-item-section>
                <q-item-section
                  side
                  :class="{
                    'text-positive': host.lastConnection.result === 'success',
                    'text-negative': host.lastConnection.result === 'fail',
                  }"
                >
                  {{
                    date.formatDate(
                      host.lastConnection.date,
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn icon="edit" flat :to="'/hosts/' + host._id" />
            <q-btn
              color="negative"
              icon="delete"
              flat
              @click="confirmDelete(host._id, index)"
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
import Host from "src/lib/host";
import { format, date, useQuasar } from "quasar";
const { capitalize } = format;

export default defineComponent({
  name: "HostsPage",
  components: {},
  setup() {
    const $q = useQuasar();
    let hosts = [];
    const matchedHosts = ref([]);
    const totalPages = ref(0);
    const searchText = ref("");
    const h = new Host();
    h.getAll().then((resp) => {
      hosts = [...resp.items];
      for (let host of hosts) {
        if (!("lastConnection" in host)) {
          host.lastConnection = { result: "unknown", date: "" };
        }
        if (!("lastBackup" in host)) {
          host.lastBackup = { result: "unknown", date: "" };
        }
      }
      matchedHosts.value = [...hosts];
      totalPages.value = resp.pages;
    });

    const deleteHost = (id, index) => {
      const h = new Host();
      h.deleteItem(id)
        .then(() => {
          hosts.splice(
            hosts.findIndex((host) => host._id === id),
            1
          );
          matchedHosts.value.splice(index, 1);
        })
        .catch((err) => {
          $q.notify({
            type: "negative",
            message:
              "An error occurred deleting the host. Please try again later.",
          });
          console.error("Failed to delete host", err.message);
        });
    };

    const search = (text) => {
      if (String(text).length > 2) {
        const searchValue = String(text).toLowerCase();
        matchedHosts.value = hosts.filter(
          (host) =>
            String(host.name).toLowerCase().includes(searchValue) ||
            String(host.os).toLowerCase().includes(searchValue) ||
            String(host.host).toLowerCase().includes(searchValue)
        );
      } else {
        matchedHosts.value = [...hosts];
      }
    };
    return {
      page: ref(1),
      nextPage: ref(null),
      totalPages,
      searchText,
      search,
      matchedHosts,
      capitalize,
      date,
      confirmDelete: (id, index) => {
        $q.dialog({
          title: "Confirm Delete",
          message:
            "Are you sure you want to delete this host? This cannot be undone.",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Delete",
            flat: true,
          },
        }).onOk(() => {
          deleteHost(id, index);
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
