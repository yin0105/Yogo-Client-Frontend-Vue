<template>
  <md-snackbar md-position="center"
               :md-active.sync="showSnackbar" md-persistent :md-duration="4000">
    {{ snackbarText }}
  </md-snackbar>
</template>

<script>

  import _find from 'lodash/find'

  import YogoApi from '@/gateways/YogoApi'

  export default {
    data() {
      return {
        snackbarText: '',
        showSnackbar: false,
      }
    },
    props: [
      'eventSignups',
      'user',
      'client'
    ],

    created() {
      this.$on('signUpForEvent', this.signUpForEvent)
      this.$on('signOffFromEvent', this.signOffFromEvent)
    },

    methods: {

      async signUpForEvent(event) {
        if (parseInt(event.price) === 0) {
          const response = await YogoApi.post('/event-signups', {
            user: this.user.id,
            event: event.id,
          })
          if (response === 'E_EVENT_IS_FULL') {
            alert(this.$t('global.fullyBooked'))
            this.$emit('updateCalendar')
            return
          }
          if (response === 'E_USER_IS_ALREADY_SIGNED_UP_FOR_EVENT') {
            alert(this.$t('calendar.youAreAlreadySignedUp'))
            this.$emit('updateCalendar')
            return
          }
          this.snackbarText = this.$t('calendar.youAreNowSignedUpForEventName', {
            eventName: event.name,
          })
          this.showSnackbar = true
          this.$emit('eventSignupSuccess', response, event)
          return
        }
        await YogoApi.post('/cart-items', {
          user: this.user.id,
          item_type: 'event',
          item_id: event.id,
        })
        this.$router.push({name: 'Checkout'})
      },


      async signOffFromEvent(event) {
        const signup = _find(this.eventSignups, signup => parseInt(signup.event) === parseInt(event.id))
        await YogoApi.delete('/event-signups/' + signup.id)
        await this.$store.dispatch('updateUser')
        this.snackbarText = this.$t('calendar.youAreNoLongerSignedUpForEventName', {
          eventName: event.name,
        })
        this.showSnackbar = true
        this.$emit('eventSignoffSuccess', signup, event)
      },

    },
  }

</script>
