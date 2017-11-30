<template>
  <div class="spinner">
    <img src="./assets/spinner.gif" alt="loading"/>
  </div>
</template>

<script>
  import router from './../router'

  export default {
    name: 'callback',
    props: ['auth'],
    mounted: function() {
      this.auth.handleAuthentication();
    },
    data () {
      return {}
    }
  }
</script>

<style>
  .spinner {
    text-align: center;
  }
</style>
