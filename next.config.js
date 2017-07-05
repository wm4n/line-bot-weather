const fs = require('fs')
const trash = require('trash')

module.exports = {
  webpack: (config, { dev }) => {
    // Perform customizations to webpack config
    config.plugins = config.plugins.filter(
      (plugin) => (plugin.constructor.name !== 'UglifyJsPlugin')
    )

    config.module.rules.push(
      {
        test: /\.css$/,
        use: [
          {
            loader: 'emit-file-loader',
            options: {
              name: 'dist/[path][name].[ext]'
            }
          },
          {
            loader: 'skeleton-loader',
            options: {
              procedure: function (content) {
                const fileName = `${this._module.userRequest}.json`
                const classNames = fs.readFileSync(fileName, 'utf8')

                trash(fileName)

                return ['module.exports = {',
                  `classNames: ${classNames},`,
                  `stylesheet: \`${content}\``,
                  '}'
                ].join('')
              }
            }
          },
          'postcss-loader'
        ]
      }
    )

    if(config.node) {
      config.node.fs = 'empty';
      config.node.child_process = 'empty';
    }
    else {
      config.node = {
        fs: 'empty',
        child_process: 'empty'
      }
    }
   
    config.devtool = 'cheap-module-eval-source-map';

    // Important: return the modified config
    return config
  },
  webpackDevMiddleware: (config) => {
    // Perform customizations to webpack dev middleware config

    // Important: return the modified config
    return config
  }
}