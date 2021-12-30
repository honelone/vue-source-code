/**
 * Vue 的入口文件
 */
import { initMixin } from './init.js'
import { renderMixin } from './render.js'
import { lifecycleMixin } from './lifecycle.js'

// Vue 构造函数
function Vue(options) {
  // 调用初始化方法
  // -- 这个方法来自 initMixin
  // -- 使用 this 调用，表示这个方法是挂载在 Vue 原型上的
  this._init(options)
}

// 注意：这里要分离每个挂载原型方法

// 将 Vue 构造函数传给 initMixin
// -- 这个方法会在原型上添加一个 _init 方法
initMixin(Vue)

renderMixin(Vue)
lifecycleMixin(Vue)

export default Vue
