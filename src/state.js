/**
 * 这个文件主要用于初始化 options 中的参数
 */
import { observe } from './observer/index.js'

// initState 会接受一个 Vue 实例 vm
export function initState(vm) {
  // vm 是当前实例对象
  // -- 这里要将 init 初始化时，挂载在 vm 上的 options 取出来
  const opts = vm.$options
  // 然后在下面分别初始化 options 里面的内容
  // -- 注意顺序 props > methods > data > computed > watch

  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethod(vm)
  }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}

function initProps(vm) {}
function initMethod(vm) {}

// 初始化 data
function initData(vm) {
  // 先获取到 vm 中的 data
  let data = vm.$options.data

  // vm.$options.data 可以是一个对象，也可以是一个函数，所以这里要处理一下
  // -- 通过 call 改变 this，从而获取到 vm.$options.data函数 返回的 data 对象
  // -- 然后我们将这个 data 挂在 vm 的 _data 属性上
  // -- 并且将其赋值给这里的 data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  // 先使用 proxy 进行代理
  // -- 代理的目的就是让我们可以通过 vm 去访问数据
  // -- 即原来需要通过 vm._data.xxx 去访问
  // -- 代理后可以通过 vm.xxx 去访问
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  // 在代理之后就通过 observe 来进行数据的观测
  observe(data)
}
function initComputed(vm) {}
function initWatch(vm) {}

// 代理方法 -- 即让 vm._data.key ==> vm.key
function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get() {
      return object[sourceKey][key]
    },
    set(newValue) {
      object[sourceKey][key] = newValue
    },
  })
}
