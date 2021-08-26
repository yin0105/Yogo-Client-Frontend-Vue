<template>

  <div :class="{ 'wrapper' : !mobileAppMode }">

    <div v-if="!mobileAppMode">
      <h1>{{ $t('profile.myPurchases') }}</h1>
      <div class="space8"></div>
    </div>

    <div class="theme--frame-box">
      <loadingspinner v-if="loading"></loadingspinner>

      <router-link v-if="mobileAppMode" :to="{ name: 'MyProfile' }" class="flex aic">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="feather feather-arrow-left">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="pl-1">
          {{ $t('global.back') }}
        </span>
      </router-link>

      <md-table>
        <md-table-row>
          <md-table-head>{{ $t('global.timeAsPointInTime') }}</md-table-head>
          <md-table-head>{{ $t('global.amount') }}</md-table-head>
          <md-table-head>{{ $t('global.invoice') }}</md-table-head>
        </md-table-row>
        <tr v-for="invoice in invoices" :key="'invoice_' + invoice.id">
          <md-table-cell>{{ timeStampToHumanDateTime(invoice.paid) }}</md-table-cell>
          <md-table-cell>{{ invoice.total | currency_dkk }} kr</md-table-cell>
          <md-table-cell><a :href="getReceiptLink(invoice)" target="_blank">{{ $t('global.Download') }}</a></md-table-cell>
        </tr>
      </md-table>
    </div>

  </div>

</template>

<script>

import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';

import Loadingspinner from "./LoadingSpinner.vue";

import dateTimeFunctions from '../mixins/dateTimeFunctions';

export default {
  name: 'PurchaseHistory',
  mixins: [dateTimeFunctions],
  components: {
    Loadingspinner,
  },
  data() {
    return {
      invoices: [],
      loading: true,
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'mobileAppMode',
      'apiRoot',
    ]),
  },
  async created() {
    const user = await YogoApi.get(`/users/${this.user.id}?populate[]=invoices`);

    this.invoices = _reverse(_sortBy(user.invoices, 'invoice_id'));

    this.loading = false;

  },
  methods: {
    getReceiptLink(order) {
      return this.apiRoot + '/orders/' + order.id + '/pdf-receipt?receiptToken=' + order.receipt_token;
    },
  },
};
</script>
