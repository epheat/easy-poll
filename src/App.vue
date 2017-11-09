<template>
  <div id="app">

    <div id="header">
      <h1>Easy-Poll</h1>
    </div>
    <div id="nav">
      <router-link to="/">Client</router-link>
      <router-link to="/dashboard" v-if="admin">Dashboard</router-link>
      <router-link to="/host" v-if="admin">Host</router-link>
    </div>
    <button @click="debug()">debug</button>
    <input id="removeThis" v-model="accountID"></input>

    <!-- <poll-client :poll="poll" :allowMultiple="false"></poll-client> -->
    <!-- <poll-dashboard :poll="poll"></poll-dashboard> -->
    <router-view :accountID="accountID"></router-view>

  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
      poll: {
        prompt: "Should this potential get a bid?",
        responses: ['option1', 'option2', 'option3', 'option4'],
        votes: [{}, {}, {}, {}, {}, {}, {}],
        tallies: [1, 4, 3, 9],
        allowMultiple: true,
        timeRemaining: 1000
      },
      selectedResponses: [],
      accountID: 1234,
      admin: true
    }
  },

  mounted: function() {

  },

  methods: {
    debug: function() {
      console.log("debug!");
    }
  }
}
</script>

<style>
#app {
  text-align: center;
  font-family: 'Average', serif;
}

#header {
  border-radius: 4px;
  background-color: rgb(179, 194, 214);
  font-family: 'Montserrat', sans-serif;
  /*box-shadow: 0px 4px 8px #ccc;*/
}
#header h1 {
  padding: 5px;
  color: white;
  text-shadow: 0px 2px 3px #222;
  margin: 0px;
}

#nav {
  max-width: 500px;
  height: 25px;
  background-color: rgb(179, 194, 214);
  margin: 0 auto;
  padding-top: 5px;
}
</style>
