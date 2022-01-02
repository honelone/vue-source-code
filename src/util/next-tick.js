// 首先，我们有两个全局变量
let callbacks = [] // 存放所有需要异步更新的方法
let pending = false // 异步标识，防止重复调用

// 这个方法就会去执行 callbacks 中的方法
function flushCallbacks() {
  pending = false
  // 遍历，依次执行回调函数
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
}

// 这里定义一个 timeFunc 变量，用来接收不同的方法
let timeFunc

if (typeof Prmise !== 'undefined') {
  console.log('promise')
  // 如果支持 Promise，则 timeFunc 就是 Promise
  // -- 将 flushCallbacks 放入 then 中
  // -- then 里面是一个微任务
  const p = Promise.resolve()
  timeFunc = () => {
    p.then(flushCallbacks)
  }
} else if (typeof MutationObserver !== 'undefined') {
  console.log('mutation')
  // MutationObserver 用于监听 DOM 变化
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))

  observer.observe(textNode, {
    characterData: true,
  })

  timeFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if (typeof setImmediate !== 'undefined') {
  console.log('setImmediate')
  // 如果前面都不支持
  timeFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  console.log('setTimeout')
  // 最后，降级采用 setTimeout
  // -- setTimeout 是一个宏任务
  timeFunc = () => {
    setTimeout(flushCallbacks)
  }
}

export function nextTick(cb) {
  // cb 就是我们传进来的 flushSchedulerQueue 方法（目前来看是这样的）
  // 然后，我们要将它存入 callbacks 中
  callbacks.push(cb)

  // 如果 pending 为 false，就执行内部的方法
  if (!pending) {
    // 先将 pending 改为 true
    pending = true
    // 然后调用这个方法
    timeFunc()
  }
}
