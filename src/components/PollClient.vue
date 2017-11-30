<template>
  <div>
    <poll-selector @selectPoll="getPoll"></poll-selector>
    <h2 id="prompt">{{ prompt }}</h2>
    
    <div id="response-options">
      <vote-button v-for="(response, i) in pollResponses"
        :response="response"
        :selected="selectedResponses[i]"
        @toggle="toggle(i)">
      </vote-button>
    </div>
    <div>{{ serverResponse }}</div>
    <button id="clear-button" @click="clearVote()">Clear Response</button>
  </div>
</template>
<script>
import PollSelector from './PollSelector.vue';
import VoteButton from './VoteButton.vue';
import axios from 'axios';

export default {
  // props are local variables that receive changes from the parent element
  props: ["accountID"],
  // in components, data must be a function
  data: function() {
    return {
      prompt: "",
      allowMultiple: false,
      pollResponses: [],
      selectedResponses: [],
      serverResponse: "",
      pollID: 0,
      accessToken: "",
    }
  },
  mounted: function() {

  },
  // created function should fire when we navigate to this component via router
  created: function() {

  },
  // component methods
  methods: {
    toggle: function(i) {
      if (this.allowMultiple) {
        if (this.selectedResponses[i] == undefined || this.selectedResponses[i] == false) {
          // must use $set so changes are properly detected
          this.$set(this.selectedResponses, i, true);
          this.postVote();
        } else {
          this.$set(this.selectedResponses, i, false);
          this.postVote();
        }
      } else {
        if (this.hasVoted) {
          // do nothing
        } else {
          this.$set(this.selectedResponses, i, true);
          this.postVote();
        }
      }
    },
    clearVote: function() {
      this.selectedResponses = [];
      this.serverResponse = '';
      this.postVote();
    },
    postVote: function() {
      var axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      }
      axios.post('/vote', { pollID: this.pollID, accountID: this.accountID, selectedResponses: this.selectedResponses }, axiosConfig)
      .then( response => {
        console.log(response);
        this.serverResponse = response.data;
      })
      .catch( error => {
        console.log(error);
      })
    },
    getPoll: function(pollID) {
      this.serverResponse = '';
      this.pollID = pollID;
      var axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      }
      // axios get poll by id of selected poll
      axios.post('/poll', { 'pollID': pollID }, axiosConfig)
      .then( response => {
        this.prompt = response.data.prompt;
        this.pollResponses = response.data.responses;
        this.allowMultiple = response.data.allowMultiple;
      })
      .catch( error => {
        console.log(error);
      });

      // axios get user's vote for that poll
      axios.post('/userVote', { accountID: this.accountID, pollID: pollID }, axiosConfig)
      .then( response => {
        if (response.data == "no vote") {
          this.selectedResponses = [];
        } else if (response.data == "Error: requested vote from a nonexistent poll.") {

        } else {
          this.selectedResponses = response.data.selectedResponses;
        }
      })
      .catch( error => {
        console.log(error);
      });

    }
  },
  // computed properties are recalculated any time its dependencies are updated
  computed: {
    hasVoted: function() {
      for (var i=0; i<this.selectedResponses.length; i++) {
        if (this.selectedResponses[i] == true) {
          return true;
        }
      }
      return false;
    }
  },
  components: {
    'poll-selector': PollSelector,
    'vote-button': VoteButton
  }
}
</script>
<style scoped>
#response-options {
  padding: 15px;
  background-color: rgb(213, 213, 213);
  border-radius: 6px;
  box-shadow: inset 0px 0px 6px #aaa;

  width: 80%;
  max-width: 600px;
  margin: 0 auto;

  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(4, 1fr);

}
@media only screen and (max-width: 767px) {
  #response-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media only screen and (min-width: 767px) {
  #response-options {
    grid-template-columns: repeat(4, 1fr);
  }
}
#clear-button {
  margin-top: 10px;
}
</style>
