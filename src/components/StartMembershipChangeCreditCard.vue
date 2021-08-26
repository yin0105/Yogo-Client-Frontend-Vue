<template>
  <div class="wrapper">

    <div class="message flex__fixed--center">
      {{ $t('checkout.openPaymentWindow') }}
      <div class="space4"></div>
      <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
    </div>

    <form method="post" action="https://payment.architrade.com/paymentweb/start.action" class="start-preauth-form">
      <input type="hidden" name="accepturl" v-model="preauthAccepturl">
      <input type="hidden" name="callbackurl" v-model="preauthCallbackurl" v-if="useCallback">
      <input type="hidden" name="cancelurl" v-model="cancelurl">


      <input type="hidden" name="amount" value="100">
      <input type="hidden" name="currency" value="208">
      <input type="hidden" name="merchant" v-model="merchant">

      <input type="hidden" name="orderid" v-model="orderid">

      <input type="hidden" name="preauth" value="1">
      <input type="hidden" name="mitType" value="UCOF">

      <input type="hidden" name="acquirerinfo" v-model="acquirerinfo">

      <input type="hidden" name="ordertext" v-model="ordertext">
      <input type="hidden" name="test" v-model="test" v-if="testPayments">

      <input type="hidden" name="decorator" value="responsive">

      <!-- Custom parameters that are forwarded to the API -->
      <input type="hidden" name="frontenddeclineurl" v-model="frontenddeclineurl">
      <input type="hidden" name="client" v-model="client">
      <input type="hidden" name="membershipid" v-model="membershipid">
      <input type="hidden" name="frontendsuccessurl" v-model="frontendsuccessurl">

    </form>

  </div>

</template>


<script>

    import YogoApi from '../gateways/YogoApi'
    import {mapGetters} from 'vuex'
    import moment from 'moment'

    export default {
        async mounted() {

            try {
                const membership = await YogoApi.get('/memberships/' + this.$route.params.membershipId);

                this.orderid = 'membership_' + membership.id + '_ncc_' + moment().unix();
                this.membershipid = membership.id;

                this.ordertext = this.orderid;
                this.currency = '208';
                this.merchant = this.client.dibs_merchant;
                this.acquirerinfo = this.client.name;
                this.test = this.testPayments;

                await YogoApi.post('/cron/log', {
                  entry: 'Starting membership payment card renewal. Order ID ' + this.orderid
                })

                this.updatePreauthForm();
                this.submitPreauthForm();

            } catch (err) {
                console.log(err, err.response);
            }

        },
        data() {
            return {
                merchant: '',
                orderid: '',
                ordertext: '',
                test: undefined,
                membershipid: '',
                acquirerinfo: '',
            }
        },
        computed: {
            ...mapGetters([
                'userIsLoggedIn',
                'userName',
                'profileImageFilename',
                'client',
                'clientLogoFilename',
                'apiRoot',
                'envConfig',
                'routerBase'
            ]),
            useCallback() {
                return document.location.href.indexOf('localhost') === -1 && document.location.href.indexOf('.local') === -1
            },
            cancelurl() {
                return this.apiRoot + '/payments/dibs/preauth-change-membership-credit-card-cancelled';
            },
            frontenddeclineurl() {
                return this.hrefBase + this.$router.resolve({
                    name: 'Membership',
                    params: {id: this.$route.params.membershipId}
                }).href;
            },
            preauthAccepturl() {
                return this.apiRoot + '/payments/dibs/preauth-change-membership-credit-card-accepted';
            },
            preauthCallbackurl() {
                return this.preauthAccepturl;
            },
            frontendsuccessurl() {
                return this.hrefBase + this.$router.resolve({
                    name: 'MembershipChangeCreditCardSuccess',
                    params: {membershipId: this.$route.params.membershipId}
                }).href;
            },
            hrefBase() {
                return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + this.routerBase
            },
            testPayments() {
                return this.envConfig.productionPayments ? 0 : 1
            }
        },
        methods: {
            updatePreauthForm() {
                let fields = ['merchant', 'orderid', 'acquirerinfo', 'ordertext', 'cancelurl', 'membershipid', 'frontendsuccessurl', 'frontenddeclineurl'];
                for (let i = 0; i < fields.length; i++) {
                    document.querySelector('form.start-preauth-form input[name="' + fields[i] + '"]').value = this[fields[i]];
                }

                document.querySelector('form.start-preauth-form input[name="client"]').value = this.client.id;
                if (this.testPayments) {
                    document.querySelector('form.start-preauth-form input[name="test"]').value = 1;
                }
                document.querySelector('form.start-preauth-form input[name="accepturl"]').value = this.preauthAccepturl;
                if (this.useCallback) {
                    document.querySelector('form.start-preauth-form input[name="callbackurl"]').value = this.preauthCallbackurl;
                }

            },
            submitPreauthForm() {
                document.querySelector('form.start-preauth-form').submit();
            }
        }
    }


</script>


<style lang="stylus">

</style>
