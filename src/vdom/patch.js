/**
 * 这个文件是将虚拟DOM转化为真实DOM的主要方法
 * 是渲染和更新页面的核心方法
 */

export function patch(oldVnode, newVnode) {
  // 这里，我们将上面的 vnode 转换成了 newVnode

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
    console.log('开始进行初次渲染')
    const oldElm = oldVnode
    const parentElm = oldElm.parentNode
    // 调用下面的 createElm 方法将 虚拟DOM转化成真实DOM
    let el = createElm(newVnode)
    // 然后将当前转化后的真实DOM 插入到 el 节点的下一个节点的前面
    parentElm.insertBefore(el, oldElm.nextSibling)
    // 再删除原来的节点
    parentElm.removeChild(oldVnode)
    // 最后返回这个真实DOM
    return el
  } else {
    // 更新渲染 ======

    // 对新旧节点的标签进行判断
    if (oldVnode.tag !== newVnode.tag) {
      console.log('标签不同，替换', oldVnode.tag, '为', newVnode.tag)
      // 如果不一致，则会替换掉旧节点
      // -- 通过 createElm 新建一个真实节点
      // -- 然后调用 replaceChild 方法，将旧标签替换为新标签
      // -- 这个方法需要在当前标签的父元素上去调用
      oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
    }

    // 如果旧节点是一个文本节点
    // -- 通过 tag 标签来判断，文本节点的 tag 标签没有值
    if (!oldVnode.tag) {
      // 则比较其文本内容
      if (oldVnode.text !== newVnode.text) {
        console.log('文本不同，替换', oldVnode.text, '为', newVnode.text)
        // 如果文本内容不同，则替换掉旧节点的文本
        oldVnode.el.textContent = newVnode.text
      }
    }

    // 到这里，上面两个判断都没有进入
    // -- 则代表当前新旧节点的标签一致，且非文本节点
    // -- 所以接下来，我们需要去比对其标签上的 属性

    // 为了节点复用，所以这里直接把 旧的虚拟DOM对应的真实DOM 赋值给 新的虚拟DOM的el属性
    const el = (newVnode.el = oldVnode.el)
    // 为了比对新旧节点的属性，我们还要改写 updateProperties 方法
    // -- 这里，我们直接将新旧节点传入
    updateProperties(newVnode, oldVnode.data)

    // 到这里，表示新旧节点的属性也相同
    // -- 所以，再接下来，我们需要去比对新旧节点的子级

    // 先分别获取新旧节点的子级
    const oldChildren = oldVnode.children || []
    const newChildren = newVnode.children || []
    // 判断新旧节点的子级
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 新旧节点都存在子级
      // -- 则需要一个新方法 updateChildren 来对其子级进行比较
      updateChildren(el, oldChildren, newChildren)
    } else if (oldChildren.length) {
      console.log('删除多余子节点：', oldChildren)
      // 只有旧节点有子级
      // -- 则需要将其子级删除
      el.innerHTML = ''
    } else if (newChildren.length) {
      console.log('新增子节点', newChildren)
      // 只有新节点有子级
      // -- 则需要将新节点的子级加入到当前真实DOM el 中
      for (let i = 0; i < newChildren.length; i++) {
        const child = newChildren[i]
        el.appendChild(createElm(child))
      }
    }
  }
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
// -- 重写后，这个方法还用于比较新旧节点的属性是否相同
// -- 并且接受两个参数，新节点 和 旧节点上的属性
function updateProperties(vnode, oldProps = {}) {
  // 先获取到这个 data 属性
  let newProps = vnode.data || {}

  // 拿到当前真实DOM节点
  // -- 上面已经通过 createElement 创建并设置了 el 属性指向
  let el = vnode.el

  // 然后，我们开始循环 旧节点上的属性
  // -- 如果新节点上没有这个属性，就会将其移除
  for (const key in oldProps) {
    if (!newProps[key]) {
      // 表示新节点上没有这个属性，则移除当前真实DOM el 上的这个属性
      // -- 注意，则这个时候真实DOM上的 el 就是旧节点的 el
      el.removeAttribute(key)
    }
  }

  // 对 style 样式作特殊处理
  const newStyle = newProps.style || {}
  const oldStyle = oldProps.style || {}
  // 循环旧节点的属性，如果新节点没有这个样式，则将真实DOM上对应的 style 设为空
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }

  // 最后，正常循环新节点上的属性，将新节点上的属性添加到真实DOM上
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

// 判断新旧节点的 标签 和 Key 是否相同
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}
// 用于新旧节点的子级比较
function updateChildren(parent, oldChildren, newChildren) {
  // 先获取新旧节点的
  // -- 起始下标和结束下标,以及其对应的节点
  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]

  // 根据 key值，来创建节点的子级的映射关系
  // -- 表示的是 key 值对应的节点的下标
  function makeIndexByKey(children) {
    let map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }
  // 生成旧节点的 Key-index 映射表
  let map = makeIndexByKey(oldChildren)

  // 接下来采用双指针的方式来进行新旧节点的比较
  // -- 当新旧节点的指针的起始位置小于结束位置时，才进行循环
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      // 如果当前 oldChildren 的开始指针 oldStartVnode 没有值，则向后移动一位
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      // 如果当前 oldChildren 的结束指针 oldEndVnode 值为空，则向前移动一位
      oldEndVnode = oldChildren[--oldEndIndex]
    }
    // 以下，我们会进行四种比较，分别是新旧节点的 头与头、尾与尾、头与尾、尾与头
    // -- 先是判断两者是否为同一 标签和Key值
    // -- 如果相同，则进行其内部节点的递归比较，调用 patch 方法
    // ---- 然后移动指针，向前或者向后，并进行下一次循环
    // -- 如果不相同，则会进行最后一种比较方法 —— 暴力比较法
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头和头对比
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 尾和尾对比
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 旧节点的头指针 和 新节点的尾指针
      patch(oldStartVnode, newEndVnode)
      // 将这个 旧节点的头指针 插入到 旧节点的尾指针 之后
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 旧节点的尾指针 和新节点的头指针
      patch(oldEndVnode, newStartVnode)
      // 将这个 旧节点的尾指针 插入到 旧节点的头指针 之前
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
      // 上述四种情况都不满足，那么执行暴力对比法
      // -- 根据旧节点的 key-index 映射表
      // -- 去查找 newChildren 当前的开始指针 newStartVnode 是否在这个映射表里面
      // -- 如果可以找到，表示移动了位置，则进行移动操作
      // -- 如果找不到，表示为新增的，则直接进行插入

      // 从旧节点 oldChildren 的 key-index映射表中去读取 newStartVnode 的 key
      // -- 如果有返回值，则存在，否则，不存在
      let moveIndex = map[newStartVnode.key]

      // 判断 moveIndex 是否为空
      if (!moveIndex) {
        // 如果 moveIndex 为空，则表示 旧节点没有这个节点
        // -- 所以我们需要 将当前新节点的开始指针 newStartVnode 插入到真实DOM中
        // -- 位置是 当前旧节点的开始指针的 前面
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        // 如果 moveIdnex 不为空，则表示 旧节点中有对应的 新节点的开始指针，只是它当前的位置和新节点的位置不匹配
        // 所以，我们要先获取到对应的旧节点
        let moveVnode = oldChildren[moveIndex]
        // 然后将 moveIndex 对应的旧节点的值 置空
        // -- 这个是占位操作，避免数组塌陷，用于防止旧节点移动走了之后破坏了初始的映射表位置
        oldChildren[moveIndex] = undefined
        // 再将这个拿到的旧节点插入到 当前旧节点的开始指针的 前面
        parent.insertBefore(moveVnode.el, oldStartVnode.el)
        // 最后再比较新新旧节点的差异
        // -- 注意，上面移动的是 Key值 相同的节点，但并不代表这两个节点是相同的，所以还要进行比较
        patch(moveVnode, newStartVnode)
      }
    }
  }

  // 如果旧节点循环完毕了，但是新节点还有
  // -- 则表示剩下的新节点需要被添加到头部或者尾部
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 这是一个优化写法 insertBefore的第一个参数是null等同于appendChild作用
      const ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      parent.insertBefore(createElm(newChildren[i]), ele)
    }
  }
  // 如果新节点循环完毕，但旧节点还有
  // -- 证明旧的节点需要直接被删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i]
      if (child != undefined) {
        parent.removeChild(child.el)
      }
    }
  }
}
