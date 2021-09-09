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

    <StripeCheckout_ v-if="stripeCheckout.showStripeCheckout" v-bind.sync="stripeCheckout" ref="stripe_checkout"></StripeCheckout_>

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
import StripePaymentMixin from './StripePaymentMixin';
import StripeCheckout_ from './StripeCheckout_';
// import { loadStripe } from "@stripe/stripe-js";


export default {
  components: { Loadingspinner, StripeCheckout_},
  mixins: [ReepayPaymentMixin, StripePaymentMixin],
  data() {
    return {
      showTermsDialog: false,
      showMembershipTermsDialog: false,

      termsAccepted: false,
      membershipTermsAccepted: false,
      showForgotToAcceptTermsDialog: false,
      showForgotToAcceptMembershipTermsDialog: false,
      stripeCheckout: {
        showStripeCheckout: false,
      },
      showItemDeletedSnackbar: false,
      position: 'center',
      duration: 4000,
      isInfinity: false,

      removedItemName: '',

      loading: true,

      discountCodeInput: '',

      reepayWindow: null,

      stripe: null,
      card: null,
      clientSecret: '',
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
    // const result = await YogoApi.post('/payments/stripe/create-order-and-matching-session-type');
    // const publishableKey = await YogoApi.get('/payments/stripe/get-publishable-key');
    await this.$store.dispatch('updateUser');
    // this.clientSecret = result.clientSecret;
    // this.stripe = await loadStripe(publishableKey,  {
    //   stripeAccount: result.accountId
    // });    
    // const elements = this.stripe.elements();
    // console.log("ele = ", elements)
    // const style = {
    //     base: {
    //         color: "#32325d",
    //         fontFamily: 'Arial, sans-serif',
    //         fontSmoothing: "antialiased",
    //         fontSize: "16px",
    //         "::placeholder": {
    //         color: "#32325d"
    //         }
    //     },
    //     invalid: {
    //         fontFamily: 'Arial, sans-serif',
    //         color: "#fa755a",
    //         iconColor: "#fa755a"
    //     }
    // };
    // this.card = elements.create("card", { style: style });
    // console.log("card = ", this.card)
    // this.card.mount("#card-element");
    // this.card.on("change", function (event) {
    //   // Disable the Pay button if there are no card details in the Element
    //   console.log("change")
    //   document.querySelector("button").disabled = event.empty;
    //   document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
    // });

    this.loading = false;
  },

  methods: {

    // async checkoutSubmit() {
    //   console.log("submit");
    //   await this.payWithCard();
    // },

    // async payWithCard () {
    //   this.checkoutLoading(true);
      
    //   this.stripe.confirmCardPayment(this.clientSecret, {
    //       payment_method: {
    //         card: this.card
    //       }
    //     })
    //     .then(function(result) {
    //       if (result.error) {
    //         // Show error to your customer
    //         // parent.showError(result.error.message);
    //         let errorMsg = document.querySelector("#card-error");
    //         errorMsg.textContent = result.error.message;
    //         setTimeout(function() {
    //           errorMsg.textContent = "";
    //         }, 4000);
    //       } else {
    //         // The payment succeeded!
    //         // this.orderComplete(result.paymentIntent.id);
    //         document
    //           .querySelector(".result-message a")
    //           .setAttribute(
    //             "href",
    //             "https://dashboard.stripe.com/test/payments/" + result.paymentIntent.id
    //           );
    //         document.querySelector(".result-message").classList.remove("hidden");
    //         document.querySelector("button").disabled = true;
    //       }
    //     });
      
    //   this.checkoutLoading(false);
    // },

    // orderComplete(paymentIntentId) {
    //   this.checkoutLoading(false);
    //   document
    //     .querySelector(".result-message a")
    //     .setAttribute(
    //       "href",
    //       "https://dashboard.stripe.com/test/payments/" + paymentIntentId
    //     );
    //   document.querySelector(".result-message").classList.remove("hidden");
    //   document.querySelector("button").disabled = true;
    // },

    // showError(errorMsgText) {
    //   this.checkoutLoading(false);
    //   let errorMsg = document.querySelector("#card-error");
    //   errorMsg.textContent = errorMsgText;
    //   setTimeout(function() {
    //     errorMsg.textContent = "";
    //   }, 4000);
    // },

    // checkoutLoading(isLoading) {
    //   if (isLoading) {
    //     // Disable the button and show a spinner
    //     document.querySelector("button").disabled = true;
    //     document.querySelector("#spinner").classList.remove("hidden");
    //     document.querySelector("#button-text").classList.add("hidden");
    //   } else {
    //     document.querySelector("button").disabled = false;
    //     document.querySelector("#spinner").classList.add("hidden");
    //     document.querySelector("#button-text").classList.remove("hidden");
    //   }
    // },

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
          console.log("reepay");
          this.reepayStartPayment();
          break;

        case 'stripe':
          console.log("stripe");
          // this.stripeStartPayment();
          this.stripeCheckout.showStripeCheckout = true;
          
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

#payment-form 
  width 30vw
  min-width 500px
  align-self center
  box-shadow 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07)
  border-radius 7px
  padding 40px
  
  input 
    border-radius 6px
    margin-bottom 6px
    padding 12px
    border 1px solid rgba(50, 50, 93, 0.1)
    height 44px
    font-size 16px
    width 100%
    background white
  
  .result-message 
    line-height 22px
    font-size 16px
  
  .result-message a 
    color rgb(89, 111, 214)
    font-weight 600
    text-decoration none
  
  .hidden 
    display none
  
  #card-error 
    color rgb(105, 115, 134)
    text-align left
    font-size 13px
    line-height 17px
    margin-top 12px
  
  #card-element 
    border-radius 4px 4px 0 0 
    padding 12px
    border 1px solid rgba(50, 50, 93, 0.1)
    height 44px
    width 100%
    background white
  
  #payment-request-button 
    margin-bottom 32px
  
  /* Buttons and links */
  button 
    background #5469d4
    color #ffffff
    font-family Arial, sans-serif
    border-radius 0 0 4px 4px
    border 0
    padding 12px 16px
    font-size 16px
    font-weight 600
    display block
    transition all 0.2s ease
    box-shadow 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)
    width 100%
  
  button:hover 
    filter contrast(115%)
  
  button:disabled 
    opacity 0.5
    cursor default
  
  /* spinner/processing state, errors */
  .spinner,
  .spinnerbefore,
  .spinnerafter 
    border-radius 50%
  
  .spinner 
    color #ffffff
    font-size 22px
    text-indent -99999px
    margin 0px auto
    position relative
    width 20px
    height 20px
    box-shadow inset 0 0 0 2px
    -webkit-transform translateZ(0)
    -ms-transform translateZ(0)
    transform translateZ(0)
  
  .spinner:before,
  .spinner:after 
    position absolute
    content ""
  
  .spinner:before 
    width 10.4px
    height 20.4px
    background #5469d4
    border-radius 20.4px 0 0 20.4px
    top -0.2px
    left -0.2px
    -webkit-transform-origin 10.4px 10.2px
    transform-origin 10.4px 10.2px
    -webkit-animation loading 2s infinite ease 1.5s
    animation loading 2s infinite ease 1.5s
  
  .spinner:after 
    width 10.4px
    height 10.2px
    background #5469d4
    border-radius 0 10.2px 10.2px 0
    top -0.1px
    left 10.2px
    -webkit-transform-origin 0px 10.2px
    transform-origin 0px 10.2px
    -webkit-animation loading 2s infinite ease
    animation loading 2s infinite ease
  
@-webkit-keyframes loading 
  0% 
    -webkit-transform rotate(0deg)
    transform rotate(0deg)
  
  100% 
    -webkit-transform rotate(360deg)
    transform rotate(360deg)
  

@keyframes loading 
  0% 
    -webkit-transform rotate(0deg)
    transform rotate(0deg)
  
  100% 
    -webkit-transform rotate(360deg)
    transform rotate(360deg)
  

@media only screen and (max-width 600px) 
  form 
    width 80vw    

</style>