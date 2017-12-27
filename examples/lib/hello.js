(function () {
'use strict';

var text = 0;
var element = 1;
var stateless = 2;
var stateful = 3;

function proxyProp(name, value) {
  if (/^on/.test(name)) {
    return function(e) {
      value.call(this, e);
      if (e.update !== false) {
        updateRoots();
      }
    };
  }
  return value;
}

function realizeNode(node) {
  var realized;
  if (node.type == text) {
    realized = document.createTextNode(node.text);
  } else if (node.type == element) {
    realized = document.createElement(node.tag);
    for (var i in node.props) {
      if (i == 'autofocus') {
        setTimeout(function () { return realized.select(); });
        continue;
      }
      realized[i] = proxyProp(i, node.props[i]);
    }
    node.children.forEach(function (child) {
      realized.appendChild(realizeNode(child));
    });
  } else if (node.type == stateless) {
    realized = realizeNode(node.rendered = node.tag.call(null, node.props, node.children));
  } else {
    var state = {};
    for (var i$1 in node.tag) {
      var value = node.tag[i$1];
      if (typeof value == 'function') {
        value = value.bind(state);
      }
      state[i$1] = value;
    }
    realized = realizeNode(node.rendered = state.render(node.props, node.children));
    node.state = state;
  }
  return node.realized = realized;
}

function replaceNode(node, next) {
  var realized = node.realized;
  if (node.tag != next.tag) {
    realized.parentNode.replaceChild(realizeNode(next), realized);
  } else {
    if (node.type == text) {
      if (node.text != next.text) {
        realized.textContent = next.text;
      }
    } else if (node.type == element) {
      for (var i in next.props) {
        if (node.props[i] != next.props[i]) {
          realized[i] = proxyProp(i, next.props[i]);
        }
      }
      var x = node.children.length;
      var y = next.children.length;
      if (x < y) {
        for (var i$1 = x; i$1 < y; i$1++) {
          realized.appendChild(realizeNode(next.children[i$1]));
        }
      } else if (x > y) {
        for (var i$2 = y; i$2 < x; i$2++) {
          realized.removeChild(node.children[i$2].realized);
        }
      }
      var z = Math.min(x, y);
      for (var i$3 = 0; i$3 < z; i$3++) {
        replaceNode(node.children[i$3], next.children[i$3]);
      }
    } else if (node.type == stateless) {
      next.rendered = next.tag.call(null, next.props, next.children);
      replaceNode(node.rendered, next.rendered);
      node.realized = next.rendered.realized;
    } else {
      next.state = node.state;
      next.rendered = next.state.render(next.props, next.children);
      replaceNode(node.rendered, next.rendered);
      node.realized = next.rendered.realized;
    }
    next.realized = node.realized;
  }
}

function updateNode(node) {
  if (node.type == text) {
  } else if (node.type == element) {
    node.children.forEach(updateNode);
  } else if (node.type == stateless) {
    var rendered = node.rendered;
    node.rendered = node.tag.call(null, node.props, node.children);
    replaceNode(rendered, node.rendered);
    node.realized = node.rendered.realized;
  } else {
    var rendered$1 = node.rendered;
    node.rendered = node.state.render(node.props, node.children);
    replaceNode(rendered$1, node.rendered);
    node.realized = node.rendered.realized;
  }
}

function flattenChildren(children) {
  return children.reduce(function (result, child) {
    if (child === undefined || child === null) {
    } else if (Array.isArray(child)) {
      result.push.apply(result, child);
    } else if (typeof child == 'object' && child.isNode) {
      result.push(child);
    } else {
      result.push({
        isNode: true,
        type: text,
        tag: '#text',
        text: child
      });
    }
    return result;
  }, []);
}

function createNode(tag, props) {
  var arguments$1 = arguments;

  var children = [], len = arguments.length - 2;
  while ( len-- > 0 ) { children[ len ] = arguments$1[ len + 2 ]; }

  return {
    isNode: true,
    type: typeof tag == 'string'
      ? (children = flattenChildren(children), element)
      : typeof tag == 'function'
        ? stateless
        : stateful,
    tag: tag,
    props: props || {},
    children: children
  };
}

var roots = [];
var timeout;

function attachRoot(container, root) {
  roots.push(root);
  container.appendChild(realizeNode(root));
}

function updateRoots() {
  if (!timeout) {
    timeout = setTimeout(function () {
      roots.forEach(updateNode);
      timeout = undefined;
    }, 16);
  }
}

var name = '';

var Hello = function () { return createNode( 'div', null, 
  createNode( 'p', null, "Name: ", createNode( 'input', { value: name, oninput: function (e) { return name = e.target.value; } }) ), 
  createNode( 'p', null, "Hello ", name, "!" )
); };

attachRoot(document.body, createNode( Hello, null ));

}());
