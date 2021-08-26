import _find from 'lodash/find';

import moment from 'moment';

export default {

  isSignedUpForEvent(event, eventSignups) {
    if (arguments.length !== 2) throw 'isSignedUpForEvent needs exactly 2 parameters';
    if (!eventSignups) return false;
    return !!_find(eventSignups, signup => parseInt(signup.event) === parseInt(event.id))
  },
  eventIsFullyBooked(event) {
    if (arguments.length !== 1) throw 'eventIsFullyBooked needs exactly 1 parameter';
    return event.signup_count >= event.seats
  },
  eventHasStarted(event) {
    if (arguments.length !== 1) throw 'eventHasStarted needs exactly 1 parameter';
    return moment().isSameOrAfter(moment(event.start_date, 'YYYY-MM-DD'), 'day');
  },
  canSignUpForEvent(event, eventSignups) {
    if (arguments.length !== 2) throw 'canSignUpForEvent needs exactly 2 parameters';
    return !this.eventIsFullyBooked(event) && !this.eventHasStarted(event) && !this.isSignedUpForEvent(event, eventSignups)
  },

  canSignOffFromEvent(event, eventSignups) {
    if (arguments.length !== 2) throw 'canSignOffFromEvent needs exactly 2 parameters';
    return !this.eventHasStarted(event) && parseInt(event.price) === 0 && this.isSignedUpForEvent(event, eventSignups);
  },

};
