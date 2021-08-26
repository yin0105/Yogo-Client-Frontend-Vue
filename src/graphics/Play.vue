<template>
  <div class="absolute w-20 h-20 flex transition-all items-center justify-center bg-gray-500 hover:bg-gray-600 rounded-full content top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      :stroke="stroke"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-play"
      :class="className"
      >
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  </div>
</template>

<script>
  export default {
    name: 'Play',
    props: [
     'stroke',
     'className'
    ]
  }
</script>

