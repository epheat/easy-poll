<template>
  <div id="app">

    <div id="header">
      <h1>Easy-Poll</h1>
    </div>
    <div id="navbar">
      <div id="org">
        <span v-show="loggedIn">Logged into {{ orgName }}</span>
      </div>
      <div id="nav">
        <router-link to="/" class="navlink">Home</router-link>
        <router-link to="/client" v-if="loggedIn" class="navlink">Client</router-link>
        <router-link to="/dashboard" v-if="loggedIn && admin" class="navlink">Dashboard</router-link>
        <router-link to="/host" v-if="loggedIn && admin" class="navlink">Host</router-link>
      </div>
      <div id="login">
        <span v-show="!loggedIn"><a href="#" @click="handleLogin">Log In</a></span>
        <span v-show="loggedIn">Hello, {{ accountName }}! <a href="#" @click="handleLogout">Log Out</a></span>
      </div>
    </div>
    <!-- <button @click="debug">debug</button> -->
    <!-- <button @click="debug2">toggle admin</button> -->
    <!-- <input id="removeThis" v-model="accountID"></input> -->

    <router-view :accountID="accountID" :auth="auth"></router-view>

  </div>
</template>

<script>
import EventBus from './utils/EventBus.js'

import AuthService from './auth/AuthService.js';
const auth = new AuthService();
const { login, logout, isAuthenticated, getUserInfo } = auth;
import axios from 'axios';

export default {
  name: 'app',
  data () {
    return {
      loggedIn: false,
      accountName: "Evan",
      accountID: 1234,
      orgName: "Triangle",
      admin: false,
      auth: auth
    }
  },

  mounted: function() {
    EventBus.$on("authChange", authState => {
      this.loggedIn = authState.authenticated;
      this.accountID = authState.accountID;
      this.accountName = authState.nickname;
      this.admin = authState.admin;
    });
    if (isAuthenticated()) {
      this.loggedIn = true;

      var idToken = localStorage.getItem('id_token');

      // get the userID, nickname, admin tag
      var decodeThis = idToken.split(".")[1];
      var userProperties = JSON.parse(atob(decodeThis));

      this.accountName = userProperties.nickname;
      this.accountID = userProperties.sub;
      this.admin = userProperties.admin;
    }
  },

  methods: {
    handleLogin: function() {
      login(); // imported from auth/AuthService.js
    },
    handleLogout: function() {
      logout(); // imported from auth/AuthService.js
    },

    debug: function() {
      console.log("debug!");
    },
    debug2: function() {
      this.admin = !this.admin;
    }
  },

  computed: {
    navLinkClassList: function() {
      return {

      }
    }
  }
}
</script>

<style scoped>
body {
  /*background-color: rgb(80, 80, 80);*/
}
#app {
  text-align: center;
  font-family: 'Average', serif;
}

#header {
  border-radius: 8px 8px 0px 0px;
  box-shadow: 0px 2px 2px rgb(103, 103, 103);
  background-color: rgb(89, 97, 139);
  border-bottom: 2px solid rgba(130, 130, 130, 0.7);
  font-family: 'Montserrat', sans-serif;
}
#header h1 {
  padding: 5px;
  color: white;
  text-shadow: 0px 2px 3px #222;
  margin: 0px;
}
#navbar {
  min-height: 30px;
  border-radius: 0px 0px 8px 8px;
  box-shadow: 0px 2px 2px rgb(103, 103, 103);
  display: grid;
  color: white;
  background-color: rgb(75, 82, 120);
  margin-bottom: 6px;
}
@media only screen and (max-width: 767px) {
  #navbar {
    grid-template-areas: "nav nav" "org login";
    grid-template-rows: 30px 30px;
    grid-template-columns: 1fr 1fr;
  }
}
@media only screen and (min-width: 767px) {
  #navbar {
    grid-template-areas: "org nav login";
    grid-template-rows: 30px;
    grid-template-columns: 2fr 3fr 2fr;
  }
}

#nav {
  border-radius: 5px;
  grid-area: nav;
  height: 24px;
  background-color: rgba(130, 130, 130, 0.5);
  border-radius: 0px 0px 5px 5px;
  padding-top: 3px;
}
.navlink {
  display: inline-block;
  width: 24%;
  height: 18px;
  color: white;
  text-decoration: none;
}
.navselected {
  border-bottom: 2px solid white;
}

#org {
  padding-top: 5px;
  grid-area: org;
  background-color: rgb(75, 82, 120);
  border-radius: 5px;
}
#login {
  padding-top: 5px;
  grid-area: login;
  background-color: rgb(75, 82, 120);
  border-radius: 5px;
}

</style>
