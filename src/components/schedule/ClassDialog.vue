<template>

  <div>

    <md-dialog :md-active="showClassDialog" v-on:update:mdActive="updateShowClassDialog">
      <a class="close-signup-modal" @click="$emit('update:showClassDialog',false)"><span
        class="icon-close"></span></a>
      <div class="modal-content">
        <h1>{{ dialogClass.class_type.name }}{{ dialogClass.cancelled ? ' - ' +
          $t('global.cancelled') : ''}}</h1>
        <h2>{{ dialogClass.subtitle }}</h2>
        <h3>{{ moment(dialogClass.date).format('dddd') }} d. {{
          moment(dialogClass.date).format('DD/MM/YYYY') }}</h3>
        <h3>{{ dbTimeToHumanTime(dialogClass.start_time) }} - {{
          dbTimeToHumanTime(dialogClass.end_time) }}</h3>
        <div class="space2"></div>
        <p class="bold mb-0 leading-loose" v-if="dialogClass.branchName">
          {{ dialogClass.branchName }}
        </p>
        <div v-if="client.settings.calendar_show_room && dialogClass.room">
          {{ dialogClass.room.name }}
        </div>
        <h3 v-if="dialogClass.capacity_text !== ''">{{ dialogClass.capacity_text }}<br/><br/></h3>
        <div class="space2"></div>
        <img class="modal__image--standard"
             :src="Imgix(dialogClass.class_type.image.filename, {w:900, h:200, fit:'crop'})"
             v-if="dialogClass.class_type.image"
             alt="">
        <nl2br tag="p" :text="dialogClass.class_type.description"></nl2br>
        <div class="line"></div>
        <div class="space2"></div>

        <DialogTeacherInfo :teachers="dialogClass.teachers"></DialogTeacherInfo>

      </div>

      <md-dialog-actions>

        <button class="btn btn-primary" disabled
                v-if="dialogClass.cancelled">
          {{ $t('calendar.classIsCancelled') }}
        </button>
        <button class="btn btn-primary" disabled
                v-else-if="dialogClass.user_is_signed_up_for_class">
          {{ $t('global.youAreSignedUp') }}
        </button>
        <button class="btn btn-primary" disabled
                v-else-if="dialogClass.user_is_signed_up_for_livestream">
          {{ $t('global.youAreSignedUpForLivestream') }}
        </button>
        <button class="btn btn-primary" disabled
                v-else-if="dialogClass.user_is_signed_up_for_waiting_list">
          {{ $t('global.youAreNumberXOnTheWaitlist', {number:
          dialogClass.user_number_on_waiting_list}) }}
        </button>
        <button class="btn btn-primary" disabled v-else-if="dialogClass.class_has_started">
          {{ $t('calendar.classHasStarted') }}
        </button>
        <button class="btn btn-primary" disabled
                v-else-if="dialogClass.class_is_fully_booked">
          {{ $t('calendar.classIsFull') }}
        </button>

        <button class="btn btn-primary" @click="startLivestream(dialogClass)"
                v-if="dialogClass.user_can_start_livestream">
          {{ $t('global.startLivestream') }}
        </button>

        <button class="btn btn-primary"
                @click="$emit('update:showClassDialog',false);signUpForClass(dialogClass);"
                v-if="dialogClass.user_can_sign_up_for_class">
          {{ $t('global.signup') }}
        </button>
        <button class="btn btn-primary"
                @click="$emit('update:showClassDialog',false);signOffFromClass(dialogClass);"
                v-if="dialogClass.user_can_sign_off_from_class || dialogClass.user_can_sign_off_from_livestream"
        >
          {{ $t('global.cancelBooking') }}
        </button>

        <button class="btn btn-primary"
                @click="$emit('update:showClassDialog',false);signUpForWaitingList(dialogClass);"
                v-if="dialogClass.user_can_sign_up_for_waiting_list">
          {{ $t('global.joinWaitlist') }}
        </button>
        <button class="btn btn-primary"
                @click="$emit('update:showClassDialog',false);signOffFromWaitingList(dialogClass);"
                v-if="dialogClass.user_can_sign_off_from_waiting_list"
        >
          {{ $t('global.removeFromWaitlist') }}
        </button>

        <button class="btn btn-primary"
                @click="$emit('update:showClassDialog',false);signUpForLivestream(dialogClass);"
                v-if="dialogClass.user_can_sign_up_for_livestream">
          {{ $t('global.signUpForLivestream') }}
        </button>

        <button class="btn btn-primary" disabled
                v-if="
                !dialogClass.user_is_signed_up_for_class &&
                !dialogClass.user_is_signed_up_for_waiting_list &&
                !dialogClass.user_is_signed_up_for_livestream &&
                dialogClass.class_accepts_customer_signups &&
                !dialogClass.user_has_access_to_class">
          {{ $t('calendar.youHaveNoValidClassPassOrMembershipForThisClass') }}
        </button>

        <button class="btn btn-primary"
                @click="$router.push({name:'Prices'})"
                v-if="
                !dialogClass.user_is_signed_up_for_class &&
                !dialogClass.user_is_signed_up_for_waiting_list &&
                !dialogClass.user_is_signed_up_for_livestream &&
                !dialogClass.user_has_access_to_class">
          {{ $t('global.seePrices') }}
        </button>

        <!--<button class="btn btn-primary"
                :disabled="!dialogClass.user_primary_action.action"
                @click="primaryActionClick(dialogClass.user_primary_action)"
                >
          {{ dialogClass.user_primary_action.label   }}
        </button>-->

      </md-dialog-actions>
    </md-dialog> <!-- modal -->

    <ClassSignup
      ref="classSignupComponent"
      @classSignupSuccess="onClassSignupSuccess"
      @classSignoffSuccess="onClassSignoffSuccess"
      @classWaitingListSignupSuccess="onClassWaitingListSignupSuccess"
      @classWaitingListSignoffSuccess="onClassWaitingListSignoffSuccess"
      @classLivestreamSignupSuccess="onClassLivestreamSignupSuccess"
      @classLivestreamSignoffSuccess="onClassLivestreamSignoffSuccess"
    ></ClassSignup>

  </div>
</template>

<script>

import ClassSignup from '@/components/ClassSignup.vue';
import DialogTeacherInfo from "./DialogTeacherInfo";

import moment from 'moment';
import { mapGetters } from 'vuex';

import Imgix from '../../services/Imgix';


export default {
  components: { ClassSignup, DialogTeacherInfo },
  mixins: [Imgix],
  props: [
    'showClassDialog',
    'dialogClass',
  ],
  computed: {
    ...mapGetters([
      'client',
    ]),
  },

  methods: {

    moment(date) {
      return moment(date);
    },
    dbTimeToHumanTime(dbTime) {
      return dbTime.substring(0, 5);
    },
    updateShowClassDialog(showClassDialog) {
      this.$emit('update:showClassDialog', showClassDialog);
    },

    async signUpForClass(classItem) {
      this.$refs.classSignupComponent.$emit('signUpForClass', classItem);
    },

    async onClassSignupSuccess() {
      this.$emit('signupsChanged');
      this.$emit('update:showClassDialog', false);
    },

    signOffFromClass(classItem) {
      this.$refs.classSignupComponent.$emit('signOffFromClass', classItem);
    },

    async onClassSignoffSuccess() {
      this.$emit('signupsChanged');
      this.$emit('update:showClassDialog', false);
    },

    signUpForWaitingList(classItem) {
      this.$refs.classSignupComponent.$emit('signUpForWaitingList', classItem);
    },

    async onClassWaitingListSignupSuccess() {
      this.$emit('signupsChanged');
      this.$emit('update:showClassDialog', false);
    },

    signOffFromWaitingList(classItem) {
      this.$refs.classSignupComponent.$emit('signOffFromWaitingList', classItem);
    },

    async onClassWaitingListSignoffSuccess() {
      this.$emit('signupsChanged');
      this.$emit('update:showClassDialog', false);
    },

    signUpForLivestream(classItem) {
      this.$refs.classSignupComponent.$emit('signUpForLivestream', classItem);
    },

    async onClassLivestreamSignupSuccess() {
      this.$emit('signupsChanged');
      this.$emit('update:showClassDialog', false);
    },

    signOffFromLivestream(classItem) {
      this.$refs.classSignupComponent.$emit('signOffFromLivestream', classItem);
    },

    async onClassLivestreamSignoffSuccess() {
      this.$emit('signupsChanged');
      this.$emit('update:showClassDialog', false);
    },

    primaryActionClick(action) {
      this.$refs.classSignupComponent.$emit('classPrimaryActionClick', action);
    },

    startLivestream(classItem) {
      this.$router.push({ name: 'LivestreamClassPreloader', params: { classId: classItem.id } });
    },

  },

};

</script>
