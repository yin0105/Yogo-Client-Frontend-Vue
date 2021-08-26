<template>
  <div :style="{display:'flex', justifyContent: align}">
    <svg :class="{'checkmark-white': color === 'white'}" class="checkmark" xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 52 52">
      <circle class="checkmark__circle checkmark__circle-white" cx="26" cy="26" r="25" fill="none"/>
      <path class="checkmark__check checkmark__check-white" fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
  </div>
</template>

<script>

  export default {
    props: {
      color: {
        default: 'black',
      },
      align: {
        default: 'left'
      }
    },
  }

</script>
