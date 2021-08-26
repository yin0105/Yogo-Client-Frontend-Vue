import Vue from 'vue'
import Vuex from 'vuex'
import YogoApi from '@/gateways/YogoApi'
import router from '@/router'
import envConfig from '../../env_config'

// State modules
import appSettings from './modules/appSettings'
import calendarFilters from './modules/calendarFilters'

import _pick from 'lodash/pick'
import { v4 as uuidv4 } from 'uuid';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    appSettings,
    calendarFilters
  },
  state: {
    user: null,
    envConfig: envConfig,
    apiRoot: envConfig.apiRoot,
    client: null,
    routerBase: '/frontend',
    ready: false,
    requestedRoute: null,
    myProfileFlashMessage: null,
    membershipFlashMessage: null,
    mobileAppMode: window.location.href.indexOf('mobileAppMode=1') !== -1,
    liveswitchDeviceId: ''
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
    setClient(state, client) {
      state.client = client;
    },
    setReady(state) {
      state.ready = true
    },
    setCartItems(state, cartItems) {
      state.user.cart_items = cartItems
    },
    setRequestedRoute(state, requestedRoute) {
      state.requestedRoute = requestedRoute
    },
    setMyProfileFlashMessage(state, myProfileFlashMessage) {
      state.myProfileFlashMessage = myProfileFlashMessage
    },
    setMembershipFlashMessage(state, membershipFlashMessage) {
      state.membershipFlashMessage = membershipFlashMessage
    },
    setLiveswitchDeviceId(state, liveswitchDeviceId) {
      state.liveswitchDeviceId = liveswitchDeviceId
    }
  },
  getters: {
    userIsLoggedIn(state) {
      return !!state.user
    },
    userName(state) {
      if (state.user) {
        return state.user.first_name + ' ' + state.user.last_name
      } else {
        return ''
      }
    },
    user(state) {
      if (state.user) {
        return state.user
      } else {
        return null
      }
    },
    cartItems(state) {
      if (state.user && state.user.cart_items) {
        return state.user.cart_items
      } else {
        return []
      }
    },
    profileImageFilename(state) {
      return state.user && state.user.image ? state.user.image.filename : require('../assets/img/account.svg')
    },
    client(state) {
      return state.client ? state.client : {};
    },
    clientLogoFilename(state) {
      return state.client && state.client.logo && state.client.logo.filename ? state.client.logo.filename : '';
    },
    apiRoot(state) {
      return state.apiRoot;
    },
    envConfig(state) {
      return state.envConfig;
    },
    routerBase(state) {
      return state.routerBase;
    },
    stateReady(state) {
      return state.ready
    },
    emailConfirmationLink() {
      const location = window.location;
      const route = router.resolve({
        name: 'ConfirmEmailWithToken',
        params: {email: '{email}', token: '{token}'}
      });

      return location.protocol + '//' + location.host + location.pathname + route.href
    },
    requestedRoute(state) {
      return state.requestedRoute
    },
    myProfileFlashMessage(state) {
      return state.myProfileFlashMessage
    },
    membershipFlashMessage(state) {
      return state.membershipFlashMessage
    },
    classSignoffDeadlineInHumanFormat(state) {
      if (!state.client) return ''
      let minutes = state.client.class_signoff_deadline_minutes;
      const days = Math.floor(minutes / 1440);
      minutes -= days * 1440;
      const hours = Math.floor(minutes / 60);
      minutes -= hours * 60;
      let textParts = [];
      if (days) textParts.push(days + ' dage');
      if (hours) textParts.push(hours + ' timer');
      if (minutes) textParts.push(minutes + 'minutter');
      if (textParts.length === 3) {
        return textParts[0] + ', ' + textParts[1] + ' og ' + textParts[2]
      } else {
        return textParts.join(' og ');
      }
    },
    mobileAppMode(state) {
      return state.mobileAppMode
    },
    liveswitchDeviceId(state) {
      return state.liveswitchDeviceId
    }
  },
  actions: {
    logout({ commit, dispatch }) {
      commit('clearUser');
      dispatch('calendarFilters/clear')
      window.sessionStorage.removeItem('accessToken');
      window.localStorage.removeItem('accessToken');
      router.push({name: 'Login'})
    },
    async init({commit, state, dispatch}) {
      commit('setLiveswitchDeviceId', uuidv4())
      const [client, loginStatus] = await Promise.all([
        YogoApi.get('/clients/current?populate[]=logo&populate[]=settings&populate[]=branches'),
        YogoApi.get('/get-login-status')
      ])

      commit('setClient', client)
      dispatch('appSettings/update', client.settings)

      if (loginStatus.status === 'LOGGED_IN') {
        await this.dispatch('updateUser', loginStatus.user.id);
        commit('setReady');

        if (router.currentRoute.name === 'Init') {

          if (state.requestedRoute) {
            const requestedRoute = _pick(state.requestedRoute, ['name', 'params']);
            commit('setRequestedRoute', null);
            router.replace(requestedRoute)
          } else {
            router.replace({name: 'MyProfile'})
          }
        }
      } else {
        // NOT LOGGED IN
        commit('setReady');

        if (router.currentRoute.name === 'Init') {
          if (state.requestedRoute) {
            if (state.requestedRoute.meta.requireAuth !== false) {
              // requireAuth might be undefined, which should be taken as "true"
              router.replace({name: 'Login'});
            } else {
              const requestedRoute = _pick(state.requestedRoute, ['name', 'params']);
              commit('setRequestedRoute', null);
              router.replace(requestedRoute)
            }
          } else {
            router.replace({name: 'Login'});
          }

        }
      }

    },
    async updateUser({commit, state}, userId) {
      if (!userId) userId = state.user.id;
      const user = await YogoApi.get('/users/' + userId +
        '?populate[]=image' +
        '&populate[]=cart_items' +
        '&populate[]=cart_items.product' +
        '&populate[]=cart_items.payment_option' +
        '&populate[]=cart_items.membership_campaign'
      );
      commit('setUser', user);
    },
  },
  strict: debug
})
