<template>
  <div class="xl:p-8 w-full">
    <div class="bg-white flex items-center rounded-full shadow-xl">
      <input class="searchbar rounded-l-full w-full text-lg py-2 px-6 text-gray-700 leading-tight focus:outline-none block" id="search" type="text" placeholder="Hvad leder du efter?" v-model="inputFieldValue">

      <div class="p-2">
        <button class="bg-red-400 text-white rounded-full p-2 hover:bg-red-100 focus:outline-none w-12 h-12 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'VideoSearch',
    props: ['value'],
    data() {
      return {
        inputFieldValue: ''
      }
    },
    watch: {
      value(newValue) {
        this.inputFieldValue = newValue;
      },
      inputFieldValue(newInputValue) {
        this.$emit('input', newInputValue);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .searchbar {
    &::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      font-size: 1rem;
    }
    &::-moz-placeholder { /* Firefox 19+ */
      font-size: 1rem;
    }
    &:-ms-input-placeholder { /* IE 10+ */
      font-size: 1rem;
    }
    &:-moz-placeholder { /* Firefox 18- */
      font-size: 1rem;
    }
  }

</style>
