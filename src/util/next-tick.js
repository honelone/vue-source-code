/**
 * 这个文件是用于异步更新的核心代码
 */
// 首先，我们有两个全局变量
let callbacks = [] // 存放所有需要异步更新的方法
let pending = false // 异步标识，防止重复调用

// 这个方法就是放在 timeFunc 的微任务中的方法
// -- 当微任务进入执行栈中时，就会依次去调用 callbacks 数组中的方法
function flushCallbacks() {
  pending = false
  // 遍历，依次执行回调函数
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
}

// 这里定义一个 timeFunc 变量，用来定义其在不同环境下的方法
// -- 这里采取优雅降级的方式来定义 timeFunc
// -- 即根据当前环境是否支持 来判断 timeFunc 是什么方法
// -- 按照优先级分别为： Promise > MutationObserve > setImmediate > setTimeout
let timeFunc

// 这个方法会将 flushCallbacks 放入他们的微任务队列中
// -- 当正常的宏任务流程执行完毕后，就会去执行微任务队列中的 flushCallbacks
// -- 而 flushCallbacks 就会去依次调用 callbacks 数组中的方法
// -- callbacks 数组中的方法就是 更新视图的 方法
if (typeof Promise !== 'undefined') {
  console.log('promise')
  // 如果支持 Promise，则 timeFunc 就是 Promise
  // -- 将 flushCallbacks 放入 then 中
  // -- then 里面是一个微任务
  const p = Promise.resolve()
  timeFunc = () => {
    p.then(flushCallbacks)
  }
} else if (typeof MutationObserver !== 'undefined') {
  // 如果不支持 Promise，则判断是否支持 MutationObserver
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
  // 继续判断是否支持 setImmediate
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

// 每传入一个回调函数 cb，就会将其推入 callbacks 中
// -- 然后判断 pending为 false ,就去执行 timeFunc 方法，并且会将 pending 改为 true
// -- flushCallbacks 方法会在 timeFunc 的微任务中去调用
// -- 所以，这里要等到当前执行栈中的宏任务执行完后，才回去执行微任务队列
// -- 这时，才会再去改变 pending 的值为 false, 为下一次做准备
// -- 并且，去调用微任务队列的方法，即 callbacks 数组中的方法
export function nextTick(cb) {
  // cb 就是我们传进来的 flushSchedulerQueue 方法（目前来看是这样的）
  // 然后，我们要将它存入 callbacks 数组中
  callbacks.push(cb)

  // 如果 pending 为 false，就调用 timeFunc 方法
  // -- 这里是为了防止多次调用，节流阀的作用
  if (!pending) {
    // 先将 pending 改为 true
    pending = true
    // 然后调用 timeFunc
    // -- 这个方法就是我们定义的需要异步执行的方法
    timeFunc()
  }
}
