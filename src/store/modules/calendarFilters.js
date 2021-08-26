import pick from 'lodash/pick'
import merge from 'lodash/merge'

const PERSIST_KEYS = ['branch']
const STORAGE_KEY = 'calendarFilters'

export const SET_FILTER = 'SET_FILTER'
export const CLEAR_FILTERS = 'CLEAR_FILTERS'

function persistState(state) {
  // Safari's feature "private mode" on iOS < 11 will throw an error when using
  // `setItem`. Just catch the error and fail semi-silently.
  try {
    const json = JSON.stringify(pick(state, PERSIST_KEYS))
    localStorage.setItem(STORAGE_KEY, json)
  } catch (err) {
    console.log('Can\'t save state to localStorage')
  }
}

function clearPersistedState() {
  localStorage.removeItem(STORAGE_KEY)
}

function restoreState() {
  const item = localStorage.getItem(STORAGE_KEY)

  if (!item) {
    return null
  }

  try {
    const state = JSON.parse(item)
    return pick(state, PERSIST_KEYS)
  } catch (err) {
    return null
  }
}

const initialState = () => {
  const persistedState = restoreState()

  return {
    branch: 0,
    ...persistedState
  }
}

const getters = {
  all: state => ({
    branch: state.branch
  }),
}

const actions = {
  setFilter: ({ commit, state }, filter) => {
    commit(SET_FILTER, filter)
    persistState(state)
  },
  clear: ({ commit }) => {
    clearPersistedState()
    commit(CLEAR_FILTERS)
  }
}

const mutations = {
  [SET_FILTER]: (state, { key, value }) => {
    state[key] = value
  },
  [CLEAR_FILTERS]: state => {
    merge(state, initialState())
  },
}

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
}
