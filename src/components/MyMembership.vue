<template>

  <div class="membership">
    <div class="theme--frame-box">

      <h2>{{ $t('profile.myMembershipLabel') }}</h2>
      <div class="space2"></div>
      <ul class="widget__list--standard">
        <li v-for="membership in memberships" :key="'membership_' + membership.id">
          <p class="upper">
            {{ membership.membership_type.name }} {{
              membership.payment_option ? ' (' + membership.payment_option.name +
                  ')' : ''
            }}
          </p>
          <div v-if="membership.current_or_upcoming_membership_pause">
            <div class="space2"></div>
            <p>
              <span v-if="membership.current_membership_pause">
                {{ $t('membership.Paused') }}
              </span>
              <span v-else>
                {{ $t('membership.ScheduledMembershipPause') }}:
              </span>
              {{ formatDate(membership.current_or_upcoming_membership_pause.start_date) }}
              - {{
                membership.current_or_upcoming_membership_pause.end_date
                    ? formatDate(membership.current_or_upcoming_membership_pause.end_date)
                    : '?'
              }}
            </p>
          </div>
          <div class="space2"></div>
          <div v-if="showNextPayment(membership)">
            <p>
              {{ $t('profile.renewedNextTime') }}: {{ membership.next_payment.date ? formatDate(membership.next_payment.date) : '--' }}
            </p>
            <p v-if="!membership.payment_subscriptions.length" class="red bold">
              - {{ $t('profile.paymentCardMissing') | capitalize }} -
            </p>
            <p v-else-if="membership.renewal_failed">
              - {{ $t('profile.paymentErrorPleaseUpdate') }} -
            </p>
            <div v-if="membership.pending_no_show_fees.length">
              {{ membership.pending_no_show_fees.length }}
              {{
                membership.pending_no_show_fees.length > 1 ? $t('global.pendingNoShowFees') : $t(
                    'global.pendingNoShowFee')
              }}
            </div>
          </div>

          <div v-if="membership.status === 'cancelled_running'">
            <p>
              {{ $t('profile.cancelledMembership') }} {{
                formatDate(membership.cancelled_from_date)
              }}
            </p>

          </div>

          <div class="space4"></div>

          <router-link :to="{ name: 'Membership', params:{id: membership.id }}">
            <button class="btn btn-primary">{{ $t('global.showMembership') }}</button>
          </router-link>
          <div class="space4"></div>

          <div class="space1"></div>
        </li>
      </ul>
    </div>
  </div>

</template>

<script>

import moment from 'moment';
import dateTimeFunctions from '@/mixins/dateTimeFunctions';

export default {
  name: 'MyMembership',
  mixins: [dateTimeFunctions],
  data() {
    return {
      myMembershipLabel: 'Mit medlemskab',
    };
  },

  props: [
    'memberships',
  ],
  filters: {
    nextDayFormatted(date) {
      return moment(date).add(1, 'day').format('D. MMMM YYYY');
    },
  },
  methods: {
    showNextPayment(membership) {
      if (membership.status === 'active') return true;
      if (membership.status === 'cancelled_running') {
        if (membership.payment_option.number_of_months_payment_covers > 1) return false;

        // Show next payment if "paid_until" is more than one day before "cancelled_from"
        return moment(membership.cancelled_from_date).isAfter(
            moment(membership.paid_until).add(1, 'day'),
        );

      }

      return false;
    },
  },
};
</script>


<style>


</style>
