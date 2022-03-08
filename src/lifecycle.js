/**
 * 这个文件主要用于生成虚拟DOM，并转化虚拟DOM为真实DOM
 */
import { _render } from './render.js'
import { patch } from './vdom/patch.js'

export function mountComponent(vm, el) {
  // 先将 el 赋值给 vm 的 $el 属性
  vm.$el = el

  // 然后调用 _render 方法来调用模板编译过程中生成的 render 函数
  // -- 用于生成 虚拟DOM
  let vDom = vm._render()

  // 最后在通过 vm._update 方法将 虚拟DOM 渲染到页面上
  vm._update(vDom)
}

export function lifecycleMixin(Vue) {
  // 将 _update 挂载在原型上
  Vue.prototype._update = function (vnode) {
    const vm = this
    // 调用 Patch 方法
    // -- 初始化渲染、更新渲染都通过这个 patch 方法
    // -- 该方法会返回一个真实的 DOM
    // -- 需要将其赋值给原来的节点，用于渲染到页面上
    // -- 该方法接收两个参数，第一个参数为 旧节点， 第二个参数为 新节点——即上面生成的 虚拟DOM
    vm.$el = patch(vm.$el, vnode)
  }
}
