<template>
  <div>
    <div
      :class="{ open: this.isOpen }"
      @click.prevent="click"
      class="yogo-filter-dropdown bg-white border-2 font-semibold inline-flex mr-2 mb-1 text-xs md:text-sm px-4 py-2 rounded-full cursor-pointer hover:border-gray-400 transition-all items-center"
    >
      {{ filter.name }}
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
    <div
      :class="{ hidden: !this.isOpen }"
      class="bg-white shadow-xl yogo-filter-dropdown-inner absolute z-10 p-4 rounded-xl text-center"
    >
      <div
        v-for="filterValue in filter.filter_values"
        :key="'filterValue_' + filterValue.filterId"
        @click.prevent="filterValueClick(filterValue)"
        :class="{ selected: filterValueIsSelected(filterValue) }"
        class="yogo-filter-value border-2 font-semibold mb-1 text-xs px-3 py-1 rounded-full cursor-pointer hover:border-gray-400 transition-all"
      >
          {{ filterValue.name }}
      </div>

    </div>
  </div>
</template>

<script>

  import _find from 'lodash/find';

  export default {
    data() {
      return {
      }
    },
    props: [
      'isOpen',
      'filter',
      'selectedVideoFilterValues'
    ],
    methods: {
      filterValueClick(filterValue) {
        this.$emit('filterValueClick', filterValue);
      },
      filterValueIsSelected(filterValue) {
         return !!_find(
          this.selectedVideoFilterValues,
          {
            filterId: filterValue.filterId
          }
        );
      },
      click() {
        this.$emit('filterClick');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .yogo-filter-dropdown {
    user-select: none;
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */

    svg {
      transition: .3s ease;
    }
  }
  .yogo-filter-dropdown-inner {
    max-height: 360px;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }
  .yogo-filter-dropdown.open {
    svg {
      transition: .3s ease;
      transform: rotate(180deg);
    }
    .yogo-filter-dropdown-inner {
      display: block !important;
    }
  }

  .yogo-filter-value {
    user-select: none;
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
  }

  .yogo-filter-value.selected {
    border-color: rgba(255, 116, 119, .5);
    background: rgba(255, 116, 119, .1);
  }
</style>
