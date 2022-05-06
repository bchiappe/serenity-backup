<template>
  <q-page class="q-pa-sm form-wrapper">
    <div class="text-h6 q-ma-md">New Repository</div>

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
          <q-input label="Name" v-model="repository.name" />
          <div class="q-gutter-sm q-mt-md">
            <q-radio
              v-model="repository.type"
              val="s3"
              label="S3 Object Storage"
            />
            <q-radio v-model="repository.type" val="b2" label="Backblaze B2" />
          </div>
          <q-input
            label="Hostname"
            v-model="repository.host"
            v-if="repository.type === 's3'"
          />
          <q-input
            label="Port"
            v-model="repository.port"
            type="number"
            v-if="repository.type === 's3'"
          />
          <q-input
            label="Bucket Name"
            v-model="repository.bucketName"
            v-if="repository.type === 'b2'"
          />
          <q-input
            label="Path"
            v-model="repository.path"
            v-if="repository.type === 'b2'"
          />
          <q-input
            label="Access Key Id"
            v-model="repository.accessKeyId"
            v-if="repository.type === 's3'"
          />
          <q-input
            label="Secret Access Key"
            v-model="repository.secretAccessKey"
            v-if="repository.type === 's3'"
          />
          <q-input
            label="Account ID"
            v-model="repository.accountId"
            v-if="repository.type === 'b2'"
          />
          <q-input
            label="Account Key"
            v-model="repository.accountKey"
            v-if="repository.type === 'b2'"
          />
          <q-input label="Password" v-model="repository.password" />
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
import Repository from "src/lib/repository";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "NewRepositoryPage",
  components: {},
  setup() {
    const router = useRouter();
    const repository = ref({ type: "s3" });
    const showError = ref(false);
    const errorMessage = ref("");
    return {
      repository,
      showError,
      errorMessage,
      create: () => {
        const r = new Repository();
        r.create(repository.value)
          .then(() => {
            router.push("/repositories");
          })
          .catch((err) => {
            errorMessage.value = `An error occurred creating the repository: ${err.message}`;
            showError.value = true;
          });
      },
      clear: () => {
        repository.value = {};
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
</style>
