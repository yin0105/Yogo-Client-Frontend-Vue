<template>
  <div>
    <md-dialog :md-active="showEventDialog" v-on:update:mdActive="updateShowEventDialog">
      <a class="close-signup-modal" @click="$emit('update:showEventDialog',false)">
        <span class="icon-close"></span>
      </a>
      <div class="modal-content">
        <h1>{{ dialogEventTimeSlot.event.name }}</h1>
        <p class="ttu">
          {{ dialogEventTimeSlot.date | moment('dddd [d.] D. MMMM') }} {{ dialogEventTimeSlot.start_time + '-' +
          dialogEventTimeSlot.end_time }}
        </p>

        <p class="bold ttu">
          <span v-if="dialogEventTimeSlot.event.price === 0">
           {{ $t('global.free') | capitalize }}
         </span>
         <span v-else>
           {{ $t('global.price') }}: {{ dialogEventTimeSlot.event.price | currency_dkk({decimals : 0}) }} kr
         </span>
       </p>
        <p class="bold mb-0 leading-loose" v-if="dialogEventTimeSlot.branchName">
          {{ dialogEventTimeSlot.branchName }}
        </p>
        <div v-if="client.settings.calendar_show_room && dialogEventTimeSlot.event.room">
          {{ dialogEventTimeSlot.event.room.name }}
        </div>

        <div class="space2"></div>
        <img class="modal__image--standard"
             :src="Imgix(dialogEventTimeSlot.event.image.filename, {w:900,h:200,fit:'crop'})"
             v-if="dialogEventTimeSlot.event.image"
             alt="">
        <nl2br tag="p" :text="dialogEventTimeSlot.event.description"></nl2br>
        <div class="line"></div>
        <div class="space2"></div>

        <div class="modal__teacher--info">
          <div
            class="my-2"
            v-for="(teacher, index) in dialogEventTimeSlot.event.teachers"
            :style="{cursor: teacher.teacher_description.trim() !== '' ? 'pointer' : 'default'}"
            :key="'teacher_' + teacher.id"
          >
            <div class="flex pr1 items-center" :class="teacher.teacher_description.trim().length ? 'pointer' : ''"
                 @click.prevent="toggleTeacherInfo(index)">
              <img :src="teacher.image ? Imgix(teacher.image.filename, {w:200, h:200, fit: 'crop'}) : avatar()" alt="">
              <p>
                {{ $t('global.teacher') }}: {{ teacher.first_name + ' ' + teacher.last_name }}
              </p>
              <div class="flex items-center pointer ml2" v-if="teacher.teacher_description.trim().length">
                <span :class="{ 'rotate': showTeacherInfo[index] }" class="block icon-arrowdown"></span>
              </div>
            </div>

            <!-- dropdown content -->
            <transition name="slide-fade" mode="out-in" appear>
              <nl2br tag="div" :text="teacher.teacher_description" v-if="showTeacherInfo[index]"
                     className="my-2"></nl2br>
            </transition>
            <!-- end dropdown content -->

          </div>
        </div>

      </div>
      <md-dialog-actions>
        <button class="btn btn-primary" @click="signUpForEvent(dialogEventTimeSlot.event)"
                v-if="dialogEventTimeSlot.user_can_sign_up_for_event">{{ $t('global.signup') }}
        </button>
        <button class="btn btn-primary" disabled="disabled"
                v-if="dialogEventTimeSlot.user_is_signed_up_for_event">{{ $t('global.youAreSignedUp') }}
        </button>
        <button class="btn btn-primary"
                @click.stop.prevent="signOffFromEvent(dialogEventTimeSlot.event);$emit('update:showEventDialog',false)"
                v-if="dialogEventTimeSlot.user_can_sign_off_from_event"
        >{{ $t('global.signOff') }}
        </button>
      </md-dialog-actions>
    </md-dialog>

    <EventSignup
      :user="user"
      ref="eventSignupComponent"
      @eventSignupSuccess="eventSignupSuccess"
      @eventSignoffSuccess="eventSignoffSuccess"
    ></EventSignup>

  </div>

</template>


<script>

  import EventSignup from '@/components/EventSignup'
  import Imgix from '@/services/Imgix'

  import {mapGetters} from 'vuex'

  import avatar from '@/graphics/avatar'

  export default {
    mixins: [Imgix],
    data() {
      return {
        showTeacherInfo: [],
      }
    },
    props: [
      'showEventDialog',
      'dialogEventTimeSlot',
    ],
    computed: {
      ...mapGetters([
        'client',
        'user',
      ]),
    },
    components: {
      EventSignup,
    },

    methods: {

      updateShowEventDialog(showEventDialog) {
        this.$emit('update:showEventDialog', showEventDialog)
      },

      signUpForEvent(event) {
        this.$refs.eventSignupComponent.$emit('signUpForEvent', event)
      },
      signOffFromEvent(event) {
        this.$refs.eventSignupComponent.$emit('signOffFromEvent', event)
      },
      eventSignupSuccess() {
        this.$emit('signupsChanged')
        this.$emit('update:showEventDialog', false)
      },
      eventSignoffSuccess() {
        this.$emit('signupsChanged')
        this.$emit('update:showEventDialog', false)
      },
      avatar() {
        return avatar
      },
      toggleTeacherInfo(index) {
        this.$set(this.showTeacherInfo, index, !this.showTeacherInfo[index])
      },
    },
    watch: {
      showEventDialog(newShowEventDialog) {
        if (newShowEventDialog === false) {
          this.showTeacherInfo = []
        }
      },
    },
  }


</script>

<style lang="scss" scoped>

  .teacher {
    margin-right: 20px;
  }

  .no-border {
    box-shadow: none;
  }

  .slide-fade-enter-active {
    transition: all .3s ease;
    z-index: 2;
    position: relative;
  }

  .slide-fade-leave-active {
    transition: all .2s ease;
    z-index: 2;
    position: relative;
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-30px);
    z-index: 2;
    position: relative;
  }

  .slide-fade-enter {
    opacity: 0;
    transform: translateY(-30px);
    z-index: 2;
    position: relative;
  }

</style>
