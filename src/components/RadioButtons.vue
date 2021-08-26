<template>
  <fieldset class="flex flex-wrap" :id="id">
    <div class="inline-flex items-center mt-3 ml-4" v-for="(option, index) in options" :key="option.text">
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
        class="form-radio h-5 w-5 text-gray-600"
      />
      <label class="ml-2 text-gray-700" :for="id + index">
       <svg class="check" viewbox="0 0 40 40">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%"></stop>
            <stop offset="100%"></stop>
          </linearGradient>
        </defs>
        <circle id="border" r="7px" cx="11px" cy="11px"></circle>
        <circle id="dot" r="3px" cx="11px" cy="11px"></circle>
      </svg>
        {{ option.text }}
      </label>
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


<style lang="scss" computed>

  label {
    position: relative;
    display: flex;
    width: auto;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
  }

  .check {
    margin-right: 7px;
    width: 20px;
    height: 20px;

    #border {
      fill: none;
      stroke: #333;
      stroke-width: 1;
      stroke-linecap: round;
    }

    #dot {
      fill: url(#gradient);
      transform: scale(0);
      transform-origin: 50% 50%;
    }
  }

  input {
    display: none;

    &:checked + label {
      background: linear-gradient(180deg, rgba(55, 65, 81, 1), rgba(55, 65, 81, 1));
      -webkit-background-clip: text;

      svg {
        #border {
          stroke: url(#gradient);
          stroke-dasharray: 145;
          stroke-dashoffset: 145;
          animation: checked 1.5s ease forwards;
        }

        #dot {
          transform: scale(1);
          transition: transform .5s
            cubic-bezier(0.57, .21, .69, 1.5);
        }
      }
    }
  }

  @keyframes checked {
    to {
      stroke-dashoffset: 0;
    }
  }

</style>
