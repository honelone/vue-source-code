/**
 * 这个文件用于将 tempalte 模板转换为 render 函数
 */
import { parse } from './parse'
import { generate } from './generate'

export function compileToFunction(template) {
  // 先将 template 转化为 ast
  let ast = parse(template)
  // console.log(ast)

  // 再将 ast 转化为代码，也就是字符串拼接（模板引擎）
  // -- code 类似于这样 _c('div', {id:app}, _c('p', undefined))
  let code = generate(ast)
  // console.log(code)

  // 我们需要使用函数调用的方式将这个 code 模板字符串返回出去
  // -- 使用 with 语法，将当前作用域改变为 this
  // -- 这样模板字符串中的 插值表达式的变量 就可以直接使用，而不用表明是由谁来调用的
  // -- 而这里的 this 就是外面在调用 render 方法时决定的
  let renderFn = new Function(`with(this){ return ${code} }`)
  // console.log(renderFn)

  // 这个即最终的 render 函数
  // -- 在调用 render 函数时，可以使用 call 改变 this
  // -- 然后会通过 _c,_v,_s 这些方法进行 解析、挂载、渲染
  // -- 至于 _c,_v,_s这些方法，在 vdom/index.js 文件中定义了的
  return renderFn
}
