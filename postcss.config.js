// const prependWidgetClass = selector => `.yogo-widget ${selector}`

const selectorsToRemove = [
  /*/^(body|a|ul|li)$/,
  /^h[1-5]$/*/
  /^body$/,
]


const shouldRemoveSelector = selector =>
  selectorsToRemove.some(pattern => pattern.test(selector))

module.exports = () => ({
  plugins: [
    css => {
      css.walkRules(rule => {

        // Modify selectors
        const selectors = rule.selectors
          .filter(selector => !shouldRemoveSelector(selector))

        if (selectors.length) {
          rule.selectors = selectors
        } else {
          console.log('removerule')
          rule.remove()
        }
      })
    }
  ]
})
