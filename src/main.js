import Vue from 'vue'
import VueRouter from 'vue-router';

import App from './App.vue'
import PollClient from './components/PollClient.vue';
import PollDashboard from './components/PollDashboard.vue';
import PollHost from './components/PollHost.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
      {
        path: '/',
        name: 'client',
        component: PollClient
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: PollDashboard
      },
      {
        path: '/host',
        name: 'host',
        component: PollHost
      }
    ]
});

var vm = new Vue({
    router,
    render: createEle => createEle(App)
}).$mount('#app');
