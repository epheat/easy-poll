<template>
  <div class="component-container">
    <poll-selector
      ref="pollSelector"
      :allowSelectExpired="true"
      :query="'/allPolls'"
      :displayPollID="true"
      @selectPoll="editPoll">
    </poll-selector>
    <p>Poll Selected: {{ selectedPollID }}</p>
    <button class="delete-poll-button" @click="deletePoll">Delete</button>
    <h2>Create a new Poll:</h2>
    <div class="poll-creator-container">
      <label>Poll Prompt:</label><input type="text" v-model="newPoll.prompt"></input><br>
      <label>Add a response:</label><input type="text" v-model="response" @keyup.enter="addResponse"></input><span class="add" @click="addResponse">+</span><br>
      <label>Responses: </label>
      <ul class="response-list">
        <li v-for="(resp, index) in newPoll.responses">
          {{ resp }} - <span class="remove" @click="removeResponse(index)">X</span>
        </li>
      </ul>
      <br>
      <label>Poll Duration (in ms): </label><input type="number" v-model="newPoll.duration"></input><br>
      <label>Allow multiple responses from users?</label><input type="checkbox" v-model="newPoll.allowMultiple"></input><br>

      <button class="create-poll-button" @click="createPoll">Create Poll</button>
    </div>
  </div>
</template>

<script>

import PollSelector from './PollSelector.vue';
import axios from 'axios';

export default {
  // props are local variables that receive changes from the parent element
  props: [],
  // in Vue components, data must be a function
  data: function() {
    return {
      newPoll: {
        prompt: "",
        responses: [],
        allowMultiple: false,
        duration: 0,
      },
      response: "",
      selectedPollID: undefined
    }
  },
  created: function() {
    // TODO: fetch all active polls
  },
  // component methods
  methods: {
    deletePoll: function() {
      var axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      }
      axios.post('/deletePoll', { pollID: this.selectedPollID }, axiosConfig)
      .then(response => {
        console.log(response.data);
        this.$refs.pollSelector.getPolls();
      })
      .catch(err => {
        console.log(err);
      })
    },
    editPoll: function(pollID) {
      this.selectedPollID = pollID;
    },
    createPoll: function() {
      var axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      }
      axios.post('/createPoll', { poll: this.newPoll }, axiosConfig)
      .then(response => {
        console.log(response.data);
        this.$refs.pollSelector.getPolls();
      })
      .catch(err => {
        console.log(err);
      })
    },
    addResponse: function() {
      this.newPoll.responses.push(this.response);
      this.response = "";
    },
    removeResponse: function(i) {
      this.newPoll.responses.splice(i, 1);
    }
  },
  // computed properties are recalculated any time its dependencies are updated
  computed: {

  },
  components: {
    'poll-selector': PollSelector
  }
}
</script>

<style scoped>
.component-container {

}
.poll-creator-container {
  padding: 10px;
  margin: 10px auto;
  width: 90%;
  background-color: rgb(201, 201, 201);
}
.poll-creator-container label {

}
.poll-creator-container input {

}
@media only screen and (max-width: 767px) {
  .poll-creator-container input[type=text] {
    width: calc(95% - 18px);
  }
}
@media only screen and (min-width: 767px) {
  .poll-creator-container input[type=text] {
    width: 70%;
  }
}
.add {
  display: inline-block;
  background-color: rgb(68, 166, 87);
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.response-list {
  text-align: left;
  max-width: 200px;
  margin: 5px auto;
}
.remove {
  display: inline-block;
  background-color: rgb(166, 68, 68);
  width: 15px;
  height: 15px;
  text-align: center;
  cursor: pointer;
}
.create-poll-button {
  height: 30px;
  width: 20%;
  min-width: 100px;
  background: linear-gradient(rgb(99, 153, 108), rgb(98, 204, 95));
}
.delete-poll-button {
  margin-top: 10px;
  height: 30px;
  width: 20%;
  min-width: 100px;
  background: linear-gradient(rgb(153, 99, 99), rgb(204, 95, 95));
}
</style>
