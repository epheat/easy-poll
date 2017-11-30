<template>
  <div>
    <div class="active-polls-container">
      <poll-display v-for="(poll, index) in activePolls" :poll="poll" :selected="selectedPoll == index" @selectPoll="selectPoll(index)"></poll-display>
    </div>
    <button @click="getPolls">Refresh Polls</button>
  </div>
</template>

<script>
import PollDisplay from './PollDisplay.vue';
import axios from 'axios';

export default {
  // props are local variables that receive changes from the parent element
  props: [],
  // in Vue components, data must be a function
  data: function() {
    return {
      activePolls: [],
      selectedPoll: undefined
    }
  },
  created: function() {
    this.getPolls();
  },
  // component methods
  methods: {
    getPolls: function() {
      var axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      }
      axios.post('/allPolls', undefined, axiosConfig )
      .then(response => {
        this.activePolls = response.data;
      })
      .catch(error => {
        console.log(error);
      })
    },
    selectPoll: function(index) {
      this.selectedPoll = index;
      this.$emit('selectPoll', this.activePolls[this.selectedPoll].pollID);
    }
  },
  // computed properties are recalculated any time its dependencies are updated
  computed: {

  },
  components: {
    'poll-display': PollDisplay
  }
}
</script>

<style scoped>
.active-polls-container {
  margin-top: 10px;
  background-color: rgb(233, 233, 233);
  padding: 10px;
  outline: 1px dashed;
  outline-color: rgb(195, 195, 195);
  overflow: auto;
  white-space: nowrap;
}
</style>
