
<template>
  <div></div>
</template>

<script>


    export default {
        created() {
            this.$store.commit('setMembershipFlashMessage', {type: 'updated'})
            this.$router.replace({name: 'Membership', params: {id : this.$route.params.membershipId}})
        }
    }


</script>
