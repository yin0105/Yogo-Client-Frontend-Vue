<template>
  <div
    class="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-gray-700 bg-white border border-gray-300 cursor-pointer hover:border-gray-400"
  >
    <div class="text-xs font-normal leading-none max-w-full flex-initial mr-1">
      {{ category.name }}
    </div>
    <div class="flex flex-auto">
      <div @click="categoryClick(category.id)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Chip',
    data() {
      return {

      }
    },
    props: [
     'category'
    ],
  }
</script>
