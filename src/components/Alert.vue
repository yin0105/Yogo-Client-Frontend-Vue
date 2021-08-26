<template>
  <Modal v-show="showModal" @close="close">
    <template slot="body">
      {{ alertText }}
    </template>
    <template slot="footer">
      <button class="btn btn-primary" @click="close">Ok</button>
    </template>
  </Modal>

</template>
<script>
import Modal from '@/components/Modal';

export default {
  components: { Modal },
  props: ['alertText', 'show'],
  data() {
    return {
      showModal: false,
    }
  },
  watch: {
    show(newShowValue) {
      if (newShowValue) {
        this.showModal = true;
      }
    },
  },
  methods: {
    close() {
      this.showModal = false;
      this.$emit('update:show', false);
    }
  }
};
</script>
