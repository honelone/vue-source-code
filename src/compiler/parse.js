/**
 * 这个文件主要用于生成 render 函数
 */

// 以下为源码的正则
// -- `?:` 这个语法表示匹配不捕获
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 匹配标签名,如 <div> 标签的 div
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // 匹配特殊标签， 如 <div:abc> 标签中的 abc

// 匹配开始标签，如 <abc-123> 这个标签中的标签名 abc-123
// -- 匹配结果为一个数组，以 <abc-123> 为例，它会返回
// -- ['<abc-123', 'abc-123']
const startTagOpen = new RegExp(`^<${qnameCapture}`)

// 匹配结束标签，如 </abc-123> 这个标签中的标签名 abc-123
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

const startTagClose = /^\s*(\/?)>/ // 匹配标签结束符号 `>`或者`/>`

// 匹配标签上的属性，如 id="app"
// -- 匹配结果为一个数组，以 id="app" 举例
// -- ['id="app"', 'id', '=', 'app', undefined, undefined]
// -- 如果属性上使用 单引号，以 id='app' 举例
// -- ["id='app'", 'id', '=', undefined, 'app', undefined]
// -- 如果属性上不使用引号， 以 id=app 举例
// -- ['id=app', 'id', '=', undefined, undefined, 'app']
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配插值表达式 {{}}

let root, currentParent // 代表根节点 和 当前父节点
// 栈结构 用来存储标签
// -- 每匹配到一个开始标签，则将其 push 进 stack
// -- 每匹配到一个结束标签，则将 stack 最后一个元素 pop 出去
// -- 通过栈结构来处理其上下级关系
let stack = []

// 标识元素和文本type
const ELEMENT_TYPE = 1
const TEXT_TYPE = 3

// 生成ast方法 —— 主要是对开始标签进行处理
function createASTElement(tagName, attrs) {
  return {
    tag: tagName,
    type: ELEMENT_TYPE,
    children: [],
    attrs,
    parent: null,
  }
}

// 对开始标签进行处理
function handleStartTag({ tagName, attrs }) {
  let element = createASTElement(tagName, attrs)
  if (!root) {
    // 如果没有根节点，则将当前元素作为根节点
    root = element
  }
  // 然后将当前元素标记为父 AST 树
  currentParent = element
  // 将当前元素——开始标签 放入 stack 中
  stack.push(element)
}

// 对结束标签进行处理
// -- 每遇到一个结束标签，那么它对应的开始标签就是 stack 的最后一个元素——栈顶元素
// -- 比如 <div><span></span></div>
// -- 当遇到第一个结束标签</span > 时，会匹配到栈顶 < span > 元素对应的 ast 并取出来
// -- 结束标签的处理主要是为了处理 parent 和 children 这两个属性
function handleEndTag(tagName) {
  // 将当前匹配到结束标签的开始标签 对应的元素取出来
  let element = stack.pop()
  // 调整当前父元素为当前的栈顶元素
  currentParent = stack[stack.length - 1]
  // 建立 parent 和 children 关系
  if (currentParent) {
    // 这个取出来的元素的父节点就是当前的父元素（上面已经修改）
    element.parent = currentParent
    // 然后将当前取出来的元素 push 进当前父元素的 children
    currentParent.children.push(element)
  }
}

// 对文本进行处理
function handleChars(text) {
  // 去掉空格
  text = text.replace(/\s/g, '')
  if (text) {
    // 将当前文本放入当前的父 AST 节点的 children 中
    currentParent.children.push({
      type: TEXT_TYPE,
      text,
    })
  }
}

// 解析标签生成ast核心
export function parse(html) {
  // 通过 while 循环来不停去解析 HTML 字符串
  while (html) {
    // 查找<
    let textEnd = html.indexOf('<')
    // 如果索引为 0， 即 `<` 在第一个位置，那么证明接下来就是一个标签
    // -- 不管是开始还是结束标签
    if (textEnd === 0) {
      // 然后用开始标签正则 去解析HTML
      // -- 调用 parseStartTag 方法
      const startTagMatch = parseStartTag()
      // 如果有解析结果，则证明当前是开始标签
      if (startTagMatch) {
        // 那么就把解析好的这个开始标签的 标签名和属性解析生成 ast
        handleStartTag(startTagMatch)
        continue
      }

      // 匹配结束标签 </
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        // 将结束标签解析生成 AST
        handleEndTag(endTagMatch[1])
        continue
      }
    }

    let text
    // 形如 hello<div></div>
    // 如果索引不为 0，则表示这里是一个空文本
    // -- 所以这里获取并截取文本
    if (textEnd >= 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      // 对文本解析成 AST
      handleChars(text)
    }
  }

  // 匹配开始标签
  function parseStartTag() {
    // 用当前 HTML 去匹配开始标签
    const start = html.match(startTagOpen)

    // 如果有值。则从返回的数组中取值
    // -- 并调用 advance 方法去截取 HTML 字符串
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      }
      // 匹配到了开始标签，就截取掉
      // -- start[0] 即为 <标签
      // -- 后面的内容可能是属性，可能是结束 `>`，需要另外处理
      // -- 所以这里就截取 <标签 的长度
      advance(start[0].length)

      // 开始匹配属性
      // end 代表结束符号 > ， attr 表示匹配的属性
      let end, attr
      // 这里表示 如果不是匹配到了结束标签 并且匹配到了属性
      // -- 那么就对 HTML 截取属性的长度，并保存标签上的属性到 attr 中
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        attr = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5], // 这里是因为正则捕获支持 双引号 单引号 和无引号的属性值
        }
        match.attrs.push(attr)
      }
      // 这里表示匹配到了结束的 `>`了， 即开始标签解析完毕
      if (end) {
        advance(1) // 把这个 `>` 截掉
        return match // 这个 match 就是我们需要的 用对象描述的 标签名和属性
      }
    }
  }

  // 这个方法用于截取 HTML 字符串
  // -- n 代表截取的位置，subString 表示从 n 截取到字符串末尾
  function advance(n) {
    html = html.substring(n)
  }
  //   返回生成的ast
  return root
}
