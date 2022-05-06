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
      <snapshot-table></snapshot-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "RestorePage",
  components: {
    SnapshotTable: defineAsyncComponent(() =>
      import("/src/components/SnapshotTable.vue")
    ),
  },
  setup() {
    const $q = useQuasar();
    return {};
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
