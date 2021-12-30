/**
 * 这个文件主要用于在 Vue 的原型上挂载一个 _init 方法
 */
import { initState } from './state.js'
import { compileToFunction } from './compiler/index.js'
import { mountComponent } from './lifecycle.js'

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

    // 初始化状态之后，则需要进行模板编译
    // -- 如果传入了 el 属性，则需要将模板挂载在 el 节点上
    // -- 否则不挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  // 将 $mount 方法挂载在 Vue 原型上
  // -- 它接收一个 el 节点属性
  Vue.prototype.$mount = function (el) {
    // 同样，先获取到当前 Vue 实例
    const vm = this
    // 然后获取到当前实例的 options 参数
    const options = vm.$options
    // 再获取到 el DOM对象，并覆盖原来的值
    el = document.querySelector(el)

    // 接下来有一个顺序 render > template > el

    // 默认先查找有没有 render 方法
    if (!options.render) {
      // 没有 render 方法，则获取 template 属性，对模板进行编译
      let template = options.template

      // 然后判断 template 是否存在
      if (!template && el) {
        // 如果 template 属性也不存在，则将 el 节点所在的 HTML 内容作为模板
        template = el.outerHTML
      }

      // 然后将 template 转换为 render 函数
      if (template) {
        // compileToFunction 方法是从外面引入的
        const render = compileToFunction(template)
        options.render = render
      }
    }

    // 上面的结果，最终都会得到一个 options.render 方法
    // 下面我们要将这个模板挂载到页面
    // -- 通过 mountComponent 实现
    // -- 这个方法就是将 render -> 虚拟DOM -> 真实DOM 的方法
    return mountComponent(vm, el)
  }
}
