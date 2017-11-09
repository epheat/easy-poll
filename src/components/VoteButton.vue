<template>
  <div class="resp" :class="classObject" @click="toggle()">{{ response }}</div>
</template>
<script>
export default {
  // props are local variables that receive changes from the parent element
  props: ['response', 'selected'],
  // in components, data must be a function
  data: function() {
    return {

    }
  },
  // component methods
  methods: {
    toggle: function() {
      this.$emit('toggle');
    }
  },
  // computed properties are recalculated any time its dependencies are updated
  computed: {
    classObject: function() {
      return {
        "selected": this.selected
      }
    }
  }
}
</script>
<style>
.resp {
  background: linear-gradient(rgb(255, 255, 255), rgb(230, 230, 230));
  border-radius: 5px;
  height: 50px;
  cursor: pointer;
}

.resp:hover {
  background: linear-gradient(rgb(230, 230, 230), rgb(255, 255, 255));
}

.selected {
  background: linear-gradient(rgb(46, 138, 64), rgb(39, 112, 53));
}
.selected:hover {
  background: linear-gradient(rgb(39, 112, 53), rgb(46, 138, 64));
}
</style>
