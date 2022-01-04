/**
 * 这个文件主要用于生成虚拟DOM，并转化虚拟DOM为真实DOM
 */
import { patch } from './vdom/patch.js'
import { Watcher } from './observer/watcher.js'

export function mountComponent(vm, el) {
  // 先将 el 赋值给 vm 的 $el 属性
  vm.$el = el

  // // 然后调用 _render 方法来调用模板编译过程中生成的　render 函数
  // // -- 用于生成 虚拟DOM
  // let vDom = vm._render()

  // // 最后在通过 vm._update 方法将 虚拟DOM 渲染到页面上
  // vm._update(vDom)

  // 这里，我们要把上面生成 虚拟DOM和渲染真实DOM 的方法放在一个函数里
  let updateComponent = () => {
    vm._update(vm._render())
    console.log('渲染页面结束-------')
  }

  // 然后，我们会在这里创建一个观察者实例 new Watcher()
  // -- 并将这个 updateComponent 方法 传递给观察者
  // -- 在观察者里面调用这个方法进行渲染
  // -- 每一个组件都有一个渲染 watcher
  new Watcher(vm, updateComponent, null, true)
}

export function lifecycleMixin(Vue) {
  // 将 _update 挂载在原型上
  Vue.prototype._update = function (vnode) {
    const vm = this
    // 调用 Patch 方法
    // -- 初始化渲染、更新渲染都通过这个 patch 方法
    // -- 该方法会返回一个真实的 DOM
    // -- 需要将其赋值给原来的节点，用于渲染到页面上
    // vm.$el = patch(vm.$el, vnode)

    // 现在需要保留一份上次的 vnode
    const prevVnode = vm._vnode
    // 然后将当前传入的 vnode 赋值给 vm
    vm._vnode = vnode

    // 如果是初始渲染，那么 vm._vnode 是不存在的
    if (!prevVnode) {
      // 所以这里直接将 vm.$el 作为旧节点传入
      vm.$el = patch(vm.$el, vnode)
    } else {
      // 否则， vm._vnode 存在，则为更新渲染
      // -- 需要把上次的虚拟DOM作为旧节点传入
      // -- 这里传入后，就会进行 diff 算法
      vm.$el = patch(prevVnode, vnode)
    }
  }
}
