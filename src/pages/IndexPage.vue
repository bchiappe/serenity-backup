<template>
  <q-page class="q-pa-xl">
    <activity-table></activity-table>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
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
