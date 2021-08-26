<template>
  <div>
    <loadingspinner></loadingspinner>
  </div>
</template>

<script>

import Loadingspinner from "./LoadingSpinner";

export default {
  components: { Loadingspinner },
  name: 'LivestreamClassPreloader',
  created() {
    this.$router.replace({
      name: 'LivestreamClass',
      params: { classId: this.$route.params.classId },
    });
  },
};

</script>
