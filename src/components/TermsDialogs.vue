<template>
  <div>
    <md-dialog :md-active.sync="showTermsDialog" class="terms-dialog">
      <md-dialog-title></md-dialog-title>
      <md-dialog-content class="terms-and-conditions">
        <h1>{{ $t('global.terms') }}</h1>
        <div v-html="client.settings.terms"></div>
      </md-dialog-content>

      <md-dialog-actions>
        <button class="btn btn-primary" @click="showTermsDialog = false">OK</button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog-alert :md-active.sync="showForgotToAcceptTermsDialog"
                     :md-content="$t('checkout.YouMustAcceptOurTerms')">
    </md-dialog-alert>
  </div>

</template>

<script>

import { mapGetters } from 'vuex';

export default {
  name: 'TermsDialogs',
  data() {
    return {
      showTermsDialog: false,
      showForgotToAcceptTermsDialog: false,
    }
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  methods : {
    openTermsDialog() {
      this.showTermsDialog = true;
    },
    openForgotToAcceptTermsDialog() {
      this.showForgotToAcceptTermsDialog = true;
    }
  }
}

</script>
