<template>
  <div>
    <div
      @click="filterClick"
      class="yogo-filter-dropdown bg-white border-2 font-semibold inline-flex mr-2 mb-1 text-xs md:text-sm px-4 py-2 rounded-full cursor-pointer hover:border-gray-400 transition-all items-center"
    >
      {{ $t('global.MoreFilters') }}
      <span class="ml-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-chevron-down"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </div>

    <Modal
      v-show="isOpen"
      @close="filterClick"
      class="yogo-more-filters-modal"
    >
      <template slot="header">
        <h2 class="text-2xl justify-between items-end mb-4 md:mb-10 text-center font-bold">
          {{ $t('global.MoreFilters') }}
        </h2>
      </template>

      <template slot="body">

        <div class="mb-4 md:mb-10" v-for="filter in filters" :key="'filter_' + filter.id">
          <h3 class="text-lg font-bold mb-2">
            {{ filter.name }}
          </h3>
          <div
            v-for="filterValue in filter.filter_values"
            :key="'filterValue_' + filterValue.id"
            @click="filterValueClick(filterValue)"
            :class="{ selected: filterValueIsSelected(filterValue) }"
            class="yogo-filter-value inline-flex mr-2 border-2 mb-2 font-semibold mb-1 text-xs px-3 py-1 rounded-full cursor-pointer hover:border-gray-400 transition-all"
          >
            {{ filterValue.name }}
          </div>
        </div>

      </template>
    </Modal>

  </div>
</template>



<script>

  import _find from 'lodash/find';
  import Modal from './Modal'

  export default {
    name: 'MoreFiltersDialog',
    data() {
      return {
        showModal: false,
      }
    },
    components: {
      Modal
    },
    props: [
      'isOpen',
      'filters',
      'selectedVideoFilterValues'
    ],
    methods: {
      filterClick() {
        this.$emit('filterClick')
      },
      filterValueClick(filterValue) {
        this.$emit('filterValueClick', filterValue);
      },
      filterValueIsSelected(filterValue) {
         return !!_find(
          this.selectedVideoFilterValues,
          {
            id: filterValue.id
          }
        );
      },
      closeModal() {
        this.showModal = false
      }
    }
  }
</script>

<style lang="scss" scoped>
 .yogo-filter-value.selected {
  border-color: rgba(255, 116, 119, .5);
  background: rgba(255, 116, 119, .1);
 }
</style>
