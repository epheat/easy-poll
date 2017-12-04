<template>
  <div id="dashboard">
    <poll-selector @selectPoll="getPollResults" :allowSelectExpired="true" :query="pollSelectorQuery"></poll-selector>
    <h2>{{ poll.prompt }}</h2>
    <div id="results" :style="barGraphGridTemplate">
      <template v-if="showResults">
        <div class="bar" v-for="(tally, index) in poll.tallies" v-if="tally!=0" :style="barGridArea(tally, index)">
          {{ tally }}
        </div>
        <div class="barLabel" v-for="(response, index) in poll.responses" :style="barLabelGridArea(response, index)">
          {{ response }}
        </div>
      </template>
    </div>
    <p>Votes Received: {{ numVotes }}</p>
    <p>Time Remaining: {{ poll.timeRemaining }}</p>
    <button @click="toggleShow()">Hide/Show Results</button>
  </div>
</template>

<script>

import PollSelector from './PollSelector.vue';
import io from "socket.io-client";
import axios from "axios";
var resultsComSocket = io('/resultsCom');

export default {
  // props are local variables that receive changes from the parent element
  props: ["accountID", "admin"],
  // in Vue components, data must be a function
  data: function() {
    return {
      poll: { responses: [], tallies: [], votes: [] },
      pollID: -1,
      showResults: true
    }
  },
  created: function() {
    // using an arrow function here so "this" still refers to the Vue instance
    resultsComSocket.on('resultsUpdated', data => {
      if (data.pollID == this.pollID) {
        this.poll = data.poll;
      }
    })
  },
  // component methods
  methods: {
    getPollResults: function(pollID) {
      var axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      }
      this.pollID = pollID;
      axios.post('/pollResults', {'pollID': pollID}, axiosConfig)
      .then( response => {
        this.poll = response.data;
      })
      .catch( error => {
        console.log(error);
      });
    },
    toggleShow: function() {
      this.showResults = !this.showResults;
    },
    // grid area for a given bar in the bar graph
    barGridArea: function(tally, index) {
      return {
        gridRowStart: this.highestCount - tally + 1,
        gridRowEnd: this.highestCount + 1,
        gridColumnStart: 2 * index + 2,
        gridColumnEnd: 2 * index + 3
      }
    },
    // grid area for a given bar label
    barLabelGridArea: function(response, index) {
      return {
        gridRowStart: this.highestCount + 1,
        gridRowEnd: this.highestCount + 2,
        gridColumnStart: 2 * index + 2,
        gridColumnEnd: 2 * index + 3
      }
    }
  },
  // computed properties are recalculated any time its dependencies are updated
  computed: {
    pollSelectorQuery: function() {
      if (this.admin) {
        return "/allPolls";
      } else {
        return "/expiredPolls";
      }
    },
    barGraphGridTemplate: function() {
      return {
        gridTemplateColumns: "1fr repeat(" + this.poll.responses.length + ", 1fr 1fr)",
        gridTemplateRows: "repeat(" + this.highestCount + ", 1fr) 30px",
      }
    },
    highestCount: function() {
      return Math.max(...this.poll.tallies);
    },
    numVotes: function() {
      return this.poll.votes.length;
    }
  },
  components: {
    'poll-selector': PollSelector
  }
}
</script>

<style>
#dashboard {

}
#results {
  display: grid;
  background-color: rgb(187, 189, 214);
  width: 80%;
  margin: 0 auto;
  height: 400px;
  padding: 10px;
}
.bar {
  background-color: rgb(89, 168, 128);
  box-shadow: 4px 0px 0px rgb(70, 135, 84);
}
.barLabel {
  padding-top: 5px;
  font-weight: bold;
}
</style>
