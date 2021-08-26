<template>
  <div></div>
</template>

<script>

  import moment from 'moment-timezone';
  import _assign from 'lodash/assign';
  import _isInteger from 'lodash/isInteger';
  import {mapGetters} from 'vuex';

  const FORMAT = {
    HUMAN_DATE: 'D. MMM. YYYY',
    HUMAN_DATE_TIME: 'D. MMM. YYYY [kl.] HH:mm',
    HUMAN_SHORT_WEEKDAY_DATE: 'ddd D. MMM. YYYY',
    HUMAN_SHORT_WEEKDAY_DATE_TIME: 'ddd D. MMM. YYYY [kl.] HH:mm'
  }

  export default {
    computed: {
      ...mapGetters('appSettings', [
        'locale',
      ]),
    },
    methods: {
      timeStampToHumanDate(timestamp) {
        return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
          .format(FORMAT.HUMAN_DATE)
      },
      timeStampToHumanDateTime(timestamp) {
        return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
          .format(FORMAT.HUMAN_DATE_TIME)
      },
      timeStampToHumanShortWeekdayDateTime(timestamp) {
        return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
          .format(FORMAT.HUMAN_SHORT_WEEKDAY_DATE_TIME)
      },
      timeStampToHumanShortWeekdayDate(timestamp) {
        return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
            .format(FORMAT.HUMAN_SHORT_WEEKDAY_DATE)
      },
      dbDateToHumanDate(dbDate) {
        return moment.tz(dbDate, 'YYYY-MM-DD', 'Europe/Copenhagen')
          .format(FORMAT.HUMAN_DATE)
      },
      unknownFormatDateToHumanDate(date) {
        return moment.tz(date, 'Europe/Copenhagen')
          .format(FORMAT.HUMAN_DATE)
      },
      dbDateToHumanShortWeekdayDate(dbDate) {
        return moment.tz(dbDate, 'YYYY-MM-DD', 'Europe/Copenhagen')
          .format(FORMAT.HUMAN_SHORT_WEEKDAY_DATE)
      },
      iso8601ToHumanDateTime(iso8601Date) {
        return moment(iso8601Date).tz('Europe/Copenhagen').format(FORMAT.HUMAN_DATE_TIME)
      },
      formatDate(date, options) {
        console.log('date:', date);
        if (moment.isDate(date) || moment.isMoment(date)) {
          date = moment(date)
              .tz('Europe/Copenhagen');

        } else if (moment(date, moment.ISO_8601)
            .isValid()) {
          date = moment(date, moment.ISO_8601)
              .tz('Europe/Copenhagen');

        } else if (_isInteger(date)) {
          date = moment.tz(date, 'x', 'Europe/Copenhagen');

        } else if (date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
          date = moment.tz(date, 'Europe/Copenhagen');

        } else if (date.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d$/)) {
          date = moment.tz(date, 'YYYY-MM-DD HH:mm', 'Europe/Copenhagen');

        } else if (date.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/)) {
          date = moment.tz(date, 'YYYY-MM-DD HH:mm:ss', 'Europe/Copenhagen');

        }

        options = _assign({
          weekday: false,
          year: true,
          month: 'long',
          time: false,
          capitalize: false,
        }, options);

        let formatString = '';
        switch (this.locale) {
          case 'da':
            if (options.weekday === 'long' || options.weekday === true) {
              formatString += 'dddd [d.] ';
            } else if (options.weekday === 'short') {
              formatString += 'ddd. [d.] ';
            }
            formatString += 'D. ';
            if (options.month === 'long' || options.month === true) {
              formatString += 'MMMM';
            } else if (options.month === 'short') {
              formatString += 'MMM.';
            }
            if (options.year) {
              formatString += ' YYYY';
            }
            if (options.time) {
              formatString += ' [kl.] HH:mm';
            }
            break;
          case 'en':
            if (options.weekday === 'long' || options.weekday === true) {
              formatString += 'dddd, ';
            } else if (options.weekday === 'short') {
              formatString += 'ddd, ';
            }
            if (options.month === 'long' || options.month === true) {
              formatString += 'MMMM';
            } else if (options.month === 'short') {
              formatString += 'MMM.';
            }
            formatString += ' D';
            if (options.year) {
              formatString += ', YYYY';
            }
            if (options.time) {
              formatString += ', HH:mm';
            }
            break;
        }

        let formattedDate = date.format(formatString);

        if (options.weekday && options.capitalize) {
          formattedDate = formattedDate.charAt(0)
              .toUpperCase() + formattedDate.slice(1);
        }
        return formattedDate;
      },
    },
  }

</script>
