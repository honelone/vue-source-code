import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

// 常见的模块规范 import export (ESModule)   module.exports require (commonjs)
// AMD 比较老的模块规范  systemjs 模块规范

// ES6Module  commonjs  umd(支持amd 和 cmd)
export default {
  input: './src/index.js', // 打包入口文件
  output: {
    file: 'dist/umd/vue.js', // 打包到 dist/umd 内的 vue.js -- 出口文件
    name: 'Vue', // 打包后的全局变量的名字
    format: 'umd', // 使用 umd 模块化类型
    sourcemap: true, // es6 -> es5 开启源码调试，可以找到源代码的报错位置
  },
  plugins: [
    babel({ // 执行 babel 时自动去 .babelrc 文件加载对应配置
      exclude: 'node_modules/**' // 排除
    }),
    process.env.ENV === 'development' ? serve({ // 开端口
      open: true, // 自动打开
      openPage: '/public/index.html', // 默认打开 HTML 地址
      port: 9527,
      contentBase: ''
    }) : null
  ]
}