// Basic Project/src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// แทน './style.css' ให้ใช้พาธนี้แทน (อยู่โฟลเดอร์เดียวกันกับ main.js)
import './assets/css/main.css'     // <- รวม tailwind และยูทิลิตี้หลัก
import './assets/css/styles.css'   // <- สไตล์เสริม (ถ้ามี)

createApp(App).use(router).mount('#app')
