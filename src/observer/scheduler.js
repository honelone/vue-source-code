/**
 * 这个文件用于存储所有需要更新的观察者 Watcher
 * 并在所有数据更新完毕后，统一执行 Watcher 的更新操作
 */
import { nextTick } from '../util/next-tick.js'

// 用于存放 watcher 队列
let queue = []
// 用于去重
let has = {}

// 这个方法用于循环调用队列中的 watche 的 run 方法
// -- 调用之后要清空当前队列
// -- 这个方法会在 nextTick 中去调用，
// -- 而 nextTick 是一个微任务
function flushSchedulerQueue() {
  for (let index = 0; index < queue.length; index++) {
    queue[index].run()
  }
  queue = []
  has = {}
}

export function queueWatcher(watcher) {
  const id = watcher.id
  // 判断当前 watcher 是否已经被存入队列
  if (has[id] === undefined) {
    // 当前 has 中没有 watcher 的id
    // 先存入 队列中
    queue.push(watcher)
    // 存储 id
    has[id] = true
    // 然后将 flushSchedulerQueue 方法传入 nextTick 中
    nextTick(flushSchedulerQueue)
  }
}
