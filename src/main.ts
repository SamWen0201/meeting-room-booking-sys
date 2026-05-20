// 引入全部的 element-plus CSS 檔案
import 'element-plus/dist/index.css';
import "./assets/main.scss";
// element-plus 基於斷點提供的隱藏類
import 'element-plus/theme-chalk/display.css'

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// import element plus icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia());
app.use(router);

app.mount("#app");
