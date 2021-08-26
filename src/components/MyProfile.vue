<template>
  <div class="myprofile wrapper">

    <h1 class="hidden-sm">{{ $t('global.myProfile') }}</h1>

    <div class="space4 hidden-sm"></div>
    <div :class="{ 'space4' : mobileAppMode }"></div>
    <div class="flex__grid--thirds">

      <div class="widget card-panel flex--2-3 pt-sm-0">

        <MyActivity
            v-if="client.settings.frontend_myprofile_show_myactivity"
            :historicClassSignups="historicClassSignups"
            :historic-class-livestream-signups="historicClassLivestreamSignups"
        ></MyActivity>

        <div
          class="card-panel flex--row-standard space--between"
          :class="{ widget: client.settings.frontend_myprofile_show_myactivity }"
        >
          <div class="width__50--desktop">
            <MyClasses :classes="upcomingClasses" @refresh="getMyProfile"></MyClasses>
          </div>
          <div class="space4"></div>
          <div class="width__50--desktop">
            <MyEvents
              v-if="client.settings.frontend_show_menu_item_events"
              :eventSignups="eventSignups"
              @refresh="getMyProfile"
            >
            </MyEvents>
          </div>
        </div>

        <div class="space1" v-if="videoGroups.length"></div>

        <MyVideos
          :videoGroups="customer.video_groups_that_customer_can_access"
          v-if="videoGroups.length"
        >
        </MyVideos>

      </div>

      <div class="widget card-panel flex--1-3">
        <MyMembership
          :memberships="customer.memberships"
          v-if="customer.memberships.length"
        >
        </MyMembership>
        <div class="space4" v-if="customer.memberships.length"></div>
        <MyClassPasses
          :classPasses="customer.class_passes"
          v-if="customer.class_passes.length"
        >
        </MyClassPasses>
        <div
          v-if="!customer.memberships.length && !customer.class_passes.length"
          class="theme--frame-box"
        >
          <h3>{{ $t('profile.noMemberships') }}</h3>
          <div class="space4"></div>
          <router-link class="underline" :to="{name:'Prices'}">
            {{ $t('global.seePrices') }}
          </router-link>
        </div>

        <div v-if="customer.invoices.length">
          <MyPurchases :invoices="customer.invoices"></MyPurchases>
        </div>
        <div class="space4" v-if="customer.invoices.length"></div>

        <MyInfo :customer="customer"></MyInfo>
      </div>

    </div> <!-- flex-row -->

    <div class="space8"></div>

    <md-dialog-alert
      :md-active.sync="showPaymentSuccessDialog"
      :md-title="$t('global.thanksForYourOrder')"
      :md-content="$t('global.paymentSuccess')"
      md-confirm-text="Ok"
    />

  </div>
</template>

<script>
import MyClasses from './MyClasses';
import MyEvents from './MyEvents';
import MyActivity from './MyActivity';
import MyMembership from './MyMembership';
import MyClassPasses from './MyClassPasses';
import MyPurchases from './MyPurchases';
import MyInfo from './MyInfo';
import MyVideos from "./MyVideos";
import YogoApi from '../gateways/YogoApi';
import moment from 'moment';
import { mapGetters } from 'vuex';
import qs from 'qs';

import _filter from 'lodash/filter';
import _each from 'lodash/each';
import _reverse from 'lodash/reverse';
import _sortBy from 'lodash/sortBy';

export default {
  name: 'MyProfile',
  components: {
    MyPurchases,
    MyClasses,
    MyEvents,
    MyActivity,
    MyMembership,
    MyInfo,
    MyClassPasses,
    MyVideos,
  },
  data() {
    return {
      receipt: false,
      thanks: 'Dit køb er gennemført.',
      customer: {
        class_signups: [],
        memberships: [],
        class_passes: [],
        orders: [],
        invoices: [],
      },
      historicClassSignups: [],
      historicClassLivestreamSignups: [],
      upcomingClasses: [],
      eventSignups: [],

      showPaymentSuccessDialog: false,

      videoGroups: [],
    };
  },
  computed: {
    ...mapGetters([
      'userIsLoggedIn',
      'userName',
      'profileImageFilename',
      'client',
      'clientLogoFilename',
      'user',
      'stateReady',
      'myProfileFlashMessage',
      'mobileAppMode',
    ]),
  },
  mounted() {
    if (this.stateReady) this.getMyProfile();
    if (this.myProfileFlashMessage && this.myProfileFlashMessage.type === 'paymentSuccess') {
      this.showPaymentSuccessDialog = true;
      this.$store.commit('setMyProfileFlashMessage', null);
    }
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.getMyProfile();
    },
  },
  methods: {
    async getMyProfile() {

      const userQueryString = qs.stringify({
        id: this.user.id,
        populate: [
          'memberships',
          'memberships.membership_type',
          'memberships.payment_option',
          'memberships.payment_subscriptions',
          'memberships.pending_no_show_fees',
          'memberships.next_payment',
          'memberships.current_or_upcoming_membership_pause',
          'memberships.current_membership_pause',
          'memberships.upcoming_membership_pause',
          //'memberships.pending_no_show_fees.class',
          //'memberships.pending_no_show_fees.class.class_type',
          'class_passes',
          'class_passes.class_pass_type',
          'image',
          'video_groups_that_customer_can_access',
          'invoices',
        ],
      });

      const historicClassSignupsQueryString = qs.stringify({
        user: this.user.id,
        startDate: moment()
            .startOf('month')
            .subtract(11, 'months')
            .format('YYYY-MM-DD'),
        endDate: moment()
            .startOf('month')
            .add(1, 'month')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        populate: ['class', 'class.class_type'],
      });

      const classesQueryString = qs.stringify({
        userIsSignedUpOrOnWaitingList: this.user.id,
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD'),
        populate: [
          'class_type',
          'room',
          'room.branch',
          'user_is_signed_up_for_class',
          'user_can_sign_off_from_class',
          'user_is_signed_up_for_livestream',
          'user_can_sign_off_from_livestream',
          'user_is_signed_up_for_waiting_list',
          'user_can_sign_off_from_waiting_list',
          'user_number_on_waiting_list',
          'class_signoff_warning',
          'class_signoff_deadline_timestamp',
          'user_must_receive_warning_after_signoff_deadline',
          'user_can_start_livestream',
          'livestream_link',
        ],
        sort: [
          'date ASC',
          'start_time ASC',
        ],
      });

      const eventSignupsQueryString = qs.stringify({
        user: this.user.id,
        populate: ['event',
          'event.time_slots',
        ],
      });

      let upcomingClassResponse;

      [
        [this.customer],
        this.historicClassSignups,
        this.historicClassLivestreamSignups,
        upcomingClassResponse,
        this.eventSignups,
        this.videoGroups,
      ] = await Promise.all([
            YogoApi.get(`/users?${userQueryString}`),
            YogoApi.get(`/class-signups?${historicClassSignupsQueryString}`),
            YogoApi.get(`/class-livestream-signups?${historicClassSignupsQueryString}`),
            YogoApi.get(`/classes?${classesQueryString}`),
            YogoApi.get(`/event-signups?${eventSignupsQueryString}`),
            YogoApi.get('/video-groups'),
          ],
      );
      this.customer.class_passes = _filter(
          this.customer.class_passes,
          classPass => (classPass.classes_left > 0 || classPass.class_pass_type.pass_type === 'unlimited') &&
              moment(classPass.valid_until, 'YYYY-MM-DD').isSameOrAfter(moment(), 'day'),
      );
      this.customer.memberships = _filter(
          this.customer.memberships,
          membership => membership.status !== 'ended',
      );
      this.upcomingClasses = upcomingClassResponse.classes;

      _each(this.customer.video_groups_that_customer_can_access, videoGroup => {
        switch (videoGroup.sort_videos_by) {
          case 'name':
            videoGroup.videos = _sortBy(videoGroup.videos, video => video.video_provider_data.name);
            break;
          case 'created':
            videoGroup.videos = _sortBy(videoGroup.videos,
                video => video.video_provider_data.created_time);
            break;
        }
        if (videoGroup.sort_videos_direction === 'desc') {
          videoGroup.videos = _reverse(videoGroup.videos);
        }
        _each(videoGroup.videos, video => {
          video.has_long_description = video.video_provider_data.description && video.video_provider_data.description.length > 220;
          if (video.has_long_description) {
            const lastSpacePosition = video.video_provider_data.description.lastIndexOf(' ', 179);
            video.description_preview = video.video_provider_data.description.substr(0,
                lastSpacePosition) + '...';
            video.show_full_description = false;
          }
        });
      });


    },

  },
};
</script>


<style>


</style>
