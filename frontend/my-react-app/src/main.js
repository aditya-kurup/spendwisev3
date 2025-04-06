import './style.css'
import { setupCounter } from './counter.js'

// Initialize your app without the Vite template HTML
document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>Smart Spending Analyzer</h1>
    <div class="card">
      <button id="counter" type="button">Counter</button>
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
