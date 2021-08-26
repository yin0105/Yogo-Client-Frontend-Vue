<template>
  <div class="theme--frame-box">
    <h2>{{ $t('profile.myPurchases') }}</h2>
    <md-table>
      <md-table-row>
        <md-table-head>{{ $t('global.date') }}</md-table-head>
        <md-table-head>{{ $t('global.amount') }}</md-table-head>
        <md-table-head>{{ $t('global.invoice') }}</md-table-head>
      </md-table-row>
      <tr v-for="invoice in displayInvoices" :key="'invoice_' + invoice.id">
        <md-table-cell>{{ timeStampToHumanDate(invoice.paid) }}</md-table-cell>
        <md-table-cell>{{ invoice.total | currency_dkk }} kr</md-table-cell>
        <md-table-cell><a :href="getReceiptLink(invoice)" target="_blank">{{ $t('global.Download') }}</a></md-table-cell>
      </tr>
    </md-table>
    <div class="space4" v-if="invoices.length > 3"></div>
    <router-link v-if="invoices.length > 3" :to="{name: 'PurchaseHistory'}">{{
        $t('global.seeAll')
      }}
    </router-link>
  </div>
</template>

<script>
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';

import { mapGetters } from 'vuex';
import dateTimeFunctions from '../mixins/dateTimeFunctions';

export default {
  name: 'MyPurchases',
  props: ['invoices'],
  mixins: [dateTimeFunctions],
  computed: {
    ...mapGetters([
      'client',
      'apiRoot',
    ]),
    displayInvoices() {
      return _reverse(_sortBy(this.invoices, 'invoice_id')).slice(0, 3);
    },
  },
  methods: {
    getReceiptLink(order) {
      return this.apiRoot + '/orders/' + order.id + '/pdf-receipt?receiptToken=' + order.receipt_token;
    },
  },
};
</script>


<style lang="scss">

table {
  td:first-of-type .md-table-cell-container,
  th:first-of-type .md-table-head-label {
    padding-left: 0;
  }
}

</style>
