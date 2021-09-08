<template>
  <div>    
  </div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import GoogleTagManagerMixin from './GoogleTagManagerMixin';
import _pick from 'lodash/pick';
import Vue from 'vue';
// import { StripePlugin } from '@vue-stripe/vue-stripe';
// import "https://js.stripe.com/v3";
import {loadStripe} from '@stripe/stripe-js';
import VueStripeCheckout from 'vue-stripe-checkout'


// const options = {
//   pk: 'pk_test_51J9AaOBOiHfVTw1ZB91mzPVpLylaEdsFBtQaxaEUYY2kt6nGTOxtYn4PMgTrpJnRF4ZESTiUYzxoNoDmhumWA22H00Na6dRdxm',
//   stripeAccount: 'acct_1JX7rPPglcKiF3Oq',
//   apiVersion: '2020-08-27',
//   locale: 'auto',
// };
const options = {
  key: 'pk_test_51J9AaOBOiHfVTw1ZB91mzPVpLylaEdsFBtQaxaEUYY2kt6nGTOxtYn4PMgTrpJnRF4ZESTiUYzxoNoDmhumWA22H00Na6dRdxm',
  image: 'https://cdn.meme.am/images/100x100/15882140.jpg',
  locale: 'auto',
  currency: 'PHP',
  billingAddress: true,
  panelLabel: 'Subscribe $50'
}


export default {

  mixins: [GoogleTagManagerMixin],
//   components: { StripeCheckout, },

  methods: {
    async stripeStartPayment() {
      this.loading = true;

      loadStripe('pk_test_51J9AaOBOiHfVTw1ZB91mzPVpLylaEdsFBtQaxaEUYY2kt6nGTOxtYn4PMgTrpJnRF4ZESTiUYzxoNoDmhumWA22H00Na6dRdxm')
      .then(() => {
        //   Vue.use(StripePlugin, options);
        Vue.use(VueStripeCheckout, options);
      })

      await this.GTMEvent('paymentStarted');

      const result = await YogoApi.post('/payments/stripe/create-order-and-matching-session-type');

      console.log("result = ", result)

      if (result === 'E_INVALID_CART_ITEM') {
        alert(this.$t('checkout.oneOrMoreCartItemsAreNoLongerAvailable'));
        await this.$store.dispatch('updateUser');
        this.loading = false;
        return;
      }

      if (!result.status) {
        throw new Error(
            'Invalid result from /payments/stripe/create-order-and-matching-session-type');
      }

      switch (result.status) {
        case 'ORDER_SETTLED':
          await this.$store.dispatch('updateUser');
          await this.GTMTransaction(result.order);
          this.$router.push({ name: 'MyProfile' });
          return;
        case 'CHARGE_SESSION_CREATED':
          this.stripeOpenChargeSession();
        //   this.stripeOpenChargeSession(result.chargeSession);
          return;
        case 'RECURRING_SESSION_CREATED':
          this.stripeOpenRecurringSession(result.recurringSession, result.order);
          return;
      }
    },

    stripeOpenChargeSession() {
      this.loading = false;

            // this.$checkout.close()
            // is also available.
        console.log("see")
        // this.$stripe = new window.Stripe('pk_test_51J9AaOBOiHfVTw1ZB91mzPVpLylaEdsFBtQaxaEUYY2kt6nGTOxtYn4PMgTrpJnRF4ZESTiUYzxoNoDmhumWA22H00Na6dRdxm', this.options);
            this.$checkout.open({
                    image: 'https://i.imgur.com/1PHlmFF.jpg',
                    locale: 'en',
                    currency: 'BZD',
                    name: 'Blips and Chitz!',
                    description: 'An entire afternoon at Blips and Chitz!',
                    amount: 9999999,
                    panelLabel: 'Play Roy for {{amount}}',
                    token: (token) => {
                            // handle the token
                            console.log(token);
                    }
            })

    //   this.stripeWindow.addEventHandler(window.Stripe.Event.Accept, async data => {
    //     console.log('stripe window accept data:', data);
    //     const orderId = data.invoice.split('_')[0];
    //     this.loading = true;
    //     await YogoApi.post('/payments/stripe/invoice/' + data.invoice + '/process-if-paid');
    //     await this.$store.dispatch('updateUser');
    //     await this.GTMTransaction(orderId);
    //     this.$router.push({ name: 'MyProfile' });
    //   });

    //   this.stripeWindow.addEventHandler(window.Stripe.Event.Error, () => {
    //   });
    //   this.stripeWindow.addEventHandler(window.Stripe.Event.Cancel, () => {
    //   });
    //   this.stripeWindow.addEventHandler(window.Stripe.Event.Close, async () => {
    //     await this.$store.dispatch('updateUser');
    //   });
    },

    stripeOpenRecurringSession(recurringSession, order) {
      console.log('recurringSession:', recurringSession, 'order:', order);
      this.loading = false;

      this.stripeWindow = new window.Stripe.ModalCheckout(recurringSession.id);

      this.stripeWindow.addEventHandler(window.Stripe.Event.Accept, async data => {
        console.log('stripe window accept data:', data);
        this.loading = true;
        await YogoApi.post(
            '/payments/stripe/settle-and-attach-card-to-zero-total-recurring-order',
            {
              order: order.id,
              paymentMethod: data.payment_method,
            },
        );
        await this.$store.dispatch('updateUser');
        await this.GTMTransaction(order.id);
        this.$router.push({ name: 'MyProfile' });
      });

      this.stripeWindow.addEventHandler(window.Stripe.Event.Error, () => {
      });
      this.stripeWindow.addEventHandler(window.Stripe.Event.Cancel, () => {
      });
      this.stripeWindow.addEventHandler(window.Stripe.Event.Close, async () => {
        await this.$store.dispatch('updateUser');
      });
    },

    async stripeStartGiftCardPayment(form) {
      this.loading = true;

      await this.GTMEvent('paymentStarted');

      const result = await YogoApi.post(
          '/payments/stripe/create-order-and-charge-session-for-gift-card',
          _pick(
              form,
              [
                'amount',
                'giver_name',
                'giver_email',
                'recipient_name',
                'recipient_email',
                'message',
              ],
          ),
          {
            headers: {
              'X-Yogo-Client-Accepts-Extended-Error-Format': 1,
            },
          },
      );

      if (result.error) {
        alert(result.error.localized_message + '\n\n' + result.error.localized_message);
        this.loading = false;
        return;
      }

      this.stripeOpenGiftCardChargeSession(result.chargeSession);

    },

    async stripeOpenGiftCardChargeSession(chargeSession) {
      this.loading = false;

      this.stripeWindow = new window.Stripe.ModalCheckout(chargeSession.id);

      this.stripeWindow.addEventHandler(window.Stripe.Event.Accept, async data => {
        console.log('stripe window accept data:', data);
        const orderId = data.invoice.split('_')[0];
        this.loading = true;
        await YogoApi.post('/payments/stripe/invoice/' + data.invoice + '/process-if-paid');
        await this.GTMTransaction(orderId);
        this.giftCardPaid();
      });

      this.stripeWindow.addEventHandler(window.Stripe.Event.Error, () => {
      });
      this.stripeWindow.addEventHandler(window.Stripe.Event.Cancel, () => {
      });
      this.stripeWindow.addEventHandler(window.Stripe.Event.Close, () => {
      });
    },
  },
};

</script>
