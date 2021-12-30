/**
 * 这个文件用于重写数组原型上的方法
 */

// 先保留数组原型
const oldArrayMethods = Array.prototype

// 然后将 arrayMethods 继承自数组原型
// -- 数组访问方法可以通过原型链查找方法
export const arrayMethods = Object.create(oldArrayMethods)

// 定义需要重写的数组方法
// -- 因为这些方法才会改变原数组
const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']

// 遍历方法开始重写
methodsToPatch.forEach(method => {
  arrayMethods[method] = function (...args) {
    // 先调用原生的数组方法，并保留执行结果
    // -- 这里是面向切片编程思想（AOP）
    // -- 即不破坏封装的前提下，动态的扩展功能
    // -- 在不改变原数组方法执行结果的情况下，将我们自己的逻辑处理加入进去
    const result = oldArrayMethods[method].apply(this, args)

    // 在这里，我们就需要加入自己的逻辑处理了
    // -- 即，如果我们在数组新增的元素是一个对象
    // -- 那么我们还要继续观测这个元素

    // 我们先用这个变量来接收当前要插入数组的新元素
    let inserted
    // 根据原方法的功能在这里做处理
    switch (method) {
      // 调用 push、unshift 方法，会向数组添加元素
      // -- 我们用 inserted 来接收这个元素
      // -- args 是数组
      case 'push':
        console.log('push了', args)
        inserted = args
        break
      case 'unshift':
        console.log('unshift了', args)
        inserted = args
        break
      // 调用 splice 方法，会有3个参数
      // -- 第3个参数即是新增的元素
      // -- 所以 inserted 要取第三个值（索引为2）
      case 'splice':
        console.log('splice了', args)
        inserted = args.splice(2)
      default:
        break
    }

    // 在这里，如果有新增的内容，则要调用数组的观测方法
    // -- 所以要通过 __ob__ 这个属性先获取到当前实例
    // -- 然后调用实例上的观测方法

    // 先获取到当前的实例
    const ob = this.__ob__
    // 然后判断并观测
    // -- 观测的就是新增的元素，也即 inserted
    if (inserted) ob.observeArray(inserted)

    return result
  }
})
