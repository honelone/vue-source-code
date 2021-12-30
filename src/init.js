/**
 * 这个文件主要用于在 Vue 的原型上挂载一个 _init 方法
 */
import { initState } from './state.js'

// initMixin 会接受 Vue 构造函数
// -- 它会在 Vue 构造函数的原型上添加一个 _init 方法
export function initMixin(Vue) {
  // 将 _init 方法挂载在 Vue 原型上
  // -- 在初始化时，会接受一个 options 选项参数
  Vue.prototype._init = function (options) {
    // this 代表当前 Vue 实例对象，将其指向另一个常量 vm
    const vm = this
    // 同样将参数 options 选项也给这个 vm
    // -- 这样，后续代码操作就可以直接从 vm 上取到 options 了
    vm.$options = options
    // 将当前实例 vm 传给 initState , 用于初始化状态
    initState(vm)
  }
}
