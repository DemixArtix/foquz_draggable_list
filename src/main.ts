import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import './assets/styles/app.css';

import Icons from './assets/svg/index.vue'

const app = createApp(App);

app
  .component('g-icon', Icons)
  .use(store)
  .mount('#app');