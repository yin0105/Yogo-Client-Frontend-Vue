<template>
  <div class="eventsection">
    <div class="theme--frame-box">

      <div class="flex__grid--thirds align--top">
        <div class="flex__1-3--margin">
          <img :src="Imgix(eventGroup.image.filename, {w:640, h:640, fit:'crop'})" alt="" v-if="eventGroup.image">
        </div>
        <div class="space4"></div>
        <div class="flex__1-3--margin">
          <h3>{{ eventGroup.name }}</h3>
          <nl2br tag="p" :text="eventGroup.description"></nl2br>
        </div>
        <div class="space4"></div>
        <div class="flex__1-3--margin">
          <ul class="widget__list--standard">
            <li v-for="event in eventGroup.events" :key="'event_' + event.id">

              <p class="ttu bold pointer" @click.prevent="openEventDialog(event)">
                {{ event.name }}
              </p>

              <div v-if="event.use_time_slots">
                <p v-for="timeSlot in event.time_slots" :key="'timeSlot_' + timeSlot.id">
                  {{ timeSlot.date | moment('dddd [d.] D. MMMM') }} kl. {{ timeSlot.start_time + '-' + timeSlot.end_time }}
                </p>
              </div>
              <nl2br
                v-if="!event.use_time_slots"
                tag="p"
                :text="event.time_freetext"
              />

              <p class="bold">
                {{ $t('global.price') }}:
                <span v-if="event.price">
                {{ event.price | currency_dkk }} kr
                </span>
                <span v-else>
                  {{ $t('global.free') }}
                </span>

              </p>
              <div class="space2"></div>
              <div class="flex--row space--between border__bottom--gray">
                <a class="btn lower" @click.prevent="openEventDialog(event)">{{ $t('global.readMore') }}</a>
                <span v-if="signedUpForEventIds.indexOf(event.id) !== -1">{{ $t('global.youAreSignedUp') }}</span>
                <button class="btn btn-primary" @click.prevent="buyEvent(event)" v-else-if="event.signup_count < event.seats">{{ $t('global.signup') }}</button>
                <span v-else>{{ $t('global.fullyBooked') }}</span>

              </div>
            </li>
          </ul>
          <div class="space4"></div>
        </div>
      </div>
    </div>
  </div> <!-- eventsection -->

</template>

<script>

    import {mapGetters} from 'vuex'
    import Imgix from "../services/Imgix"

    export default {
        components: {},
        mixins: [Imgix],
        data() {
            return {
                events: 'kurser',
                price: 'Pris'
            }
        },
        computed: {
            ...mapGetters([
                'userIsLoggedIn',
                'userName',
                'profileImageFilename'
            ]),
        },
        props: ['eventGroup', 'signedUpForEventIds'],
        mounted: function () {
            //$('.modal').modal();
        },
        methods: {
            openEventDialog(event) {
                this.$emit('openEventDialog', event);
            },
            buyEvent(event) {
                this.$emit('buyEvent', event);
            }
        }
    }
</script>

<style lang="stylus">

  .flex__1-3--margin
    img
      width 100%
      height 100%
    object-fit contain


</style>
