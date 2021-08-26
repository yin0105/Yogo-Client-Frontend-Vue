<template>
  <div>

    <LoadingSpinner v-if="loading" :centered="true"></LoadingSpinner>

    <ul class="fr-mdw wrap mt2 class-items calendar-list" :class="{'schedule--loading': loading }">
      <li
        class="events-group tac-md" v-for="dayIndex in [0,1,2,3,4,5,6]"
        :class="{'current-day' : momentDay(dayIndex).isSame(moment(),'day'), 'before-today' : momentDay(dayIndex).isBefore(moment(),'day')}"
        :key="'dayIndex_' + dayIndex"
      >
        <div class="cal-top sticky">
          <div>
              <span>
                {{ momentDay(dayIndex).format('dddd') | capitalize }}
              </span>
          </div>
          <div class="bold">
            {{ momentDay(dayIndex).format('D. MMM') }}
          </div>
        </div>

        <ul>
          <li
            :class="{'class-has-started' : calendarItem.class_type && calendarItem.class_has_started, 'class-cancelled' : calendarItem.class_type && calendarItem.cancelled }"
            class="class-item tac-md"
            v-for="(calendarItem, calendarItemIdx) in combinedClassesAndEventsForDay(dayIndex)"
            :ref="'calendarItem_' + dayIndex + '_' + calendarItemIdx"
            :style="getClassInlineStyle(calendarItem, calendarItemIdx)"
            :key="'calendarItem_' + dayIndex + '_' + calendarItemIdx"
          >
            <!-- Class -->
            <a @click="onCalendarItemClick(calendarItem)" v-if="calendarItem.class_type">

              <h3 v-if="calendarItem.cancelled" class="mb1">
                {{ ( calendarItem.cancelled ? $t('global.cancelled') : '') }}
              </h3>

              <span class="class-color m0a-md" :style="getClassBarInlineStyle(calendarItem)"></span>

              <p class="mb-1">
                {{ dbTimeToHumanTime(calendarItem.start_time) }} - {{ dbTimeToHumanTime(calendarItem.end_time) }}
              </p>

              <p class="ttu bold mb-1">
                {{ ( calendarItem.class_type ? calendarItem.class_type.name : '' ) }}
              </p>

              <p>
                {{ calendarItem.subtitle }}
              </p>

              <p class="bold" v-if="calendarItem.branchName && !parseInt(filterByBranch)">
                  {{ calendarItem.branchName }}
                </p>

                <p class="bold mb-1" v-if="client.settings.calendar_show_room && calendarItem.room">
                  {{ calendarItem.room.name }}
                </p>

                <p v-for="teacher in calendarItem.teachers" class="small" :key="'teacher_' + teacher.id">
                  {{ teacher.first_name }}
                </p>

              <div class="justify-end flex-column flex-grow">

                <p v-if="!calendarItem.cancelled">
                  <br>
                  <span class="bold">
                    {{ calendarItem.capacity_text }}
                  </span>
                  <span
                    v-if="calendarItem.waiting_list_text"
                    class="bold"
                  >
                    <br>
                    {{ calendarItem.waiting_list_text }}
                  </span>
                </p>

                <ClassAction
                  :classItem="calendarItem"
                  @signUpForClass="signUpForClass"
                  @signUpForWaitingList="signUpForWaitingList"
                  @signUpForLivestream="signUpForLivestream"
                  align="center"
                  customClass="fs-lg text-center lg:text-left mt-1 mb-2"
                ></ClassAction>

              </div>

            </a>

            <!-- End Class, begin EventTimeSlot -->

            <a v-else @click="onCalendarItemClick(calendarItem)">
              <span class="class-color m0a-md" :style="getEventTimeSlotInlineStyle(calendarItem)"></span>
              <p class="mb-1">
                {{ dbTimeToHumanTime(calendarItem.start_time) }} - {{ dbTimeToHumanTime(calendarItem.end_time) }}
              </p>

              <p class="ttu bold mb-1">
                {{ calendarItem.event.name }}
              </p>

              <p class="bold" v-if="calendarItem.branchName && !parseInt(filterByBranch)">
                  {{ calendarItem.branchName }}
              </p>

              <p class="bold mb-1" v-if="client.settings.calendar_show_room && calendarItem.event.room">
                {{ calendarItem.event.room.name }}
              </p>

              <p v-for="teacher in calendarItem.event.teachers" class="small mb-1" :key="'teacher_' + teacher.id">
                {{ teacher.first_name }}
              </p>

              <div class="justify-end flex-column flex-grow">

              <div class="relative-container">
                <SignedUpCheckmark v-if="calendarItem.user_is_signed_up_for_event"></SignedUpCheckmark>

                <div class="bold" v-else-if="calendarItem.event_is_fully_booked">
                  {{ $t('global.fullyBooked') }}
                </div>

                <div class="btn btn-secondary w-full" v-if="calendarItem.user_can_sign_up_for_event"
                     @click.prevent.stop="signUpForEvent(calendarItem.event)">
                  {{ $t('global.signup') }}
                </div>
              </div>

              </div>
            </a>

            <!-- End EventTimeSlot -->

          </li>

        </ul>

      </li>
    </ul>

    <ClassDialog
      :showClassDialog.sync="showClassDialog"
      v-if="dialogClass"
      :dialogClass="dialogClass"
      @signupsChanged="updateCalendar"
    ></ClassDialog>

    <ClassSignup
      :user="user"
      ref="classSignupComponent"
      @classSignupSuccess="updateCalendar"
      @classSignoffSuccess="updateCalendar"
      @classSignupFailure="updateCalendar"
      @classWaitingListSignupSuccess="updateCalendar"
      @classWaitingListSignoffSuccess="updateCalendar"
    >
    </ClassSignup>

    <EventDialog
      :showEventDialog.sync="showEventDialog"
      v-if="dialogEventTimeSlot"
      :dialogEventTimeSlot="dialogEventTimeSlot"
      @signupsChanged="updateCalendar"
    ></EventDialog>

    <EventSignup
      :user="user"
      ref="eventSignupComponent"
      @eventSignupSuccess="updateCalendar"
    ></EventSignup>

  </div>
</template>

<script>

  import _fill from 'lodash/fill'
  import _debounce from 'lodash/debounce'

  import ColorLuminance from '@/includes/util/ColorLuminance'

  import ScheduleBase from '@/components/schedule/ScheduleBase'

  import ClassAction from "./ClassAction"

  import LoadingSpinner from '../LoadingSpinner.vue'

  import ClassSignup from '@/components/ClassSignup.vue'
  import ClassDialog from '@/components/schedule/ClassDialog'

  import EventSignup from '@/components/EventSignup.vue'
  import EventDialog from '@/components/schedule/EventDialog'
  import SignedUpCheckmark from '@/graphics/SignedUpCheckmark'

  export default {
    extends: ScheduleBase,
    components: {
      ClassAction,
      LoadingSpinner,
      ClassSignup,
      ClassDialog,
      EventSignup,
      EventDialog,
      SignedUpCheckmark,
    },

    data() {
      return {
        rowMinHeights: [],
        debouncedAdjustCalendarItemHeightsFunction: null
      }
    },

    mounted() {
      this.debouncedAdjustCalendarItemHeightsFunction = _debounce(this.adjustCalendarItemHeights, 100)
      window.addEventListener('resize', this.debouncedAdjustCalendarItemHeightsFunction)
    },

    beforeDestroy() {
      window.removeEventListener('resize', this.debouncedAdjustCalendarItemHeightsFunction)
    },

    methods: {
      getCalendarItemInlineStyle(calendarItem) {
        let style
        if (calendarItem.class_type) {
          style = this.getClassInlineStyle(calendarItem)
        } else {
          style = this.getEventTimeSlotInlineStyle(calendarItem)
        }
        return style
      },
      getClassInlineStyle(classItem, rowIdx) {
        let style = {}
        if (classItem.cancelled) {
          style.opacity = '.5'
        }
        style['min-height'] = (this.rowMinHeights[rowIdx] ? this.rowMinHeights[rowIdx] : 0) + 'px'
        return style
      },
      getEventTimeSlotInlineStyle(eventTimeSlot) {
        return {
          background: eventTimeSlot.event.event_group ? eventTimeSlot.event.event_group.color : this.client.settings.theme_primary_color,
        }
      },
      getClassBarInlineStyle(classItem) {
        let style = {}
        if (classItem.cancelled) {
          style.background = classItem.class_has_started ? this.ColorLuminance(classItem.class_type.color, -0.3) : classItem.class_type.color
        } else {
          style.background = classItem.class_has_started ? this.ColorLuminance(classItem.class_type.color, -0.3) : classItem.class_type.color
        }
        return style
      },

      adjustCalendarItemHeights() {
        const calendarItems = []
        let maxCalendarItemsInDay = 0
        for (let weekdayIdx = 0; weekdayIdx <= 6; weekdayIdx++) {
          calendarItems[weekdayIdx] = this.combinedClassesAndEventsForDay(weekdayIdx)
          maxCalendarItemsInDay = Math.max(maxCalendarItemsInDay, calendarItems[weekdayIdx].length)
        }

        this.rowMinHeights = _fill(Array(maxCalendarItemsInDay), 0)
        this.$forceUpdate()

        if (window.innerWidth < 768) return

        for (let rowIdx = 0; rowIdx < maxCalendarItemsInDay; rowIdx++) {
          this.rowMinHeights[rowIdx] = 0
          for (let weekdayIdx = 0; weekdayIdx <= 6; weekdayIdx++) {
            if (calendarItems[weekdayIdx][rowIdx]) {
              this.rowMinHeights[rowIdx] = Math.max(
                this.rowMinHeights[rowIdx],
                this.$refs['calendarItem_' + weekdayIdx + '_' + rowIdx][0].offsetHeight,
              )
            }
          }
        }
        this.$forceUpdate()
      },

      ColorLuminance: ColorLuminance,

    },
  }
</script>

<style lang="scss" scoped>

  .cal-top {
    background: #f4f4f4;
    text-transform: uppercase;
    padding: 10px;
    z-index: 2;
    @media (min-width: 768px) {
      margin-right: 10px;
    }
    span {
      font-size: 12px;
    }
  }

  .events-group {
    @media (min-width: 1030px) {
      width: 14.285%;
    }
  }

  .schedule--loading {
    opacity: 0.3;
  }

  .class-items {
    display: flex;
  }

  .class-item {
    padding: 20px 10px;
    border-bottom: 1px solid #cecece;
    font-size: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: background .15s;
    @media (min-width: 768px) {
      margin-right: 10px;
    }
    @media (min-width: 1030px) {
      display: flex;
    }

    p {
      margin: 0;
    }

    &:last-of-type {
      margin-bottom: 20px;
    }

    &:hover {
      background: lighten(#cecece, 50%) !important;

      .class-color {
        width: 8px;
      }
    }
  }

  .current-day {
    .cal-top {
      background: #555 !important;
      color: #fff;
      margin-right: 10px;
    }
  }

  .class-color {
    display: block;
    height: 8px;
    width: 35px;
    border-radius: 5px;
    margin-bottom: 10px;
    transition: width .3s ease;
  }

  .class-has-started {
    opacity: .5;
  }

  .class-action {
    display: flex;
    flex-direction: column;
  }

  .calendar-list li a {
    display: flex;
    flex-direction: column;

    width: 100%;
  }

  .fadein-enter-active {
    transition: .5s;
  }

  .fadein-enter {
    opacity: 0;
  }

  .cd-schedule--loading {
    opacity: .3;
  }

  .fadein-enter-active {
    transition: .5s;
  }

  .fadein-enter {
    opacity: 0;
  }

  .md-datepicker.calendar-datepicker {
    .md-clear {
      display: none !important;
    }
  }

</style>

