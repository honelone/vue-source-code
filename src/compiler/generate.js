const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配插值表达式 {{}} 里面的内容

// 处理子节点中的 AST
// -- 主要包含处理文本核心
// -- 这里只考虑普通文本和变量表达式{{}}的处理
// -- 对指令、插槽等暂不处理
function gen(node) {
  // 判断节点类型来判断是文本还是元素节点

  // 如果是元素类型
  if (node.type == 1) {
    // 递归创建
    return generate(node)
  } else {
    // 如果是文本节点
    let text = node.text

    // 如果不存在插值表达式 {{}}
    // -- 通过上面正则进行匹配
    if (!defaultTagRE.test(text)) {
      // 直接返回
      return `_v(${JSON.stringify(text)})`
    }
    // 如果存在插值表达式，如 a{{name}} ，则需要拼接为
    // -- _v('a' + _s(name))

    // 正则是全局模式，每次都需要重置正则的 lastIndex 属性为索引 0，不然会引发匹配bug
    let lastIndex = (defaultTagRE.lastIndex = 0)
    let tokens = [] // 用数组来存储每一段数据
    let match, index

    while ((match = defaultTagRE.exec(text))) {
      // match为正则匹配返回的内容，是一个数组

      // index 代表匹配到的 {{ 的位置
      index = match.index
      // 如果这个 index 位置 大于正则的起始位置
      // 则表示在这之前有普通的文本内容
      if (index > lastIndex) {
        // 所以这里在 tokens 里面放入普通文本
        // -- 通过 slice 来截取这一段位置
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }

      // 然后将匹配到的插值表达式里面的内容放入 tokens数组中
      tokens.push(`_s(${match[1].trim()})`)

      // 匹配指针后移
      // -- 这个指针的位置表示从字符串的哪一个索引开始进行匹配
      // 这里将其移到插值表达式之后的位置
      lastIndex = index + match[0].length
    }
    // 如果匹配完了花括号， text里面还有剩余的普通文本，那么继续 push 进 tokens
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    // 最后通过 join 将文本内容进行拼接
    return `_v(${tokens.join('+')})`
  }
}

// 处理子节点
// -- children 是一个数组
function getChildren(el) {
  const children = el.children
  if (children) {
    // 先遍历 children 数组，然后用 join 方法拼接
    // -- 通过 gen 方法将当前元素传入
    // -- 然后根据其类型来处理元素或文本
    return `${children.map(c => gen(c)).join(',')}`
  }
}
// 处理属性，拼接成属性的字符串
function genProps(attrs) {
  let str = ''

  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    // 对样式的特殊处理
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':') // 解构
        obj[key] = value //赋值
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  // 返回，还要去除最后一个符号
  return `{${str.slice(0, -1)}}`
}

// 递归创建生成code
// -- 这个 code 就是用 _c,_v,_s 拼接而成的 字符串，也就是模板引擎
// -- 这里的 _c,_v,_s 分别是用来 创建元素，创建文本，处理对象的方法
// -- 通过递归 AST 树，从其中获取到标签和属性，并拼接成字符串
// -- genProps 用来处理属性
// -- getChildren 用来处理子节点
export function generate(el) {
  let children = getChildren(el)

  let code = `_c('${el.tag}',${el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'}${
    children ? `,${children}` : ''
  })`

  return code
}
