<template>
    <div class="theme--frame-box">

      <div class="flex space-between items-center">
        <h2>{{ $t('profile.myInfoLabel') }}</h2>
        <router-link class="tar" :to="{ name: 'ProfileEdit' }">
          <div>
            <span class="icon-edit gray--hover"></span>
            <md-tooltip md-direction="left">{{ $t('profile.editLabel') }}</md-tooltip>
          </div>
        </router-link>
      </div>
      <div class="space2"></div>

      <ul class="widget__list--standard">
        <li>
            <p><span>{{ $t('global.name') }}: </span>{{ customer.first_name + ' ' + customer.last_name }}</p>
            <p><span>{{ $t('global.email') }}: </span>{{ customer.email }}</p>
            <p><span>{{ $t('login.phoneLabel') }}: </span>{{ customer.phone }}</p>
          <div class="space2"></div>
        </li>
      </ul>
    </div>
</template>

<script>
    export default {
        name: 'myinfo',
        data() {
          return {
            myInfoLabel: 'Mine oplysninger',
            editLabel: 'Rediger',
          }
        },
        props:['customer']
    }
</script>


<style>


</style>
