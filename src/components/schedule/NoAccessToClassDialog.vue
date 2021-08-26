<template>
  <md-dialog :md-active="showNoAccessToClassDialog" v-on:update:mdActive="updateShowNoAccessToClassDialog">
    <md-dialog-content>{{ $t('calendar.NoAccessToClass') }}</md-dialog-content>
    <md-dialog-actions>
      <button class="btn btn-primary" @click="$emit('update:showNoAccessToClassDialog', false)">
        {{ $t('global.cancelButton') }}
      </button>
      <button class="btn btn-primary">
        <router-link :to="{name: 'Prices'}">{{ $t('global.seePrices') }}</router-link>
      </button>
    </md-dialog-actions>
  </md-dialog>

</template>


<script>

  export default {

    props: ['showNoAccessToClassDialog'],
    methods: {

      updateShowNoAccessToClassDialog(showNoAccessToClassDialog) {
        console.log('updateShowNoAccessToClassDialog(showNoAccessToClassDialog)')
        this.$emit('update:showNoAccessToClassDialog', showNoAccessToClassDialog)
      },

    }

  }

</script>
