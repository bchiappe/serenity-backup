<template>
  <q-page class="q-pa-sm">
    <div class="text-h6 q-ma-md">Activity</div>
    <q-separator />
    <div class="row q-mt-md q-mx-sm">
      <activity-table></activity-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";

export default defineComponent({
  name: "ActivityPage",
  components: {
    ActivityTable: defineAsyncComponent(() =>
      import("/src/components/ActivityTable.vue")
    ),
  },
  setup() {
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
