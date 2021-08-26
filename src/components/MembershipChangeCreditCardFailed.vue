<template>
<div></div>
</template>

<script>

    export default {

        created() {
            //this.$store.commit('setMembershipFlashMessage', {type: 'failed'});
            this.$router.push({name: 'Membership', params: {id: this.$route.params.membershipId}})
        }

    }

</script>
