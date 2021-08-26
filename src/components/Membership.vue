<template>
  <div :class="{ 'wrapper' : !mobileAppMode }">

    <div class="theme--frame-box">

      <loadingspinner v-if="loading"></loadingspinner>

      <div v-else>

        <router-link v-if="mobileAppMode" :to="{ name: 'MyProfile' }" class="flex aic">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class="feather feather-arrow-left">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span class="pl-1">
          {{ $t('global.back') }}
        </span>
        </router-link>

        <h4>{{ $t('membership.membership') }}:</h4>
        <h1>
          {{ membershipTitle }}
          <span v-if="membership.current_membership_pause">
            ({{ $t('membership.Paused') }}
            {{ formatDate(membership.current_membership_pause.start_date) }}
            - {{ membership.current_membership_pause.end_date ? formatDate(membership.current_membership_pause.end_date) : '?' }})
          </span>
        </h1>
        <h3 v-if="membership.discount_code">{{ $t('checkout.discountCode') }}:
          {{ membership.discount_code.name }}</h3>

        <div class="space8"></div>
        <div class="space8"></div>

        <div class="flex__1-2" v-if="membership.upcoming_membership_pause">
          <h2>{{ $t('membership.ScheduledMembershipPause') }}</h2>
          <md-table>
            <md-table-row>
              <md-table-head>{{ $t('global.Start') }}</md-table-head>
              <md-table-head>{{ $t('global.End') }}</md-table-head>
              <!--<md-table-head>&nbsp;</md-table-head>-->
            </md-table-row>
            <md-table-row>
              <md-table-cell>
                {{ formatDate(membership.upcoming_membership_pause.start_date) }}
              </md-table-cell>
              <md-table-cell>
                {{
                  membership.upcoming_membership_pause.end_date ? formatDate(membership.upcoming_membership_pause.end_date) : '--'
                }}
              </md-table-cell>
              <!--<md-table-cell>
                <button class="btn btn-primary" @click="cancelUpcomingMembershipPause">{{ $t('membership.Cancel__MembershipPause') }}</button>
              </md-table-cell>-->
            </md-table-row>
          </md-table>
          <div class="space8"></div>
        </div>

        <div class="flex--row space--between align__items--start">

          <div class="flex__1-2" v-if="membership.next_payment">
            <h2>{{ $t('global.nextPayment') }}</h2>
            <md-table>
              <md-table-row>
                <md-table-head>{{ $t('global.date') }}</md-table-head>
                <md-table-head>{{ $t('global.amount') }}</md-table-head>
              </md-table-row>
              <md-table-row>
                <md-table-cell>{{
                    membership.next_payment.date ? formatDate(membership.next_payment.date) : '--'
                  }}
                </md-table-cell>
                <md-table-cell>{{ membership.next_payment.amount | currency_dkk }} kr
                </md-table-cell>
              </md-table-row>
            </md-table>
          </div>

          <div class="flex__1-2" v-if="membership.status === 'cancelled_running'">
            <p>{{ $t('membership.membershipCancelledAndStopsBy') }}
              {{ membership.cancelled_from_date_including_membership_pause | moment('D. MMMM YYYY') }} </p>
            <button type="button" class="btn btn-primary" @click="resumeMembershipClick">
              {{ $t('membership.resubmitMembership') }}
            </button>
          </div>

          <div class="flex__1-2" v-if="membership.status === 'active'">
            <h2>{{ $t('membership.paymentPeriod') }}</h2>
            <br/>
            <p class="bold">{{ membership.payment_option.name }}</p>
          </div>

        </div>

        <div class="space8"></div>

        <div v-if="membership.pending_no_show_fees.length">
          <h2>{{ $t('global.PendingNoShowFees') }}</h2>
          <div v-if="showNextPayment()" class="mt-2">
            {{ $t('global.FeesWillBeChargedWithNextPayment') }}
          </div>
          <md-table v-model="membership.pending_no_show_fees">
            <md-table-row slot="md-table-row" slot-scope="{ item }"
                          :key="'pending_no_show_fee_'+ item.id">
              <md-table-cell :md-label="$t('global.Date')">{{
                  formatDate(item.class.date)
                }}
              </md-table-cell>
              <md-table-cell :md-label="$t('global.Time')">{{
                  item.class.start_time.substr(0, 5)
                }}
              </md-table-cell>
              <md-table-cell :md-label="$t('global.Class')">{{ item.class.class_type.name }} kr
              </md-table-cell>
              <md-table-cell :md-label="$t('global.Reason')">
                {{ $t('global.NoShowReason_' + item.reason) }}
              </md-table-cell>
              <md-table-cell :md-label="$t('global.Amount')" md-numeric>
                {{ item.amount | currency_dkk }}
              </md-table-cell>
            </md-table-row>
          </md-table>
        </div>

        <div class="space8"></div>

        <div class="" v-if="showNextPayment()">
          <h2>{{ $t('profile.paymentInfo') }}</h2>
          <h3 v-if="membership.renewal_failed" class="auto-renewal-failed red">
            {{ $t('membership.autoRenewalFailed') }}
          </h3>
          <md-field v-if="activeSubscription">
            <div class="flex--row space--between">
              {{
                getPayType(activeSubscription.pay_type)
              }}: {{
                activeSubscription.card_prefix.substr(0,
                    4) + ' ' + activeSubscription.card_prefix.substr(4, 2)
              }}xx
              xxxx {{
                activeSubscription.card_last_4_digits
              }}
            </div>
          </md-field>
          <p v-else>
            {{ $t('membership.noCreditCardAttached') }}
          </p>
          <button class="btn btn-primary margin__bottom--10"
                  @click="startChangeCreditCard">
            {{
              activeSubscription ? (membership.renewal_failed ? $t(
                  'profile.editCreditCardAndRetryPaymentLabel') : $t('profile.editCreditCardLabel'))
                  : $t('profile.addCreditCardLabel')
            }}
          </button>
          <button md-primary class="btn btn-primary margin__bottom--10"
                  v-if="membership.renewal_failed"
                  @click="retryPaymentWithCurrentPaymentMethod"
          >
            {{ $t('profile.retryPaymentWithCurrentPaymentMethodLabel') }}
          </button>
        </div>

        <div class="space8"></div>

        <div v-if="membership.orders.length">

          <h2>{{ $t('membership.previousPayments') }}</h2>
          <md-table v-model="membership.orders">
            <md-table-row slot="md-table-row" slot-scope="{ item }" :key="item.id">
              <md-table-cell md-label="Fakturanummer">{{ item.invoice_id }}</md-table-cell>
              <md-table-cell md-label="Dato">{{
                  moment(item.createdAt).format('D. MMMM YYYY')
                }}
              </md-table-cell>
              <md-table-cell md-label="Beløb" md-numeric>{{ item.total | currency_dkk }} kr
              </md-table-cell>
              <md-table-cell md-label="Status">{{ getOrderStatusText(item) }}</md-table-cell>
              <md-table-cell>
                <a href="#" v-if="item.payment_failed">{{ $t('global.payNow') }}</a>
                <a :href="getReceiptLink(item)" v-else-if="item.paid" target="_blank">{{
                    $t('membership.downloadReceipt')
                  }}</a>
              </md-table-cell>
            </md-table-row>
          </md-table>

        </div>

        <div class="line"></div>

        <div class="space8"></div>

        <button
            type="button"
            class="btn btn-primary"
            @click="stopMembershipClick"
            v-if="membership.status === 'active' && client.settings.customer_can_cancel_membership">
          {{ $t('membership.stopMembership') }}
        </button>

        <!--<button
            type="button"
            class="btn btn-primary"
            @click="pauseMembershipClick"
            v-if="showPauseMembershipButton">
          {{ $t('membership.PauseMembership') }}
        </button>-->

      </div>
    </div>

    <div class="space8"></div>
    <div class="space8"></div>
    <div class="space8"></div>

    <Alert :show.sync="showAlertDialog" :alert-text="alertDialogText"/>

    <md-snackbar :md-duration="4000" :md-active.sync="showSnackbar">
      {{ snackbarText }}
    </md-snackbar>

  </div>
</template>

<script>

import Loadingspinner from "./LoadingSpinner.vue";
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import moment from 'moment';
import avatar from '@/assets/img/account.svg';
import dateTimeFunctions from '../mixins/dateTimeFunctions';
import Alert from '@/components/Alert';

export default {
  name: 'membership',
  components: {
    Alert,
    Loadingspinner,
  },
  mixins: [dateTimeFunctions],
  data() {
    return {
      myMembership: 'Mit medlemskab',
      membershipTypeLabel: 'Medlemskabstype',
      membershipPaymentLabel: 'Betaling',
      dateLabel: 'Dato',
      paymentInfo: 'Betalingskort',
      editCreditCardLabel: 'Skift betalingskort',
      addCreditCardLabel: 'Tilføj betalingskort',
      editCreditCardAndRetryPaymentLabel: 'Skift betalingskort og gennemfør betaling',
      retryPaymentWithCurrentPaymentMethodLabel: 'Forsøg betalingen igen med dette betalingskort',
      updateMembership: 'Opdater medlemskab',
      memmbershipType: '',

      loading: true,

      membership: {},
      selectedPaymentOption: null,

      showAlertDialog: false,
      alertDialogText: '',

      showMembershipRealUserDialog: false,
      membershipRealUserDialogName: '',
      membershipRealUserDialogImage: null,

      reepayWindow: null,

      snackbarText: '',
      showSnackbar: false,

    };
  },
  computed: {
    ...mapGetters([
      'client',
      'user',
      'cartItems',
      'stateReady',
      'envConfig',
      'apiRoot',
      'membershipFlashMessage',
      'mobileAppMode',
    ]),
    activeSubscription() {
      if (!this.membership) return null;

      let activePaymentSubscriptions = _filter(this.membership.payment_subscriptions,
          paymentSubscription => paymentSubscription.status === 'active');

      if (!activePaymentSubscriptions.length) {
        return null;
      }

      if (!activePaymentSubscriptions.length > 1) {
        throw Error('Too many active subscription');
      }

      return activePaymentSubscriptions[0];
    },
    currentOrUpcomingMembershipPause() {
      return this.membership.current_membership_pause
          || this.membership.upcoming_membership_pause;
    },
    showPauseMembershipButton() {
      return this.membership
          && this.membership.status === 'active'
          && this.client.settings.customer_can_pause_membership
          && !this.currentOrUpcomingMembershipPause;
    },
    membershipTitle() {
      let title = this.membership.membership_type.name;
      if (this.membership.membership_campaign && this.membership.membership_campaign_number_of_reduced_payments_left > 0) {
        title += ', ' + this.membership.membership_campaign.name;
      }
      return title;
    },
  },
  mounted() {
    if (this.stateReady) this.getMembership();
    if (this.membershipFlashMessage) {
      console.log('Show membership flash message');
      this.alertDialogText = {
        updated: this.$t('membership.paymentCardUpdated'),
        failed: this.$t('membership.paymentUpdateCancelled'),
      }[this.membershipFlashMessage.type];
      this.showAlertDialog = true;
      this.$store.commit('setMembershipFlashMessage', null);
    }
  },
  methods: {
    async getMembership() {

      const membership = await YogoApi.get('/memberships?id=' + this.$route.params.id +
          '&populate[]=payment_option' +
          '&populate[]=membership_type' +
          '&populate[]=membership_type.payment_options' +
          '&populate[]=payment_subscriptions' +
          '&populate[]=payment_subscriptions.payment_subscription_transactions' +
          '&populate[]=orders' +
          '&populate[]=membership_campaign' +
          '&populate[]=discount_code' +
          '&populate[]=next_payment' +
          '&populate[]=pending_no_show_fees' +
          '&populate[]=pending_no_show_fees.class' +
          '&populate[]=pending_no_show_fees.class.class_type' +
          '&populate[]=current_membership_pause' +
          '&populate[]=upcoming_membership_pause' +
          '&populate[]=customer_can_pause_membership' +
          '&populate[]=cancelled_from_date_including_membership_pause',
      );

      this.membership = membership;

      if (membership.payment_option) {
        this.selectedPaymentOption = membership.payment_option.id;
      }

      this.membership.orders = _sortBy(this.membership.orders, order => -order.invoice_id);

      if (this.membership.real_user_is_someone_else) {
        this.membershipRealUserDialogImage = this.membership.real_user_image ? this.membership.real_user_image.id : null;
        this.membershipRealUserDialogName = this.membership.real_user_name;
      }

      this.loading = false;


    },
    getPayType(payType) {

      const payTypes = {
        'V-DK': 'Visa/Dankort',
        'MC': 'Eurocard/Mastercard',
        'MC(DK)': 'Eurocard/Mastercard (DK)',
        'MC(SE)': 'Eurocard/Mastercard (SE)',
        'DIN': 'Diners Club',
        'DIN(DK)': 'Diners Club (DK)',
        'AMEX': 'American Express',
        'AMEX(DK)': 'American Express (DK)',
        'MTRO': 'Maestro',
        'MTRO(DK)': 'Maestro(DK)',
        'ELEC': 'VISA Electron',
        'FFK': 'Forbrugsforeningen',
      };
      if (payTypes[payType]) return payTypes[payType];

      return payType;

    },

    showNextPayment() {
      if (this.membership.status === 'active') return true;
      if (this.membership.status === 'cancelled_running') {

        if (this.membership.payment_option.number_of_months_payment_covers > 1) return false;

        // Show next payment if "paid_until" is more than one day before "cancelled_from"
        return moment(this.membership.cancelled_from_date).isAfter(
            moment(this.membership.paid_until).add(1, 'day'),
        );

      }

      return false;
    },

    getOrderStatusText(order) {
      if (order.payment_failed) {
        return this.$t('global.declined');
      } else if (order.paid) {
        return this.$t('global.paid');
      } else {
        return this.$t('global.awaitingPayment');
      }
    },

    async stopMembershipClick() {
      if (this.membership.current_membership_pause)  {
        alert(this.$t('membership.YourMembershipIsAlreadyPausedPleaseContactTheStudio'));
        return;
      }
      if (this.membership.upcoming_membership_pause)  {
        alert(this.$t('membership.ThereIsAlreadyAScheduledMembershipPausePleaseContactTheStudio'));
        return;
      }

      let confirmText;
      if (this.membership.payment_option.number_of_months_payment_covers === 1) {
        confirmText = this.$t('membership.stopMembershipWithNoticeText', {
          nextPaymentDate: this.formatDate(moment(this.membership.paid_until).add(1, 'day')),
          lastMembershipDate: this.formatDate(
              moment.tz(this.membership.paid_until,'Europe/Copenhagen').add(1, 'day').add(1, 'month').subtract(1, 'day')
          ),
        });
      } else {
        confirmText = this.$t('membership.stopMembershipWithoutNoticeText', {
          lastMembershipDate: this.formatDate(moment.tz(this.membership.paid_until, 'YYYY-MM-DD')),
        });
      }

      if (!confirm(confirmText)) return;

      this.loading = true;
      await YogoApi.put('/memberships/' + this.$route.params.id, {
        status: 'cancelled_running',
      });
      this.getMembership();
    },
    async resumeMembershipClick() {
      if (!confirm(this.$t('membership.wouldYouLikeToResumeTheMembership'))) return;
      this.loading = true;
      await YogoApi.put('/memberships/' + this.$route.params.id, {
        status: 'active',
      });
      this.getMembership();
    },
    async pauseMembershipClick() {
      if (!this.membership.customer_can_pause_membership) {
        this.alertDialogText = this.$t(
            'membership.YouCanOnlyPauseYourMembershipNTimesInAYear',
            { times: this.client.settings.membership_pause_max_count_per_running_year },
        );
        this.showAlertDialog = true;
        return;
      }
    },
    async startChangeCreditCard() {
      switch (this.client.settings.payment_service_provider) {
        case 'reepay': {
          const recurringSession = await YogoApi.post(
              '/payments/reepay/create-recurring-session');
          this.reepayWindow = new window.Reepay.ModalCheckout(recurringSession.id);

          this.reepayWindow.addEventHandler(window.Reepay.Event.Accept, async data => {
            console.log('data:', data);
            await YogoApi.post('/payments/reepay/attach-card-to-membership', {
              cardId: data.payment_method,
              membership: this.membership.id,
            });
            if (this.membership.renewal_failed) {
              await this.retryPaymentWithCurrentPaymentMethod();
            }
            await this.getMembership();
          });

          this.reepayWindow.addEventHandler(window.Reepay.Event.Error, () => {
          });
          this.reepayWindow.addEventHandler(window.Reepay.Event.Cancel, () => {
          });
          this.reepayWindow.addEventHandler(window.Reepay.Event.Close, async () => {
            await this.$store.dispatch('updateUser');
          });
        }
      }

    },

    async retryPaymentWithCurrentPaymentMethod() {
      this.loading = true;
      const response = await YogoApi.post('/memberships/' + this.$route.params.id + '/retry-failed-subscription-payment');
      if (response === 'E_MEMBERSHIP_DOES_NOT_NEED_PAYMENT') {
        // Local data might be outdated. Reload.
        alert(this.$t('membership.upToDate'));
        this.getMembership();
        return;
      }
      if (response === 'E_PAYMENT_FAILED') {
        this.loading = false;
        alert(this.$t('global.paymentDeclined'));
        this.getMembership();
        return;
      }
      alert(this.$t('global.paymentSuccess'));
      this.getMembership();
    },
    async cancelUpcomingMembershipPause() {
      if (!confirm(this.$t('membership.WouldYouLikeToCancelTheUpcomingMembershipPause?'))) {
        return;
      }
      this.loading = true;
      await YogoApi.delete(`/membership-pauses/${this.membership.upcoming_membership_pause.id}`);
      this.getMembership();
      this.snackbarText = this.t('membership.MembershipPauseCancelled');
      this.showSnackbar = true;
    },
    getReceiptLink(order) {
      return this.apiRoot + '/orders/' + order.id + '/pdf-receipt?receiptToken=' + order.receipt_token;
    },
    moment: moment,
    avatar() {
      return avatar;
    },
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.getMemberships();
    },
  },
};
</script>

<style>


</style>
