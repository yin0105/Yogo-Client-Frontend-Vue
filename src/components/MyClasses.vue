<template>
  <div class="classes">
    <div class="theme--frame-box">

      <h2>{{ $t('profile.myClasses') }}</h2>
      <div class="space4"></div>
      <div v-if="!classes.length">
        {{ $t('profile.noClasses') }}
      </div>

      <ul class="widget__list--standard" v-else>
        <li
          v-for="classItem in classes"
          :key="'class_' + classItem.id"
          class="border-b pb-4"
        >
          <div class="flex__row--full">
            <div class="flex--1 w-full">

              <div class="flex justify-between">
              <p class="bold">
                <span v-if="classItem.user_is_signed_up_for_waiting_list" style="display:flex;align-items: center;">
                  <SignedUpForWaitingListIcon></SignedUpForWaitingListIcon>#{{ classItem.user_number_on_waiting_list }}
                  <md-tooltip>{{ $t('global.youAreNumberXOnTheWaitlist', {number: classItem.user_number_on_waiting_list})}}</md-tooltip>
                </span>
                  {{
                  classItem.class_type.name +
                  (classItem.cancelled ? ' '+ $t('global.cancelled') : '')
                  }}
                </p>

                <span
                  :class="{'class-cancelled' : classItem.cancelled, livestream: classItem.user_is_signed_up_for_livestream}"
                  class="items-center"
                  v-if="classItem.user_is_signed_up_for_livestream"
                >
                  {{ $t('global.Livestream') }}
                </span>
              </div>

              <p class="" v-if="classItem.room && classItem.room.branch">
                {{ classItem.room.branch.name }}
              </p>
            </div>
          </div>

          <p>
            {{ moment(classItem.date).format('D. MMMM') }}, {{ classItem.start_time.substring(0, 5)
            }} - {{ classItem.end_time.substring(0, 5) }}
          </p>
          <div class="space2"></div>
          <button
              class="btn btn-primary"
              v-if="classItem.user_can_start_livestream"
              @click="$router.push({name: 'LivestreamClassPreloader', params: {classId: classItem.id}})"
            >
              {{ $t('global.OpenLivestream') }}
            </button>
            <button
              class="btn btn-primary mt-2"
              v-if="classItem.user_can_sign_off_from_class || classItem.user_can_sign_off_from_livestream"
              @click="signOffFromClass(classItem)">{{ $t('global.cancelBooking') }}
            </button>
            <button
              class="btn btn-primary"
              v-if="classItem.user_can_sign_off_from_waiting_list"
              @click="signOffFromWaitingList(classItem)">{{ $t('global.removeFromWaitlist') }}
            </button>
        </li>
      </ul>

      <ClassSignup
        ref="classSignupComponent"
        @classSignoffSuccess="classSignoffSuccess"
        @classWaitingListSignoffSuccess="classWaitingListSignoffSuccess"
      ></ClassSignup>

    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import moment from 'moment'
  import ClassSignup from '@/components/ClassSignup'
  import SignedUpForWaitingListIcon from "../graphics/SignedUpForWaitingListIcon"

  export default {
    components: {
      ClassSignup,
      SignedUpForWaitingListIcon,
    },
    computed: {
      ...mapGetters([
        'client',
        'classSignoffDeadlineInHumanFormat',
      ]),
    },
    props: ['classes'],
    methods: {
      moment: moment,
      signOffFromClass(classItem) {
        this.$refs.classSignupComponent.$emit('signOffFromClass', classItem)
      },
      classSignoffSuccess() {
        this.$emit('refresh')
      },
      signOffFromWaitingList(classItem) {
        this.$refs.classSignupComponent.$emit('signOffFromWaitingList', classItem)
      },
      classWaitingListSignoffSuccess() {
        this.$emit('refresh')
      },
    },
  }
</script>

<style scoped>

  .livestream {
    color: #1e429f;
    padding-left: .7rem;
    padding-right: .7rem;
    line-height: 1.25rem;
    font-size: .7rem;
    font-weight: 600;
    display: inline-flex;
    border-radius: 9999px;
    background-color: #e1effe;
  }

</style>
