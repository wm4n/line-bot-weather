// ./pages/_document.js
import Document, {Head, Main, NextScript} from 'next/document'
import flush from 'styled-jsx/server'

export default class MyDocument extends Document {
  static getInitialProps({renderPage}) {
    const {html, head, errorHtml, chunks} = renderPage()
    const styles = flush()
    return {html, head, errorHtml, chunks, styles}
  }

  render() {
    return (
      <html>
        <Head>
          <style>{`body { margin: 0; } /* custom! */`}</style>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          <link rel="stylesheet" href="static/css/rc-slider/index.css" />
          <link rel="stylesheet" href="static/css/rc-tooltip/bootstrap.css" />
          <link rel="stylesheet" href="static/css/foundation.css" />
          <link rel="stylesheet" href="static/css/app.css" />
        </Head>
        <body className="custom_class">
          {this.props.customValue}
          <script src="static/js/vendor/jquery.js"></script>
          <script src="static/js/vendor/what-input.js"></script>
          <script src="static/js/vendor/foundation.min.js"></script>
          <script src="static/js/app.js"></script>
          <Main/>
          <NextScript/>
        </body>
      </html>
    )
  }
}