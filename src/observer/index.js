/**
 * 这个文件用于定义 Observer 观察者，也就是数据劫持
 * 主要会使用到 Object.defineProperty()
 */
import { arrayMethods } from './array.js'

// 观测类
class Observe {
  // 注：到这里 value 就是我们的 data 数据
  constructor(value) {
    // 先添加一个 __ob__ 属性
    // -- 在观测数据时，可以用于检测数据是否已经被观察过，防止已经被响应式观察的数据反复被观测
    // -- 在重写数组方法时，可以通过这个属性直接获取 Observer 实例的相关方法
    // -- 并且， 这个属性要配置为不可遍历，否则后面会造成死循环
    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true,
    })

    // 数组的处理
    // -- 如果数组不作处理的话，它会按照对象的方式进行观测
    // -- 会对数组索引（下标）的方式对数组进行劫持
    // -- 如果数组内部还是一个对象，则无法进行劫持
    // -- 而且对数组索引进行劫持的方法会产生性能问题
    // ---- 性能问题指的是数组是顺序排列的，其值不是和索引一一对应的
    // ---- 如果插入/删除了某个元素，那么其后面所有的元素的索引都会变
    // ---- 这就导致会不断的去进行数据劫持，从而产生性能问题
    // -- 所以这里要对数组内的每一项进行遍历观测
    if (Array.isArray(value)) {
      // 我们一般很少去通过索引来操作数组，一般都是用数组的原生方法来进行数组的更新
      // -- 所以这里要重写数组的原生方法，以更新响应式的数组数据
      // -- 把当前 value 的原型上的数组方法替换为重写的方法 arrayMethods
      value.__proto__ = arrayMethods

      // 调用这个方法，来对数组内的每一项进行观测
      this.observeArray(value)
    } else {
      // 对 对象的观测
      this.walk(value)
    }
  }
  // Observe类的方法
  walk(data) {
    // 先获取到 data 上的所有 Key
    const keys = Object.keys(data)
    // 遍历开始进行数据劫持
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = data[key]
      // 调用方法进行劫持
      defineReactive(data, key, value)
    }
  }
  // 对于数组的劫持
  // -- 遍历数组，对数组的每一项进行劫持
  observeArray(value) {
    for (let i = 0; i < value.length; i++) {
      observe(value[i])
    }
  }
}

// 这个方法就是数据劫持的核心
// -- 主要通过 Object.defineProperty 方法 劫持 setter/getter
function defineReactive(data, key, value) {
  observe(value) // 递归实现深度检测
  Object.defineProperty(data, key, {
    get() {
      console.log('获取到值了', value)
      return value
    },
    set(newValue) {
      // 如果前后值相等，则直接返回
      if (newValue == value) return

      // 继续劫持
      // -- 因为用户可能设置的是一个对象
      observe(newValue)

      console.log('设置了新值', newValue)
      value = newValue
    },
  })
}

// 创建 Observe 实例
export function observe(value) {
  // 进行数据劫持之前需要进行判断
  // -- 如果 value 是对象才会进行数据劫持
  // -- 否则普通数据不会进行劫持的
  // -- 支持递归调用以劫持深层对象
  // -- 如果嵌套层级过深 ，项目的性能会受到影响
  // -- 注意，第一次传过来的数据一定是一个对象
  if (Object.prototype.toString.call(value) == '[object Object]' || Array.isArray(value)) {
    return new Observe(value)
  }
}
