const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8888;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/rooms/:roomId', express.static(path.join(__dirname, './public')));

const clientBundles = './public/services';
const serverBundles = './templates/services';
const serviceConfig = require('./service-config.json');
const services = require('./loader.js')(clientBundles, serverBundles, serviceConfig);

const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('./templates/layout');
const App = require('./templates/app');
const Scripts = require('./templates/scripts');

// I believe this part is unnecessary because I am not using styled components
// However, I will test it with this first
// I may need to refactor so that I just run ReactDom.renderToString without this
// extraneous mapping
const renderComponents = (components, props = {}) => {
  return Object.keys(components).map(item => {
    let component = React.createElement(components[item], props);
    return ReactDom.renderToString(component);
  });
};

app.get('/items/:id', function(req, res) {
  let components = renderComponents(services, {itemid: req.params.id});
  res.end(Layout(
    'DreamBnb Proxy',
    App(...components),
    Scripts(Object.keys(services))
  ));
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});
