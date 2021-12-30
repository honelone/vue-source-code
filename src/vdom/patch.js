/**
 * 这个文件是将虚拟DOM转化为真实DOM的主要方法
 * 是渲染和更新页面的核心方法
 */
export function patch(oldVnode, vnode) {
  // oldVnode -- 即我们传入的需要改变的节点
  // -- 如果是第一次渲染，那么这个 oldVnode 就是传入的 el 选项
  // -- 如果不是第一次渲染，那么 oldVnode 将会被替换为当前需要改变的节点

  // 先获取 oldVnode 的节点类型
  // -- 判断它是否是一个真实的元素
  // -- 如果有这个节点类型，说明它是一个 DOM元素，表示为更新渲染
  // -- 否则为初始渲染
  const isRealElement = oldVnode.nodeType

  // 对 oldVnode 的节点类型进行判断
  if (isRealElement) {
    // 初次渲染 ======
    const oldElm = oldVnode
    const parentElm = oldElm.parentNode
    // 调用下面的 createElm 方法将 虚拟DOM转化成真实DOM
    let el = createElm(vnode)
    // 然后将当前转化后的真实DOM 插入到 el 节点的下一个节点的前面
    parentElm.insertBefore(el, oldElm.nextSibling)
    // 再删除原来的节点
    parentElm.removeChild(oldVnode)
    // 最后返回这个真实DOM
    return el
  }

  // TODO 如果是一个真实的元素，则进行 diff 算法，待完成
}

// 将虚拟DOM转化成真实DOM的方法
function createElm(vnode) {
  // 先获取到当前虚拟DOM的一些属性
  let { tag, data, key, children, text } = vnode

  // 判断虚拟DOM是元素节点还是文本节点
  // -- 如果有 tag 属性，则表示为元素节点
  // -- 否则为文本节点
  if (typeof tag === 'string') {
    // 元素节点 ======

    // 先让虚拟DOM的 el 属性指向其真实的DOM
    // -- 即通过 createElement 创建一个真实的 tag 标签
    vnode.el = document.createElement(tag)

    // 然后解析虚拟DOM属性
    updateProperties(vnode)

    // 递归子节点
    // -- 递归后的子节点将会被挂载在当前节点上
    children.forEach(child => {
      return vnode.el.appendChild(createElm(child))
    })
  } else {
    // 文本节点 ======
    vnode.el = document.createTextNode(text)
  }

  return vnode.el
}

// 用于解析 虚拟DOM的 data 属性，并将其映射到真实DOM上
function updateProperties(vnode) {
  // 先获取到这个 data 属性
  let newProps = vnode.data || {}

  // 拿到当前真实DOM节点
  // -- 上面已经通过 createElement 创建并设置了 el 属性指向
  let el = vnode.el

  // 循环属性
  for (let key in newProps) {
    if (key === 'style') {
      // 样式的特殊处理
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      // 类的特殊处理
      el.className = newProps.class
    } else {
      // 普通属性的处理
      el.setAttribute(key, newProps[key])
    }
  }
}
