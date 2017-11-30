import Vue from 'vue'

import App from './App.vue'
import router from './router'

var vm = new Vue({
    router,
    render: createEle => createEle(App)
}).$mount('#app');
