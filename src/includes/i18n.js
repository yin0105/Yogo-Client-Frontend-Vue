import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueMoment from 'vue-moment'
import VueMaterial from 'vue-material'
import store from '../store'
import moment from 'moment'
import da from '@/locales/da.json'
import en from '@/locales/en.json'
import _assign from 'lodash/assign';

const initialLocale = store.state.appSettings.locale || 'da'

/**
 * Configure VueI18n
 */
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: initialLocale,
  fallbackLocale: 'da',
  messages: { da, en }
})

/**
 * Configure moment.js and vue bindings
 */
moment.locale(initialLocale)

Vue.use(VueMoment, { moment })

/**
 * Configure Vue Material
 */
Vue.use(VueMaterial)

function changeVueMaterialLocale(locale) {
  const momentLocale = moment.localeData(locale)

  _assign(Vue.prototype.$material.locale, {
    startYear: 1900,
    endYear: 2099,
    dateFormat: 'dd-MM-yyyy',
    days: momentLocale.weekdays(),
    shortDays: momentLocale.weekdaysShort(),
    shorterDays: momentLocale.weekdaysMin(),
    months: momentLocale.months(),
    shortMonths: momentLocale.monthsShort(),
    shorterMonths: ['J', 'F', 'M', 'A', 'M', 'Ju', 'Ju', 'A', 'Se', 'O', 'N', 'D'],
  });
}

changeVueMaterialLocale(initialLocale)

window.Vue = Vue

/**
 * Subscribe to locale changes in the Vuex store
 */
function handleLocaleChange(locale) {
  i18n.locale = locale
  moment.locale(locale)
  changeVueMaterialLocale(locale)
}

store.watch(
  state => state.appSettings.locale,
  handleLocaleChange
)

if (process.env.NODE_ENV === 'development') {
  window.changeLocale = locale => {
    return store.dispatch('appSettings/update', { locale })
  }
}

export default i18n
