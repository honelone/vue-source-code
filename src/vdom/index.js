/**
 * 这个文件是生成虚拟节点的方法
 */
// 首先需要定义一个 Vnode 类
// -- 用于创建对应的 虚拟节点
export default class Vnode {
  // 标签名 、 数据/属性、唯一值、子级、文本内容
  // -- 注意，这里的 this 就是当前的节点 ？？
  constructor(tag, data, key, children, text) {
    this.tag = tag
    this.data = data
    this.key = key
    this.children = children
    this.text = text
  }
}

// 然后是创建元素 Vnode
export function createElement(tag, data = {}, ...children) {
  let key = data.key
  return new Vnode(tag, data, key, children)
}

// 再是创建文本 Vnode
export function createTextNode(text) {
  return new Vnode(undefined, undefined, undefined, undefined, text)
}
