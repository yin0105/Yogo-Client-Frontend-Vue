<template>
  <div></div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import GoogleTagManagerMixin from './GoogleTagManagerMixin';
import _pick from 'lodash/pick';

export default {

  mixins: [GoogleTagManagerMixin],

  methods: {
    async reepayStartPayment() {
      this.loading = true;

      await this.GTMEvent('paymentStarted');

      const result = await YogoApi.post('/payments/reepay/create-order-and-matching-session-type');

      console.log("result = ", result)

      if (result === 'E_INVALID_CART_ITEM') {
        alert(this.$t('checkout.oneOrMoreCartItemsAreNoLongerAvailable'));
        await this.$store.dispatch('updateUser');
        this.loading = false;
        return;
      }

      if (!result.status) {
        throw new Error(
            'Invalid result from /payments/reepay/create-order-and-matching-session-type');
      }

      switch (result.status) {
        case 'ORDER_SETTLED':
          await this.$store.dispatch('updateUser');
          await this.GTMTransaction(result.order);
          this.$router.push({ name: 'MyProfile' });
          return;
        case 'CHARGE_SESSION_CREATED':
          this.reepayOpenChargeSession(result.chargeSession);
          return;
        case 'RECURRING_SESSION_CREATED':
          this.reepayOpenRecurringSession(result.recurringSession, result.order);
          return;
      }
    },

    reepayOpenChargeSession(chargeSession) {
      this.loading = false;

      this.reepayWindow = new window.Reepay.ModalCheckout(chargeSession.id);

      this.reepayWindow.addEventHandler(window.Reepay.Event.Accept, async data => {
        console.log('reepay window accept data:', data);
        const orderId = data.invoice.split('_')[0];
        this.loading = true;
        await YogoApi.post('/payments/reepay/invoice/' + data.invoice + '/process-if-paid');
        await this.$store.dispatch('updateUser');
        await this.GTMTransaction(orderId);
        this.$router.push({ name: 'MyProfile' });
      });

      this.reepayWindow.addEventHandler(window.Reepay.Event.Error, () => {
      });
      this.reepayWindow.addEventHandler(window.Reepay.Event.Cancel, () => {
      });
      this.reepayWindow.addEventHandler(window.Reepay.Event.Close, async () => {
        await this.$store.dispatch('updateUser');
      });
    },

    reepayOpenRecurringSession(recurringSession, order) {
      console.log('recurringSession:', recurringSession, 'order:', order);
      this.loading = false;

      this.reepayWindow = new window.Reepay.ModalCheckout(recurringSession.id);

      this.reepayWindow.addEventHandler(window.Reepay.Event.Accept, async data => {
        console.log('reepay window accept data:', data);
        this.loading = true;
        await YogoApi.post(
            '/payments/reepay/settle-and-attach-card-to-zero-total-recurring-order',
            {
              order: order.id,
              paymentMethod: data.payment_method,
            },
        );
        await this.$store.dispatch('updateUser');
        await this.GTMTransaction(order.id);
        this.$router.push({ name: 'MyProfile' });
      });

      this.reepayWindow.addEventHandler(window.Reepay.Event.Error, () => {
      });
      this.reepayWindow.addEventHandler(window.Reepay.Event.Cancel, () => {
      });
      this.reepayWindow.addEventHandler(window.Reepay.Event.Close, async () => {
        await this.$store.dispatch('updateUser');
      });
    },

    async reepayStartGiftCardPayment(form) {
      this.loading = true;

      await this.GTMEvent('paymentStarted');

      const result = await YogoApi.post(
          '/payments/reepay/create-order-and-charge-session-for-gift-card',
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

      this.reepayOpenGiftCardChargeSession(result.chargeSession);

    },

    async reepayOpenGiftCardChargeSession(chargeSession) {
      this.loading = false;

      this.reepayWindow = new window.Reepay.ModalCheckout(chargeSession.id);

      this.reepayWindow.addEventHandler(window.Reepay.Event.Accept, async data => {
        console.log('reepay window accept data:', data);
        const orderId = data.invoice.split('_')[0];
        this.loading = true;
        await YogoApi.post('/payments/reepay/invoice/' + data.invoice + '/process-if-paid');
        await this.GTMTransaction(orderId);
        this.giftCardPaid();
      });

      this.reepayWindow.addEventHandler(window.Reepay.Event.Error, () => {
      });
      this.reepayWindow.addEventHandler(window.Reepay.Event.Cancel, () => {
      });
      this.reepayWindow.addEventHandler(window.Reepay.Event.Close, () => {
      });
    },
  },
};

</script>
