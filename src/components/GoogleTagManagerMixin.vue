<template>
  <div></div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import _map from 'lodash/map';

const yogoEvents = [
  'paymentStarted',
  'paymentCompleted',
];

export default {

  methods: {
    GTMInitTag() {
      console.log('this.client.settings.google_tag_manager_id:',
          this.client.settings.google_tag_manager_id);
      if (!this.client.settings.google_tag_manager_id) return;

      window.dataLayer = [{ 'gtm.start': new Date().getTime(), event: 'gtm.js' }];
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=' + this.client.settings.google_tag_manager_id;
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    },

    GTMPushToDataLayer(obj) {
      if (window.dataLayer) {
        window.dataLayer.push(obj);
      }
    },

    GTMEvent(event) {
      if (yogoEvents.indexOf(event) === -1) {
        throw new Error('Invalid GTM event: ' + event);
      }
      this.GTMPushToDataLayer({ 'event': event });
    },

    async GTMTransaction(order) {
      if (!window.dataLayer) return;
      if (!order.order_items) {
        const orderId = order.id || order;
        order = await YogoApi.get('/orders/' + orderId + '?populate[]=order_items');
      }
      const dataLayerObj = {
        transactionId: order.id,
        transactionAffiliation: 'YOGO',
        transactionTotal: order.total,
        transactionTax: order.vat_amount,
        transactionShipping: 0,
        transactionProducts: _map(order.order_items, orderItem => ({
          sku: orderItem.item_type.replace('_', '').toUpperCase() + orderItem.item_id,
          name: orderItem.name,
          category: orderItem.item_type,
          price: orderItem.item_price,
          quantity: orderItem.count,
        })),
      };
      this.GTMPushToDataLayer(dataLayerObj);
      this.GTMEvent('paymentCompleted')
    },
  },

};

</script>
