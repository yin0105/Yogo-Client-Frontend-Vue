<template>
  <fieldset :id="id">
    <legend v-if="label">{{ label }}</legend>
    <div v-for="(option, index) in options" :key="option.text">
      <input
        :id="id + index"
        :name="id"
        type="radio"
        :value="option.value"
        :checked="option.value === value"
        :class="inputClass"
        :disabled="disabled"
        :required="required"
        @change="updateValue(option.value)"
      />
      <label :for="id + index">{{ option.text }}</label>
      <slot v-if="option.value === value" :name="option.value" />
    </div>
  </fieldset>
</template>

<script>
export default {
  model: {
    event: "change",
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number, Boolean, Object],
      default: null,
    },
    options: {
      type: [Array],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    inputClass: {
      type: [String, Object],
      default: "",
    },
  },
  methods: {
    updateValue(value) {
      this.$emit("change", value);
    },
  },
};
</script>
