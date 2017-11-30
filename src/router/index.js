import Vue from 'vue'
import VueRouter from 'vue-router'
import PollHome from './../components/PollHome.vue';
import PollClient from './../components/PollClient.vue';
import PollDashboard from './../components/PollDashboard.vue';
import PollHost from './../components/PollHost.vue';
import Callback from './../components/Callback.vue';

Vue.use(VueRouter)

const NotFoundComponent = { template: "<h1>404: Not Found</h1>" };

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: PollHome
    },
    {
      path: '/client',
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
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '*',
      name: 'not',
      component: NotFoundComponent
    }
  ]
});

export default router
