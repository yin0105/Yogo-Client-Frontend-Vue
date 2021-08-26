<template>
  <div class="events" :class="{ 'wrapper' : !mobileAppMode }">

    <h1 class="hidden-sm">{{ $t('global.eventsLabel') }}</h1>

    <loadingspinner v-if="loading"></loadingspinner>

    <div class="theme--frame-box mt-10" v-if="!eventGroups.length">
      <h3 >
        {{ $t('global.NoEventsScheduled') }}
      </h3>
    </div>

    <div v-for="eventGroup in eventGroups" v-else :key="'eventGroup_' + eventGroup.id">
      <div class="space8 hidden-sm"></div>

      <eventsection :eventGroup="eventGroup" :signedUpForEventIds="signedUpForEventIds"
                    v-on:openEventDialog="openEventDialog"
                    v-on:buyEvent="buyEvent"></eventsection>

    </div>

    <div class="space8"></div>

    <md-dialog :md-active.sync="showEventDialog" class="terms-dialog">
      <a class="close-signup-modal" @click="showEventDialog = false"><span
          class="icon-close"></span></a>
      <div class="modal-content">
        <h1>{{ dialogEvent.name }}</h1>
        <div v-if="dialogEvent.use_time_slots">
          <div v-for="timeSlot in dialogEvent.time_slots" :key="'timeSlot_' + timeSlot.id">
            {{ timeSlot.date | moment('dddd [d.] D. MMMM') }} kl.
            {{ timeSlot.start_time + '-' + timeSlot.end_time }}
          </div>
        </div>
        <p class="bold" v-if="dialogEvent.room">
          {{ dialogEvent.room.name }}
        </p>
        <h3 v-else>{{ dialogEvent.time_freetext }}</h3>
        <div class="space2"></div>
        <img class="modal__image--standard"
             :src="Imgix(dialogEvent.image.filename, {w:790, h:200, fit: 'crop'})" alt=""
             v-if="dialogEvent.image">
        <nl2br tag="p" :text="dialogEvent.description ? dialogEvent.description : ''"/>
        <div class="line"></div>
        <div class="space2"></div>

        <div class="modal__teacher--info">
          <div
              class="my-2"
              v-for="(teacher, index) in dialogEvent.teachers"
              :style="{cursor: teacher.teacher_description.trim() !== '' ? 'pointer' : 'default'}"
              :key="'teacher_' + teacher.id"
          >
            <div class="flex pr1 items-center"
                 :class="teacher.teacher_description.trim().length ? 'pointer' : ''"
                 v-on:click.prevent="showTeacherInfo[index].show=!showTeacherInfo[index].show">
              <img :src="Imgix(teacher.image.filename, {w:120, h:120, fit: 'crop'})" alt=""
                   v-if="teacher.image">
              <p>
                {{ $t('global.teacher') }}: {{ teacher.first_name + ' ' + teacher.last_name }}
              </p>
              <div class="flex items-center pointer ml2"
                   v-if="teacher.teacher_description.trim().length">
                <span :class="{ 'rotate': showTeacherInfo[index].show }"
                      class="block icon-arrowdown"></span>
              </div>
            </div>

            <!-- dropdown content -->
            <transition name="slide-fade" mode="out-in" appear>
              <div v-if="showTeacherInfo[index].show" class="my-2">
                {{ teacher.teacher_description }}
              </div>
            </transition>
            <!-- end dropdown content -->

          </div>
        </div>


      </div>
      <md-dialog-actions class="modal-footer">
        <md-button disabled v-if="userSignedUpForEvent(dialogEvent)">{{
            $t('global.youAreSignedUp')
          }}
        </md-button>
        <md-button disabled v-else-if="dialogEvent.signup_count >= dialogEvent.seats">{{
            $t('global.fullyBooked')
          }}
        </md-button>
        <button class="btn btn-primary"
                @click="buyEvent(dialogEvent)" v-else>{{ $t('global.signup') }}
        </button>
      </md-dialog-actions>

    </md-dialog>

    <md-snackbar md-position="center" :md-duration="4000"
                 :md-active.sync="showSignedUpForFreeEventSnackbar" md-persistent
    >
      {{ $t('calendar.youAreNowSignedUpFor') }}
      {{ signedUpForFreeEventSnackbarEvent ? signedUpForFreeEventSnackbarEvent.name : '' }}
    </md-snackbar>


  </div>
</template>

<script>
import EventSection from './EventSection';
import YogoApi from '../gateways/YogoApi';
import LoadingSpinner from './LoadingSpinner.vue';
import moment from 'moment';
import { mapGetters } from 'vuex';
import _each from 'lodash/each';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
import Imgix from "../services/Imgix";

export default {
  components: {
    eventsection: EventSection,
    loadingspinner: LoadingSpinner,
  },
  mixins: [Imgix],
  data() {
    return {
      loading: false,
      showTeacherInfo: [{ show: false }, { show: false }, { show: false }, { show: false }],
      eventsLabel: 'kurser',
      eventGroups: [],
      dialogEvent: {},
      showEventDialog: false,
      signedUpForEventIds: [],

      showSignedUpForFreeEventSnackbar: false,
      signedUpForFreeEventSnackbarEvent: null,
    };
  },
  computed: {
    ...mapGetters([
      'userIsLoggedIn',
      'userName',
      'profileImageFilename',
      'user',
      'stateReady',
      'mobileAppMode',
    ]),
  },
  mounted: function () {
    if (this.stateReady) {
      this.fetchEvents();
    }
  },
  methods: {

    async fetchEvents() {

      this.loading = true;

      let [events, eventGroups, eventSignups] = await Promise.all([
        YogoApi.get('/events' +
            '?startDate=' + moment().startOf('day').format('YYYY-MM-DD') +
            '&populate[]=image' +
            '&populate[]=teachers' +
            '&populate[]=teachers.image' +
            '&populate[]=time_slots' +
            '&populate[]=room' +
            '&populate[]=signup_count' +
            '&populate[]=event_group',
        ),
        YogoApi.get('/event-groups' +
            '?populate[]=image' +
            '&populate[]=teachers',
        ),
        YogoApi.get('/event-signups?user=' + this.user.id),
      ]);

      for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (!event.event_group) continue;
        let eventGroup = _find(eventGroups, { id: event.event_group.id });
        eventGroup.events = eventGroup.events || [];
        eventGroup.events.push(event);
      }
      eventGroups = _filter(eventGroups,
          eventGroup => !!eventGroup.events && !!eventGroup.events.length);

      this.eventGroups = eventGroups;
      this.signedUpForEventIds = eventSignups.map((signup) => {
        return parseInt(signup.event);
      });
      this.loading = false;
    },

    openEventDialog(e) {
      this.dialogEvent = e;
      this.showEventDialog = true;

      _each(this.dialogEvent.teachers, function (teacher) {
        if (teacher.image && !teacher.image.filename) {
          YogoApi.get('/images/' + teacher.image)
              .then((image) => {
                teacher.image = image;
              })
              .catch(() => {

              });
        }
      });
    },
    userSignedUpForEvent(event) {
      return this.signedUpForEventIds.indexOf(parseInt(event.id)) > -1;
    },

    async buyEvent(event) {

      if (parseInt(event.price) === 0) {
        const response = await YogoApi.post('/event-signups', {
          user: this.user.id,
          event: event.id,
        });
        if (response === 'E_EVENT_IS_FULL') {
          alert(this.$t('global.fullyBooked'));
          this.fetchEvents();
          return;
        }
        if (response === 'E_USER_IS_ALREADY_SIGNED_UP_FOR_EVENT') {
          alert(this.$t('calendar.youAreAlreadySignedUp'));
          this.fetchEvents();
          this.$store.dispatch('updateUser');
          return;
        }
        this.showSignedUpForFreeEventSnackbar = true;
        this.signedUpForFreeEventSnackbarEvent = event;
        this.fetchEvents();
        this.$store.dispatch('updateUser');
        return;
      }

      const updatedEvent = await YogoApi.get('/events/' + event.id + '?populate[]=signup_count');
      if (updatedEvent.signup_count >= updatedEvent.seats) {
        await this.fetchEvents();
        alert(this.$t('global.fullyBooked'));
        return;
      }

      await YogoApi.post('/cart-items', {
        item_type: 'event',
        item_id: event.id,
        user: this.user.id,
      });

      await this.$store.dispatch('updateUser');

      this.$router.push({ name: 'Checkout' });

      this.loading = false;

    },
  },

  watch: {
    stateReady(newState) {
      if (newState) {
        this.fetchEvents();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.no-border {
  box-shadow: none;
}

</style>

