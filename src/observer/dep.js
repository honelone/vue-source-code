/**
 * 这个文件用于定义一个 订阅器
 * 可以定于数据的变化，并发出通知给订阅者（观察者）
 */

// 定义一个自增变量，用于标识每一个订阅器
let id = 0
export class Dep {
  constructor() {
    this.id = id++ // 每创建一个实例，都会让变量自增
    // 这个 subs 用于存储当前实例的 watcher 订阅者
    // -- 每个实例都有不同的订阅者
    this.subs = []
  }
  // 收集依赖
  // -- 收集当前 watcher 的依赖
  depend() {
    // Dep.target 在下面有介绍
    if (Dep.target) {
      // 如果当前 watcher 存在
      // -- 那么就调用 Watcher 上的方法收集依赖
      // -- 为什么是收集订阅器 Dep?
      // -- 因为最终由是 Dep 来发出更新通知的
      // -- 收集了这个订阅器，就表示会接受这个订阅器发出的通知
      Dep.target.addDep(this)
    }
  }
  // 发出通知
  // -- 遍历当前 watcher 数组
  // -- 并调用 watcher 的更新方法
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
  // 新增订阅者
  // -- 由 watcher 去调用，将当前 watcher 增加到 当前 dep 的 subs 中
  addSub(watcher) {
    this.subs.push(watcher)
  }
}

// 默认的 Dep.target 指向 null
// -- Dep.target是一个全局的 Watcher 指向
Dep.target = null

// Dep.target 主要通过下面两个方法进行更新
// -- 这两个方法主要会在 Watcher 中使用到
// -- 毕竟，这个是用来指向 Watcher 的 @_@

// 先创建一个数组用来存储所有的 watcher
// -- 使用数组来实现栈，先进后出
const targetStack = []

// 这个方法用于存储 watcher
export function pushTarget(watcher) {
  // 先存入数组中
  targetStack.push(watcher)
  // 然后让 Dep.target 指向当前 watcher
  Dep.target = watcher
}
// 这个方法用于删除 watcher
export function popTarget(watcher) {
  // 将数组的最后一个 watcher 移除
  targetStack.pop()
  // 然后让 Dep.target 指向移除后的数组最后一个 Watcher
  Dep.target = targetStack[targetStack.length - 1]
}
