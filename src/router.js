import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router)

import PGP from "./components/PGP.vue";

const router = new Router({
    mode: 'history',
    routes: [
        {
            name: "PGP",
            path: '/',
            component: PGP
        }
    ]
})

export default router;