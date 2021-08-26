<template>

  <div>

    <md-snackbar md-position="center"
                 :md-active.sync="showSnackbar" md-persistent :md-duration="4000">
      {{ snackbarText }}
    </md-snackbar>

  </div>

</template>

<script>

  import YogoApi from '@/gateways/YogoApi'

  import _isString from 'lodash/isString'

  import {mapGetters} from 'vuex'

  export default {
    name: 'ClassSignup',
    props: {
      showErrorsToUser: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        classItem: null,

        showSnackbar: false,
        snackbarText: '',
      }
    },
    computed: {
      ...mapGetters([
        'user',
      ]),
    },

    created() {
      this.$on('signUpForClass', this.signUpForClass)
      this.$on('signOffFromClass', this.signOffFromClass)
      this.$on('signUpForLivestream', this.signUpForLivestream)
      this.$on('signUpForWaitingList', this.signUpForWaitingList)
      this.$on('signOffFromWaitingList', this.signOffFromWaitingList)
      this.$on('classPrimaryActionClick', this.classPrimaryActionClick)
    },

    methods: {

      async signUpForClass(classItem) {

        const signupResult = await YogoApi.post('/class-signups', {
          user: this.user.id,
          'class': classItem.id,
        })

        if (_isString(signupResult) && signupResult.substr(0, 2) === 'E_') {
          return this.classSignupFailure(signupResult)
        }

        this.snackbarText = this.$t('calendar.youAreNowSignedUpForClassName', {className: classItem.class_type.name});

        this.showSnackbar = true

        this.$emit('classSignupSuccess')

      },

      async signUpForLivestream(classItem) {

        const signupResult = await YogoApi.post('/class-livestream-signups', {
          user: this.user.id,
          'class': classItem.id,
        })

        if (_isString(signupResult) && signupResult.substr(0, 2) === 'E_') {
          return this.classSignupFailure(signupResult)
        }

        this.snackbarText = this.$t('calendar.youAreNowSignedUpForLivestreamForClassName', {className: classItem.class_type.name})

        this.showSnackbar = true

        this.$emit('classSignupSuccess')

      },

      async signOffFromClass(classItem) {
        if (arguments.length !== 1) throw 'signOffFromClass needs exactly 1 parameter: classItem'

        const deadlineTimestamp = classItem.user_is_signed_up_for_livestream ?
          classItem.class_livestream_signoff_deadline_timestamp :
          classItem.class_signoff_deadline_timestamp

        if (classItem.user_must_receive_warning_after_signoff_deadline && Date.now() > deadlineTimestamp) {
          if (!confirm(classItem.class_signoff_warning)) {
            return
          }
        }

        let response
        if (classItem.user_is_signed_up_for_livestream) {
          response = await YogoApi.delete('/class-livestream-signups/' + classItem.user_livestream_signup_id)
        } else {
          response = await YogoApi.delete('/class-signups/' + classItem.user_signup_id)
        }

        if (response.substr(0, 2) === 'E_') {
          alert(response)
          return
        }

        if (classItem.user_is_signed_up_for_livestream) {
          this.snackbarText = this.$t('calendar.youAreNoLongerSignedUpForLivestreamFor' , {className: classItem.class_type.name})
        } else {
          this.snackbarText = this.$t('calendar.youAreNoLongerSignedUpFor', {className: classItem.class_type.name})
        }

        this.showSnackbar = true

        this.$emit('classSignoffSuccess')

      },

      async signUpForWaitingList(classItem) {
        console.log('ClassSignup.signUpForWaitingList')

        const signupResult = await YogoApi.post('/class-waiting-list-signups', {
          user: this.user.id,
          'class': classItem.id,
        })

        if (_isString(signupResult) && signupResult.substr(0, 2) === 'E_') {
          return this.waitingListSignupFailure(signupResult)
        }

        this.snackbarText = this.$t('global.youJoinedTheWaitlistFor', {className: classItem.class_type.name})

        this.showSnackbar = true

        this.$emit('classWaitingListSignupSuccess')

      },

      async signOffFromWaitingList(classItem) {
        if (arguments.length !== 1) throw 'signOffFromWaitingList needs exactly 1 parameter: classItem'

        const response = await YogoApi.delete('/class-waiting-list-signups/' + classItem.user_waiting_list_signup_id)

        if (response.substr(0, 2) === 'E_') {
          alert(response)
          return
        }

        this.snackbarText = this.$t('global.youAreNoLongerOnTheWaitlistFor', {className: classItem.class_type.name})

        this.showSnackbar = true

        this.$emit('classWaitingListSignoffSuccess')

      },

      classSignupFailure(e) {
        if (this.showErrorsToUser) {
          alert(this.$t('calendar.classSignupError', {errorMessage: e}))
        }
        this.$emit('classSignupFailure', e)
      },

      waitingListSignupFailure(e) {
        if (this.showErrorsToUser) {
          alert(this.$t('calendar.waitingListSignupError', {errorMessage: e}))
        }
        this.$emit('waitingListSignupFailure', e)
      },

      cancelSignup() {
        this.$emit('classSignupFailure', 'E_USER_CANCELLED_SIGNUP')
      },

      classPrimaryActionClick(action) {
        console.log('Class primary action click', action)
      },

    },
  }

</script>
