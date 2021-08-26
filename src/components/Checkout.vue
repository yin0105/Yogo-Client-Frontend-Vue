<template>
  <div class="checkout" :class="{ 'wrapper' : !mobileAppMode }">

    <div v-if="!mobileAppMode">
      <h1>{{ $t('checkout.checkoutReady') }}</h1>
      <div class="space8"></div>
    </div>

    <div class="theme--frame-box">

      <loadingspinner v-if="loading"></loadingspinner>

      <div class="checkout__content--wrapper" v-else-if="this.cartItems.length">

        <md-table v-model="sortedCartItems">
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell :md-label="$t('checkout.cartItemName')">{{
                getItemTitle(item)
              }}
            </md-table-cell>
            <md-table-cell md-numeric :md-label="$t('global.price')">
              {{ getItemPrice(item) | currency_dkk }} kr
            </md-table-cell>
            <md-table-cell>
              <button type="submit" @click="deleteCartItem(item)"><span
                  class="icon-close pointer"></span>
                <md-tooltip md-direction="top">{{ $t('checkout.removeFromBasket') }}</md-tooltip>
              </button>
            </md-table-cell>
          </md-table-row>
        </md-table>

        <div class="line"></div>
        <div class="space8"></div>


        <form class="flex--row" action="" @submit="applyDiscountCode" v-if="showDiscountCodeInput">
          <div class="flex col-md-4 mr-md-4">
            <md-field>
              <label>{{ $t('checkout.DiscountCodeSlashGiftCard') }}</label>
              <md-input v-model="discountCodeInput"></md-input>
            </md-field>
          </div>
          <button class="btn btn-primary mb-btn-align" type="submit">
            {{ $t('checkout.ApplyCode') }}
          </button>
        </form>


        <div class="flex--row space--between align--top">
          <div>
            <md-checkbox v-model="termsAccepted">
              <span>
                {{ $t('checkout.iHaveReadTheTerms') }}
                <a class="underline ml-1" href="#" @click.stop.prevent="showTermsDialog = true">
                {{ $t('checkout.termsAndConditions') }}</a>*
              </span>
            </md-checkbox>

            <div>
              <md-checkbox
                  v-if="showRecurringTerms"
                  v-model="membershipTermsAccepted"
              >
                <span>
                {{ $t('checkout.iHaveReadTheTerms') }}
                <a class="underline ml-1" href="#"
                   @click.stop.prevent="showMembershipTermsDialog = true">
                  {{ $t('checkout.membershipTerms') }}</a>*
                </span>
              </md-checkbox>
            </div>
          </div>

          <div class="space4"></div>
          <h3 class="bold">Total: {{ totalPrice | currency_dkk }} kr</h3>
        </div>
        <div class="space8"></div>

        <button class="btn btn-primary" @click="pay" :disabled="!this.cartItems.length">
          {{ $t('checkout.proceedToPayment') }}
        </button>

        <div class="space6"></div>
        <div class="flex flex-wrap flex--row payment--symbols">
          <img
              v-if="client.settings.payment_show_dankort_logo"
              src="../assets/img/dankort.svg" alt=""
          />
          <img
              v-if="client.settings.payment_show_visa_mastercard_logos"
              src="../assets/img/visa.svg" alt=""
          />
          <img
              v-if="client.settings.payment_show_visa_mastercard_logos"
              src="../assets/img/visaelectron.svg" alt=""/>
          <img
              v-if="client.settings.payment_show_visa_mastercard_logos"
              src="../assets/img/mastercard.svg" alt=""
          />
          <img
              v-if="client.settings.payment_show_visa_mastercard_logos"
              src="../assets/img/maestro.svg" alt=""
          />
          <img
              v-if="client.settings.payment_show_mobilepay_logo"
              src="../assets/img/mobilepay.svg" alt=""/>
        </div>
      </div>

      <div v-else>
        {{ $t('checkout.noItemsInBasket') }}
      </div>

    </div>

    <div class="space8"></div>
    <div class="space8"></div>

    <md-dialog :md-active.sync="showTermsDialog" class="terms-dialog">
      <md-dialog-content class="terms-and-conditions">
        <h1>{{ $t('global.terms') }}</h1>
        <div v-html="client.settings.terms"></div>
      </md-dialog-content>

      <md-dialog-actions>
        <button class="btn btn-primary" @click="showTermsDialog = false">
          {{ $t('global.close') }}
        </button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showMembershipTermsDialog" class="terms-dialog">
      <md-dialog-content class="terms-and-conditions">
        <h1>{{ $t('checkout.MembershipTerms') }}</h1>
        <div v-html="client.settings.recurring_terms"></div>
      </md-dialog-content>

      <md-dialog-actions>
        <button
            class="btn btn-primary"
            @click="showMembershipTermsDialog = false"
        >
          {{ $t('global.close') }}
        </button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog-alert
        :md-active.sync="showForgotToAcceptTermsDialog"
        :md-content="$t('checkout.YouMustAcceptOurTerms')"
    >
    </md-dialog-alert>

    <md-dialog-alert
        :md-active.sync="showForgotToAcceptMembershipTermsDialog"
        :md-content="$t('checkout.YouMustAcceptOurMembershipTerms')"
    >
    </md-dialog-alert>

    <md-snackbar
        :md-position="position"
        :md-duration="isInfinity ? Infinity : duration"
        :md-active.sync="showItemDeletedSnackbar" md-persistent>
      {{ removedItemName }} {{ $t('checkout.isRemovedFromBasket') }}
    </md-snackbar>

  </div>
</template>


<script>

import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import _each from 'lodash/each';
import _find from 'lodash/find';
import _sortBy from 'lodash/sortBy';
import Loadingspinner from "./LoadingSpinner.vue";
import ReepayPaymentMixin from './ReepayPaymentMixin';

export default {
  components: { Loadingspinner },
  mixins: [ReepayPaymentMixin],
  data() {
    return {
      showTermsDialog: false,
      showMembershipTermsDialog: false,

      termsAccepted: false,
      membershipTermsAccepted: false,
      showForgotToAcceptTermsDialog: false,
      showForgotToAcceptMembershipTermsDialog: false,
      showItemDeletedSnackbar: false,
      position: 'center',
      duration: 4000,
      isInfinity: false,

      removedItemName: '',

      loading: true,

      discountCodeInput: '',

      reepayWindow: null,
    };
  },
  computed: {
    ...mapGetters([
      'client',
      'user',
      'cartItems',
      'stateReady',
      'mobileAppMode',
    ]),
    showDiscountCodeInput() {
      const discountCodeCartItem = _find(this.cartItems, ['item_type', 'discount_code']);
      return !discountCodeCartItem;
    },
    terms() {
      return this.client && this.client.terms ? this.client.terms : '';
    },

    recurring_terms() {
      return this.client && this.client.recurring_terms ? this.client.recurring_terms : '';
    },
    totalPrice() {
      let total = 0;
      _each(this.cartItems, (cartItem) => {
        total += parseFloat(this.getItemPrice(cartItem));
      });

      return total;
    },
    sortedCartItems() {
      return _sortBy(
          this.cartItems,
          [cartItem => {
            const itemTypeSortOrders = {
              membership_type: 0,
              class_pass_type: 1,
              event: 2,
              product: 3,
              discount_code: 4,
              gift_card_spend: 5,
            };
            return itemTypeSortOrders[cartItem.item_type];
          },
            'product.valid_until',
          ],
      );
    },
    showRecurringTerms() {
      return !!_find(this.cartItems, { item_type: 'membership_type' })
          && this.client.settings.show_recurring_terms;
    },
  },
  async mounted() {
    await this.$store.dispatch('updateUser');
    this.loading = false;
  },
  methods: {
    getItemTitle(cartItem) {
      let itemTitle = cartItem.product.name;
      if (cartItem.item_type === 'membership_type') {
        itemTitle += ' (' + cartItem.payment_option.name + ')';
        if (cartItem.membership_campaign) {
          itemTitle += ' - ' + cartItem.membership_campaign.name;
        }
      }
      if (cartItem.item_type === 'discount_code') {
        itemTitle = this.$t('checkout.discountCode') + ': ' + itemTitle;
      }
      if (cartItem.item_type === 'gift_card_spend') {
        itemTitle = this.$t('checkout.GiftCard') + ' (' + cartItem.product.code + ')';
      }
      return itemTitle;
    },
    getItemPrice(cartItem) {
      return cartItem.item_type === 'membership_type' ?
          (cartItem.membership_campaign ?
                  cartItem.membership_campaign.reduced_price :
                  cartItem.payment_option.payment_amount
          ) :
          cartItem.product.price;
    },

    pay() {
      if (this.showRecurringTerms && !this.membershipTermsAccepted) {
        this.showForgotToAcceptMembershipTermsDialog = true;
        return;
      }

      if (!this.termsAccepted) {
        this.showForgotToAcceptTermsDialog = true;
        return;
      }

      this.startPayment();
    },

    startPayment() {
      switch (this.client.settings.payment_service_provider) {
        case 'reepay':
          this.reepayStartPayment();
          break;
      }
    },

    async deleteCartItem(cartItem) {

      this.loading = true;

      await YogoApi.delete('/cart-items/' + cartItem.id);
      await this.$store.dispatch('updateUser');


      this.removedItemName = cartItem.product.name;
      this.showItemDeletedSnackbar = true;

      this.loading = false;


    },

    async applyDiscountCode() {
      if (!this.discountCodeInput) return;
      const response = await YogoApi.post('/cart-items', {
        item_type: 'discount_code',
        discount_code: this.discountCodeInput,
        user: this.user.id,
      });
      if (response === 'E_DISCOUNT_CODE_NOT_FOUND') {
        alert(this.$t('checkout.discountCodeNotFound'));
        return;
      }
      if (response === 'E_DISCOUNT_CODE_CUSTOMER_LIMIT_REACHED') {
        alert(this.$t('checkout.thisDiscountCodeIsNoLongerAvailable'));
        return;
      }
      if (response === 'E_DISCOUNT_CODE_USE_PER_CUSTOMER_LIMIT_REACHED') {
        alert(this.$t('checkout.youHaveAlreadyUsedThisDiscountCodeTheMaximumNumberOfTimes'));
        return;
      }
      if (response === 'E_GIFT_CARD_IS_USED_UP') {
        alert(this.$t('checkout.giftCardIsUsedUp'));
        return;
      }
      if (response === 'E_GIFT_CARD_HAS_EXPIRED') {
        alert(this.$t('checkout.giftCardHasExpired'));
        return;
      }
      if (response.substr(0, 2) === 'E_') {
        alert(response);
        return;
      }
      this.discountCodeInput = '';
      await this.$store.dispatch('updateUser');
    },

  },
};
</script>


<style lang="stylus">

.md-table-cell
  padding 0

.terms-dialog
  .terms-content
    margin: 0 40px 20px;
    overflow-y: auto;

.payment--symbols
  img
    height 25px !important
    margin-right 5px !important

</style>
