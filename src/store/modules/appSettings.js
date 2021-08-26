import pick from 'lodash/pick'
import assign from 'lodash/assign'

export const UPDATE = 'UPDATE'

const allowedSettingKeys = ['locale']

const initialState = () => ({
  locale: 'da'
})

const getters = {
  locale: state => state.locale
}

const actions = {
  update({ commit }, settings) {
    commit(UPDATE, pick(settings, allowedSettingKeys))
  }
}

const mutations = {
  [UPDATE]: (state, settings) => {
    assign(state, settings)
  }
}

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
}
