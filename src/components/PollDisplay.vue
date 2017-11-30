<template>
  <div class="poll-display-container" :class="containerClassList" @click="selectPoll">
    <div class="time-remaining-bar"><span :style="timeRemainingBarSpanStyle"></span></div>
    <h3 class="poll-display-prompt">{{ promptSpan }}</h3>
    <span>{{ responseListSpan }}</span>
    <p>{{ timeRemainingSpan }}</p>
  </div>
</template>

<script>

const PROMPT_CHAR_LIMIT = 50;

export default {
  // props are local variables that receive changes from the parent element
  props: ["poll", "selected"],
  // in Vue components, data must be a function
  data: function() {
    return {
      timeRemaining: this.poll.duration - Math.floor((Date.now() - this.poll.timestamp)/1000),
      expired: false
    }
  },
  // component methods
  created: function() {
    this.decrementTime();
  },
  methods: {
    decrementTime: function() {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.expire();
      } else {
        setTimeout(() => {
          this.decrementTime();
        }, 1000);
      }
    },

    expire: function() {
      this.expired = true;
      this.timeRemaining = 0;
      // change style
    },

    selectPoll: function() {
      if (!this.expired) {
        this.$emit('selectPoll');
      }
    }
  },
  // computed properties are recalculated any time its dependencies are updated
  computed: {
    containerClassList: function() {
      return {
        selected: this.selected,
        expired: this.expired
      }
    },
    timeRemainingBarSpanStyle: function() {
      var color = '#484'
      if (this.timeRemaining < 10) {
        color = '#944';
      } else if (this.timeRemaining < 60) {
        color = '#ba3'
      }
      return {
        width: `${this.timeRemaining/this.poll.duration*100}%`,
        backgroundColor: color
      }
    },
    responseListSpan: function() {
      if (this.expired) {
        return 'Poll Expired.';
      } else {
        var length = this.poll.responses.length;
        if (this.poll.responses.length > 2) {
          var otherResponses = this.poll.responses.length - 2;
          if (otherResponses == 1) {
            return `${this.poll.responses[0]}, ${this.poll.responses[1]}, and 1 other response.`
          } else {
            return `${this.poll.responses[0]}, ${this.poll.responses[1]}, and ${otherResponses} other responses.`
          }
        } else if (this.poll.responses.length == 2) {
          return `${this.poll.responses[0]}, ${this.poll.responses[1]}.`
        } else if (this.poll.responses.length == 1) {
          return `${this.poll.responses[0]}.`;
        } else {
          return `no responses.`;
        }
      }
    },

    timeRemainingSpan: function() {
      // 10 minutes or over
      if (this.timeRemaining > 60*10 ) {
        return `${Math.floor(this.timeRemaining/60)} minutes remaining.`;
      } else  if (this.timeRemaining > 60) {
        if (this.timeRemaining%60 < 10) {
          return `${Math.floor(this.timeRemaining/60)}:0${this.timeRemaining%60} remaining.`;
        } else {
          return `${Math.floor(this.timeRemaining/60)}:${this.timeRemaining%60} remaining.`;
        }
      } else if (this.timeRemaining == 1) {
        return '1 second remaining.';
      } else {
        return `${this.timeRemaining} seconds remaining.`
      }
    },

    promptSpan: function() {
      if (this.poll.prompt.length > PROMPT_CHAR_LIMIT) {
        return this.poll.prompt.slice(0, PROMPT_CHAR_LIMIT) + "...";
      } else {
        return this.poll.prompt;
      }
    }
  }
}
</script>

<style scoped>
.poll-display-container {
  display: inline-block;
  white-space: normal;
  width: 200px;
  height: 140px;
  vertical-align: top;
  text-align: left;
  padding: 2px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: rgb(209, 206, 200);
  cursor: pointer;
}
.expired {
  opacity: 0.5;
  cursor: not-allowed;
}
.selected {
  outline: 2px solid green;
}
.poll-display-prompt {
  margin-top: 0px;
  margin-bottom: 5px;
}
.poll-display-container p {
  margin-bottom: 0px;
  margin-top: 4px;
}
.time-remaining-bar {
  height: 5px;

}
.time-remaining-bar span {
  display: block;
  height: 100%;
  background-color: grey;
  transition: width 1s;
}

</style>
