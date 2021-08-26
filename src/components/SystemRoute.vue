<template>
  <div></div>
</template>

<script>

  export default {
    created() {
      const routeName = this.$route.params.routeName
      const routeParamsAsJson = this.$route.params.routeParamsAsJson
      const routeParams = JSON.parse(routeParamsAsJson)
      this.$router.replace({
        name: routeName,
        params: routeParams,
      })
    },
  }

</script>
