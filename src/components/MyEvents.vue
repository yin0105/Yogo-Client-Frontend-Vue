<template>
  <div class="events">
    <div class="theme--frame-box">

      <h2>{{ $t('profile.myEventsLabel') }}</h2>

      <div class="space4"></div>
      <div v-if="!eventSignups.length">
        {{ $t('profile.noEvents') }}
      </div>

      <ul class="widget__list--standard" v-else>

        <li v-for="eventSignup in eventSignups" :key="'eventSignup_' + eventSignup.id">
          <div class="flex__row--full">
            <p class="upper">
              {{ eventSignup.event.name }}
            </p>
            <button class="btn btn-primary"
                       v-if="parseInt(eventSignup.event.price) === 0"
                       @click="signOffFromEvent(eventSignup)">{{ $t('global.cancelBooking') }}
            </button>
          </div>
          <div  v-if="eventSignup.event.use_time_slots">
            <p v-for="timeSlot in eventSignup.event.time_slots" :key="'timeSlot_' + timeSlot.id">
              {{ timeSlot.date | moment('D. MMMM') }} kl. {{ timeSlot.start_time }} - {{ timeSlot.end_time }}
            </p>
          </div>
          <p v-else-if="!!eventSignup.event.time_freetext">
            {{ eventSignup.event.time_freetext }}
          </p>
          <p v-else>
            {{ eventSignup.event.start_date | moment('D. MMMM') }}
          </p>
          <div class="space2"></div>
        </li>
      </ul>

      <md-snackbar md-position="center" :md-duration="4000"
                   :md-active.sync="showSnackbar" md-persistent>
        {{ $t('calendar.youAreNoLongerSignedUpFor') }} {{ snackbarEvent ? snackbarEvent.name : '' }}
      </md-snackbar>
    </div>
  </div>
</template>

<script>

  import moment from 'moment'
  import YogoApi from '@/gateways/YogoApi'
  import _map from 'lodash/map'

  export default {
    name: 'myevents',
    data() {
      return {
        myEventsLabel: 'Mine kurser',
        cancelLabel: 'Afmeld',
        showSnackbar: false,
        snackbarEvent: null,
      }
    },
    props: ['eventSignups'],
    methods: {
      getEventTimeText(event) {
        if (event.use_time_slots) {
          const eventTimeStrings = _map(event.time_slots, timeSlot => moment(timeSlot.date).format('D. MMMM') + ' kl. ' + timeSlot.start_time + ' - ' + timeSlot.end_time)
          return eventTimeStrings.join('')
        }
      },
      async signOffFromEvent(eventSignup) {
        await YogoApi.delete('/event-signups/' + eventSignup.id)
        this.snackbarEvent = eventSignup.event
        this.showSnackbar = true
        this.$emit('refresh')
      },
    },
  }
</script>


<style>


</style>
