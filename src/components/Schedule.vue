<template>
  <div class="schedule wrapper">
    <div class="theme--frame-box">
      <div class="flex--row-reverse space--between flex--start mb60-sm wrap">

        <md-field class="flex--1-3 mr10-md mr20-lg o1" v-if="client.branches && client.branches.length > 1">
          <label>{{ $t('global.branch') }}</label>
          <md-select v-model="filterByBranch">
            <md-option value="0">- - {{ $t('global.branchesAll') }} - -</md-option>
            <md-option v-for="branch in client.branches" :value="branch.id" :key="'branch_' + branch.id">
              {{ branch.name }}
            </md-option>
          </md-select>
        </md-field>

        <a v-if="client.settings.calendar_show_teacher_filter || client.settings.show_class_filter" class="underline fr mb2" @click="toggle">{{ $t('global.filters') }}</a>
      </div>

      <slide-up-down :active="filtersVisible" :duration="500" ref="filterAnimateDown">

        <div class="flex--row">

          <md-field v-if="client.settings.calendar_show_teacher_filter" class="flex--1-3 mr10-md mr20-lg">
            <label>{{ $t('global.teacher') }}</label>
            <md-select v-model="filterByTeacher">
              <md-option :value="0">- - {{ $t('global.teachersAll') }} - -</md-option>
              <md-option v-for="teacher in teachers" :value="teacher.id" :key="teacher.id">{{ teacher.first_name + ' ' +
                teacher.last_name }}
              </md-option>
            </md-select>
          </md-field>

          <md-field v-if="client.settings.calendar_show_classtype_filter" class="flex--1-3" :style="{visibility: filterBySessionType === 'event' ? 'hidden' : 'visible'}">
            <label>{{ $t('global.classType') }}</label>
            <md-select v-model="filterByClassType">
              <md-option :value="0">- - {{ $t('global.classTypesAll') }} - -</md-option>
              <md-option v-for="classType in classTypes" :value="classType.id" :key="classType.id">{{ classType.name }}
              </md-option>
            </md-select>
          </md-field>

        </div>

      </slide-up-down>

      <div class="clear"></div>

      <div class="flex--row space--between flex--start fc-sm aic">

        <div class="padding--none o1-sm date-picker">
          <md-datepicker
              v-model="datePickerDate"
              :md-disabled-dates="datepickerDateIsDisabled"
              class="not-clearable"
              md-immediately/>
        </div>

        <span class="flex__align-center space--between calendar__week--nav o0-sm">
          <md-button class="md-icon-button" @click.prevent="gotoPreviousWeek" :disabled="!canGoBack">
            <span class="icon-arrowleft"></span>
          </md-button>
          {{ $t('calendar.week') }} {{ weekNumber }}
          <md-button class="md-icon-button" @click.prevent="gotoNextWeek">
            <span class="icon-arrowright"></span>
          </md-button>
        </span>

        <div v-if="client.settings.calendar_show_classes_and_events_separately_or_together  === 'separately'" class="flex--row o1-sm wrap">

          <RadioButtons
            id="filterBySessionType"
            v-model="filterBySessionType"
            :options="group_options"
          >
          </RadioButtons>

        </div>

      </div>


      <ScheduleList
        v-if="client.settings.calendar_layout_type === 'list'"
        :filterBySessionType="client.settings.calendar_show_classes_and_events_separately_or_together === 'together' ? null : filterBySessionType"
        :date="calendarDate"
        :filterByTeacher="filterByTeacher"
        :filterByClassType="filterByClassType"
        :filterByBranch="filterByBranch"
        >
      </ScheduleList>

      <ScheduleTimetable
        v-else-if="client.settings.calendar_layout_type === 'timetable'"
        :date="calendarDate"
        :filterBySessionType="client.settings.calendar_show_classes_and_events_separately_or_together === 'together' ? null : filterBySessionType"
        :filterByTeacher="filterByTeacher"
        :filterByClassType="filterByClassType"
        :filterByBranch="filterByBranch"
      >
      </ScheduleTimetable>

      <div class="space8"></div>

    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import moment from 'moment'
  import ScheduleTimetable from './schedule/ScheduleTimetable'
  import ScheduleList from './schedule/ScheduleList'
  import RadioButtons from './RadioButtons'
  import YogoApi from '../gateways/YogoApi'
  import SlideUpDown from 'vue-slide-up-down'

  export default {
    components: {
      ScheduleTimetable,
      ScheduleList,
      SlideUpDown,
      RadioButtons
    },

    data() {
      return {
        dateLabel: 'dato',
        privateSessionsLabel: 'Privattimer',
        groupSessionsLabel: 'Hold',
        eventTimeSlotsLabel: 'Kurser',

        teacherLabel: 'Underviser',
        classTypeLabel: 'Holdtype',
        radio: 'teamlessons',
        calendarDate: new Date(),
        datePickerDate: new Date(),
        earliestAllowedMonday: moment().startOf('isoWeek').startOf('day'),

        filterByTeacher: 0,
        filterByClassType: 0,
        teachers: [],
        classTypes: [],
        filtersVisible: false,

        filterBySessionType: 'group',

        group_options: [
          {
            value: 'group',
            text: this.$t('calendar.classes'),
          },
          {
            value: 'private',
            text: this.$t('calendar.privateSessions'),

          },
          {
            value: 'event',
            text: this.$t('calendar.events'),
          },
        ]

      }
    },
    computed: {
      ...mapGetters('calendarFilters', {
        filters: 'all'
      }),
      ...mapGetters([
        'client'
      ]),
      filterByBranch: {
        get() {
          return this.client.branches.length > 1 ? this.filters.branch : null;
        },
        set(value) {
          this.setFilter({ key: 'branch', value })
        }
      },
      weekNumber() {
        return moment(this.calendarDate).format('W')
      },
      canGoBack() {
        return moment(this.calendarDate).startOf('isoWeek').startOf('day').isAfter(this.earliestAllowedMonday)
      },
    },
    mounted() {
      const el = this.$refs.filterAnimateDown.el
      el.addEventListener('transitionend', () => {
      })
    },
    methods: {
      ...mapActions('calendarFilters', ['setFilter']),
      toggle() {
        this.filtersVisible = !this.filtersVisible
      },
      gotoNextWeek() {
        this.calendarDate = moment(this.calendarDate).add(1, 'week')
      },
      gotoPreviousWeek() {
        this.calendarDate = moment(this.calendarDate).subtract(1, 'week')
      },
      datepickerDateIsDisabled(date) {
        return moment(date).isBefore(moment().startOf('isoWeek'), 'day')
      },
    },
    async created() {
      [this.teachers, this.classTypes] = await Promise.all([
        YogoApi.get(
          '/users' +
          '?teacher=1' +
          '&hasClassesOrEventTimeSlotsFromDateForward=' + moment().startOf('isoWeek').format('YYYY-MM-DD'),
        ),
        YogoApi.get(
          '/class-types' +
          '?hasClassesFromDateForward=' + moment().startOf('isoWeek').format('YYYY-MM-DD'),
        ),
      ])
    },
    watch: {
      datePickerDate(newDate) {
        if (moment(newDate).unix() !== moment(this.calendarDate).unix()) {
          this.calendarDate = moment(newDate)
        }

      },
      calendarDate(newDate) {
        if (moment(newDate).unix() !== moment(this.datePickerDate).unix()) {
          this.datePickerDate = moment(newDate).toDate()
        }
      },
    },
  }
</script>

<style lang="scss">

  .date-picker {
    .md-field:after {
      height: 0;
    }
    @media (max-width: 768px) {
      width: 140px !important;
    }
  }

  .before-today {
    display: none;
   @media (min-width: 1024px) {
      display: block;
    }
  }

</style>
