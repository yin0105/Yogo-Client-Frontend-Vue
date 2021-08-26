import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';
import i18n from './includes/i18n';
import VueBrowserUpdate from 'vue-browserupdate';
// VueMaterial
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
// Nl2br
import Nl2br from 'vue-nl2br';

Vue.config.productionTip = false;

// All styles
require('./assets/styl/style.styl');

Vue.use(VueBrowserUpdate, {
  options: {},
});

// Load all filters
require('./filters/index');

//import './assets/external/vue-material/vue-material.scss';
// Material theme is loaded dynamically from S3/Lambda

Vue.use(VueMaterial);

Vue.component('nl2br', Nl2br);

new Vue({
  i18n,
  store,
  router,
  render: h => h(App),
}).$mount('#app');
