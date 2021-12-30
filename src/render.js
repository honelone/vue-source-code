/**
 * 这个文件是转化为虚拟DOM的主要方法
 */
import { createElement, createTextNode } from './vdom/index.js'

export function renderMixin(Vue) {
  // 将 _render 方法挂载在原型上
  // -- 这个方法用于生成虚拟DOM
  Vue.prototype._render = function () {
    // 同样获取到当前实例
    const vm = this
    // 然后获取到当前实例在 模板编译阶段生成的 render 函数
    const { render } = vm.$options
    // 然后通过 call 改变 render 的 this 指向为当前实例，并调用
    // -- 生成虚拟DOM
    const vnode = render.call(vm)
    // 最后返回这个虚拟DOM
    return vnode
  }

  // 下面就是在模板编译过程中的  _c  _v  _s 方法
  // 创建虚拟DOM元素
  Vue.prototype._c = function (...args) {
    return createElement(...args)
  }
  // 创建虚拟DOM文本
  Vue.prototype._v = function (text) {
    return createTextNode(text)
  }
  // 解析对象
  // -- 将数据转换为字符串
  Vue.prototype._s = function (val) {
    return val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : val
  }
}
