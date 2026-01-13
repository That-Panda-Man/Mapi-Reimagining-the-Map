<template>
  <Loading v-if="isLoading" />
  <RouterView v-else />
</template>

<script>
import { ref, onMounted } from 'vue';
import Loading from './components/Loading.vue';

export default {
  name: 'App',
  components: {
    Loading
  },
  setup() {
    const isLoading = ref(true);

    onMounted(() => {
      // Keep loading screen for at least 2 seconds
      setTimeout(() => {
        isLoading.value = false;
      }, 2000);
    });

    return {
      isLoading
    };
  }
}
</script>

<style scoped>

</style>
