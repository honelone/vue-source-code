/**
 * 这个文件用于定义 Observer 观察者，也就是数据劫持
 * 主要会使用到 Object.defineProperty()
 */

// 引入重写的数组方法
import { arrayMethods } from './array.js'
// 引入订阅器
import { Dep } from './dep.js'

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
  // 这里要对当前数据的属性值也进行一个数据劫持，因为这个数据也可能是对象
  // -- 所以这里是一个递归的数据劫持方法
  // -- 然后我们要用一个变量来接收它
  let childOb = observe(value)

  // 在进行数据劫持之前，我们要为每一个数据都创建一个订阅器
  // -- 利用上面引入的 Dep 类来实例化一个订阅器
  let dep = new Dep()

  Object.defineProperty(data, key, {
    get() {
      console.log('获取到值了', value)

      // 在返回响应式数据之前，我们要对其进行依赖收集
      // -- 在使用这个数据时，就会触发 getter 函数
      // -- 那么我们就在这个函数中进行依赖收集
      // -- 当然，这里还要注意一点，就是数组的依赖收集和对象的依赖收集不同
      // -- 所以这里还要进行一个判断

      // 1.首先进行一个订阅者（观察者）的判断
      // -- 如果有观察者，才会进行依赖的收集
      if (Dep.target) {
        // 2.然后触发实例上的 depend 方法
        dep.depend()
        // 3.接下来进行一个判断
        // -- 如果属性值是对象或者数组，就会有返回值
        // -- 然后就要收集属性值的依赖
        if (childOb) {
          childOb.dep.depend()
          // 然后如果属性值是数组，就会对数组内部的数据进行依赖收集
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }

      // 最后返回这个值
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

      // 在设置了新值之后，我们要发出一个通知给订阅器，表示这个数据已经被更改了
      // -- 这里通过调用订阅器实例上的 notify 方法
      // -- 注意，数组的派发通知方法在重写的方法里面
      dep.notify()
    },
  })
}

// 数组的依赖收集
function dependArray(value) {
  const length = value.length
  let e
  for (let i = 0; i < length; i++) {
    e = value[i]
    // 进行判断，然后收集依赖
    e && e.__ob__ && e.__ob__.dep.depend()
    // 递归
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
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
