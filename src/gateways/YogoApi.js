import axios from 'axios';
import router from '../router'

import envConfig from '../../env_config'

if (envConfig) {
  console.info('%cUsing api root: ' + envConfig.apiRoot, 'color:darkgreen;')
} else {
  alert('You need to select which API to use. Please specify an apiRoot in the file api_config.js in the root dir.\nAlso, for local development, you need to specify clientId in the same file.')
}


let yogoApi = axios.create({
  baseURL: envConfig.apiRoot
});

yogoApi.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {

  if ((error.response.status === 401 || error.response.status === 403) && error.request.responseURL.indexOf('/login') === -1) {
    window.localStorage.removeItem('accessToken')
    window.sessionStorage.removeItem('accessToken')

    router.push({name: 'Login'});
  }
  return Promise.reject(error);
});

yogoApi.interceptors.request.use(function (config) {

  let headers = config.headers || {}

  if (config.url.indexOf('/login') > -1) {
    // Don't send access token to login
    if (headers.Authorization) delete headers.Authorization
  } else {
    // Send access- token to all other routes, if available
    let accessToken = window.localStorage.getItem('accessToken') || window.sessionStorage.getItem('accessToken')

    if (accessToken) {
      headers.Authorization = 'Bearer ' + accessToken
    }
  }

  // Set request context, just as a hint to the API. That prevents customers from accidentally logging in to admin area.
  headers['X-Yogo-Request-Context'] = 'frontend';

  // Set client ID from env. Used for local testing
  if (envConfig.clientId) {
    headers['X-Yogo-Client-ID'] = envConfig.clientId
  }

  // Set client ID from window URL. Used for..?
  const regexResult = window.location.href.match(/clientId=(\d+)/);

  if (regexResult) {
    headers['X-Yogo-Client-ID'] = regexResult[1]
  }

  // Apply headers
  config.headers = headers;

  return config

}, function (error) {
  console.log(error.message)
});

export default yogoApi
