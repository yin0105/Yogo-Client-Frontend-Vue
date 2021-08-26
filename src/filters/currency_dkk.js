import Vue from 'vue'

const currencyFormatter = require('currency-formatter')

Vue.filter('currency_dkk', function (value, options) {
  options = options || {
    decimals: 2,
  }
  if (!value) {
    return options.decimals === 0 ? '0' : '0,00'
  }

  return currencyFormatter.format(value, {
    decimal:',',
    thousand: '.',
    code: 'kr',
    precision: options.decimals,
    symbol: '',
    spaceBetweenAmountAndSymbol: false,
    format:'%v'
  })

})
