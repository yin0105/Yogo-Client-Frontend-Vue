<template>
  <div></div>
</template>

<script>


    export default {
        created() {
            this.$store.commit('setMyProfileFlashMessage', {type: 'paymentSuccess', order: this.$route.orderId})
            this.$router.replace({name: 'MyProfile'})
        }
    }


</script>
