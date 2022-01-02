/**
 * 这个文件用于定义一个 观察者、订阅者
 * 可以订阅订阅器的通知，并更新页面
 */

import { pushTarget, popTarget } from './dep.js'

// 定义一个自增变量，用于标识每一个观察者
let id = 0
export class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options

    this.id = id++
    // 这个 deps 用于存储当前观察者的 Dep 订阅器
    // -- 每个观察者都有不同的订阅器
    // -- 然后通过下面的 depsId 来去重
    this.deps = []
    this.depsId = new Set()
    // 如果传入的表达式参数是一个函数，那么就后面就会调用这个函数
    // -- 在渲染时，这个 exprOrFn 就是 vm._update(vm._render())
    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    }

    // 每实例化一个 watcher ，就会调用一次这个方法
    this.get()
  }

  // 在这个方法里回去调用 更新渲染视图 的方法
  // -- 但在调用前后，会对 Dep 全局上的 target 变量做处理
  // -- 在更新之前会将当前 watcher 挂载在 Dep.target 上
  // -- 在更新之后会将当前 watcher 移除
  get() {
    pushTarget(this)
    this.getter()
    popTarget(this)
  }

  // 这个方法用于收集订阅器
  // -- 并将当前 Watcher 观察者加入到 订阅器中
  addDep(dep) {
    let id = dep.id
    // 去重
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      // 然后将当前 watcher 加入到 dep 的 subs 中
      dep.addSub(this)
    }
  }

  // 这个方法用于更新
  update() {
    this.get()
  }
}