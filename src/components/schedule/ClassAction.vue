<template>
  <div :style="{color: fontColor}" class="class-action">
    <button class="btn btn-secondary" :style="{color: fontColor}"
            v-if="classItem.user_can_sign_up_for_class"
            @click.prevent.stop="$emit('signUpForClass', classItem)">
      {{ $t('global.signup') }}
    </button>

    <button class="btn btn-secondary mt-2" :style="{color: fontColor}"
            v-if="classItem.user_can_sign_up_for_livestream"
            @click.prevent.stop="$emit('signUpForLivestream', classItem)">
      {{ $t('global.signUpForLivestream') }}
    </button>

    <button class="btn btn-secondary" :style="{color: fontColor}"
            v-if="classItem.user_can_sign_up_for_waiting_list"
            @click.prevent.stop="$emit('signUpForWaitingList', classItem)">
      {{ $t('global.joinWaitlist') }}
    </button>

    <SignedUpCheckmark
        :align="align"
        :color="color"
        :class="customClass"
        v-if="classItem.user_is_signed_up_for_class || classItem.user_is_signed_up_for_livestream"
    >
    </SignedUpCheckmark>
    <div
        :align="align"
        v-if="classItem.user_is_signed_up_for_livestream"
        :class="customClass"
    >
      {{ $t('global.youAreSignedUpForLivestream') }}
    </div>

    <div
        v-if="classItem.user_is_signed_up_for_waiting_list"
        :style="{display:'flex', alignItems: 'center', justifyContent: align, flexShrink:0}"
        :class="customClass"
    >
      <SignedUpForWaitingListIcon :align="align" :color="color"></SignedUpForWaitingListIcon>
      <span style="font-size:20px;"> #{{ classItem.user_number_on_waiting_list }} </span>
      <md-tooltip>{{
          $t('global.youAreNumberXOnTheWaitlist',
              { number: classItem.user_number_on_waiting_list })
        }}
      </md-tooltip>
    </div>

    <button class="btn btn-secondary" v-if="classItem.user_can_start_livestream"
            @click.prevent.stop="$router.push({name: 'LivestreamClassPreloader', params: {classId: classItem.id}})">
      {{ $t('global.startLivestream') }}
    </button>


  </div>
</template>

<script>

import SignedUpCheckmark from "../../graphics/SignedUpCheckmark";
import SignedUpForWaitingListIcon from "../../graphics/SignedUpForWaitingListIcon";

export default {
  components: { SignedUpCheckmark, SignedUpForWaitingListIcon },
  props: [
    'classItem',
    'color',
    'align',
    'customClass',
  ],
  computed: {
    fontColor() {
      return {
        white: 'rgba(255,255,255,0.85)',
        black: 'rgba(0,0,0,0.85)',
      }[this.color];
    },
  },
};

</script>

<style lang="scss" scoped>
.class-action {
  padding-top: 10px;
}
</style>
