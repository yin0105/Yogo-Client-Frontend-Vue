<template>
  <div id="StripeCheckout">
    <vue-stripe-checkout
      ref="checkoutRef"
      :image="checkoutOptions.image"
      :name="checkoutOptions.name"
      :description="checkoutOptions.description"
      :currency="checkoutOptions.currency"
      :amount="checkoutOptions.amount"
      :allow-remember-me="false"
      @done="done"
      @opened="opened"
      @closed="closed"
    ></vue-stripe-checkout>
    <button @click="checkout1">Checkout 1</button>
    <button @click="checkout2">Checkout 2</button>
  </div>
</template>

<script>
// import HelloWorld from "./components/HelloWorld";

export default {
  name: "StripeCheckout",
  // components: {
  //   HelloWorld
  // },
  data() {
    return {
      checkoutOptions: {
        image: "https://i.imgur.com/HhqxVCW.jpg",
        name: "Shut up and take my money!",
        description: "Cats are the best dog!",
        currency: "PHP",
        amount: 99999
      }
    };
  },
  methods: {
    checkout1() {
      this.checkoutOptions = {
        image: "https://i.imgur.com/HhqxVCW.jpg",
        name: "Shut up and take my money!",
        description: "Cats are the best dog!",
        currency: "PHP",
        amount: 99999
      };
      this.$refs.checkoutRef.open();
    },
    checkout2() {
      this.checkoutOptions = {
        image: "https://i.imgur.com/HhqxVCW.jpg",
        name: "New name",
        description: "Cats forever!",
        currency: "USD",
        amount: 100000000
      };
      this.$refs.checkoutRef.open();
    }
  }
};
</script>
