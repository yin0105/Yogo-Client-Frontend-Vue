<template>
  <div></div>
</template>

<script>

  import YogoApi from '@/gateways/YogoApi'

  import {mapGetters} from 'vuex'

  import moment from 'moment'

  import _filter from 'lodash/filter'
  import _sortBy from 'lodash/sortBy'
  import _map from 'lodash/map'
  import _get from 'lodash/get'

  import qs from 'qs'

  export default {
    data() {
      return {
        loading: false,

        showClassDialog: false,
        dialogClass: null,
        classes: [],

        eventTimeSlots: [],
        showEventDialog: false,
        dialogEventTimeSlot: null,
      }
    },

    components: {
    },

    props: [
      'date',
      'filterBySessionType',
      'filterByTeacher',
      'filterByClassType',
      'filterByBranch',
    ],

    computed: {
      ...mapGetters([
        'userIsLoggedIn',
        'userName',
        'profileImageFilename',
        'client',
        'clientLogoFilename',
        'user',
        'stateReady',
      ]),
    },
    mounted: function () {
      if (this.stateReady) this.updateCalendar()
    },
    watch: {
      locale() {

      },
      date() {
        this.loading = true
        if (this.stateReady) this.updateCalendar()
      },
      stateReady(newReadyState) {
        if (newReadyState) this.updateCalendar()
      },
      filterByTeacher() {
        this.loading = true
        if (this.stateReady) this.updateCalendar()
      },
      filterByClassType() {
        this.loading = true
        if (this.stateReady) this.updateCalendar()
      },
      filterBySessionType() {
        this.loading = true
        if (this.stateReady) this.updateCalendar()
      },
      filterByBranch() {
        this.loading = true
        if (this.stateReady) this.updateCalendar()
      },
    },

    methods: {

      momentDay(dayIndex) {
        return moment(this.date).startOf('isoWeek').add(dayIndex, 'day')
      },

      async updateCalendar() {
        this.loading = true

        const classQueryParameters = {
          startDate: this.momentDay(0).format('YYYY-MM-DD'),
          endDate: this.momentDay(6).format('YYYY-MM-DD'),
          populate: [
            'teachers',
            'class_type',
            'class_type.image',
            'teachers.image',
            'signup_count',
            'room',
            'room.branch',
            'capacity_text',
            'user_can_sign_up_for_class',
            'user_can_sign_off_from_class',
            'class_signoff_warning',
            'class_signoff_deadline_timestamp',
            'user_must_receive_warning_after_signoff_deadline',
            'user_is_signed_up_for_waiting_list',
            'user_can_sign_up_for_waiting_list',
            'user_can_sign_off_from_waiting_list',
            'user_number_on_waiting_list',
            'waiting_list_text',
            'user_can_sign_up_for_livestream',
            'user_can_sign_off_from_livestream',
            'user_can_start_livestream',
            'livestream_link',
            'user_primary_action',
          ],
          teacher: this.filterByTeacher ? this.filterByTeacher : undefined,
          class_type: this.filterByClassType ? this.filterByClassType : undefined,
          sessionType: this.filterBySessionType ? this.filterBySessionType : undefined,
          branch: this.filterByBranch ? this.filterByBranch : undefined,
        }


        let classResponse

        [classResponse, this.eventTimeSlots] = await Promise.all(
          [
            YogoApi.get('/classes?' + qs.stringify(classQueryParameters)),
            YogoApi.get('/event-time-slots' +
              '?startDate=' + this.momentDay(0).format('YYYY-MM-DD') +
              '&endDate=' + this.momentDay(6).format('YYYY-MM-DD') +
              '&populate[]=event' +
              '&populate[]=event.image' +
              '&populate[]=event.teachers' +
              '&populate[]=event.event_group' +
              '&populate[]=event.teachers.image' +
              '&populate[]=event.room' +
              '&populate[]=event.room.branch' +
              '&populate[]=event.signup_count' +
              '&populate[]=user_can_sign_up_for_event' +
              '&populate[]=user_can_sign_off_from_event' +
              '&onlyEventsVisibleInCalendar=1' +
              (parseInt(this.filterByTeacher) ? ('&teacher=' + this.filterByTeacher) : '') +
              (parseInt(this.filterByBranch) ? '&branch=' + this.filterByBranch : ''),
            ),
          ],
        )

        this.classes = classResponse.classes
        this.loading = false

        if (this.adjustCalendarItemHeights) {
          this.$nextTick(this.adjustCalendarItemHeights)
        }
      },

      async signUpForClass(classItem) {
        this.$refs.classSignupComponent.$emit('signUpForClass', classItem)
      },

      async signUpForLivestream(classItem) {
        this.$refs.classSignupComponent.$emit('signUpForLivestream', classItem)
      },

      async signUpForWaitingList(classItem) {
        this.$refs.classSignupComponent.$emit('signUpForWaitingList', classItem)
      },


      signOffFromClass(signup) {
        this.$refs.classSignupComponent.$emit('signOffFromClass', signup)
      },

      signUpForEvent(event) {
        this.$refs.eventSignupComponent.$emit('signUpForEvent', event)
      },


      combinedClassesAndEventsForDay(dayIndex) {

        let calendarItems

        switch (this.client.settings.calendar_show_classes_and_events_separately_or_together) {
          case 'together':
            calendarItems = this.classesForDay(dayIndex).concat(this.eventTimeSlotsForDay(dayIndex))
            break
          case 'separately':
            switch (this.filterBySessionType) {
              case 'event':
                calendarItems = this.eventTimeSlotsForDay(dayIndex)
                break

              case 'group':
              case 'private':
                calendarItems = this.classesForDay(dayIndex)
                break
            }
            break
        }

        calendarItems = _sortBy(
          calendarItems,
          'start_time',
        )

        if (this.adjustOverlappingCalendarItems) {
          calendarItems = this.adjustOverlappingCalendarItems(calendarItems)
        }

        return calendarItems

      },

      classesForDay(dayIndex) {
        const momentDay = this.momentDay(dayIndex)
        let classes = _filter(this.classes, (classItem) => {
          return classItem.date === momentDay.format('YYYY-MM-DD')
        })

        classes = _map(classes, classItem => {
          classItem.branchName = _get(classItem, 'room.branch.name')
          return classItem
        })

        return classes

      },
      eventTimeSlotsForDay(dayIndex) {
        const momentDay = this.momentDay(dayIndex)
        let eventTimeSlots = _filter(this.eventTimeSlots, (eventTimeSlot) => {
          return moment(eventTimeSlot.date).format('YYYY-MM-DD') === momentDay.format('YYYY-MM-DD')
        })

        eventTimeSlots = _map(eventTimeSlots, eventTimeSlot => {
          eventTimeSlot.branchName = _get(eventTimeSlot, 'event.room.branch.name')
          return eventTimeSlot
        })

        return eventTimeSlots
      },

      onCalendarItemClick(calendarItem) {
        if (calendarItem.class_type) {
          this.onClassClick(calendarItem)
        } else {
          this.onEventTimeSlotClick(calendarItem)
        }
      },

      onClassClick(classItem) {
        this.dialogClass = classItem
        this.showClassDialog = true
      },

      onEventTimeSlotClick(eventTimeSlot) {
        this.dialogEventTimeSlot = eventTimeSlot
        this.showEventDialog = true
      },

      startLivestream(classItem) {
        this.$router.push({name: 'LivestreamClass', params: {classId: classItem.id}})
      },

      moment: moment,
      dbTimeToHumanTime(dbTime) {
        return dbTime.substring(0, 5)
      },

    },

  }

</script>
