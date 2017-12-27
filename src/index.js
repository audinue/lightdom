let text = 0;
let element = 1;
let stateless = 2;
let stateful = 3;

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
  let realized;
  if (node.type == text) {
    realized = document.createTextNode(node.text);
  } else if (node.type == element) {
    realized = document.createElement(node.tag);
    for (let i in node.props) {
      if (i == 'autofocus') {
        setTimeout(() => realized.select());
        continue;
      }
      realized[i] = proxyProp(i, node.props[i]);
    }
    node.children.forEach(child => {
      realized.appendChild(realizeNode(child));
    });
  } else if (node.type == stateless) {
    realized = realizeNode(node.rendered = node.tag.call(null, node.props, node.children));
  } else {
    let state = {};
    for (let i in node.tag) {
      let value = node.tag[i];
      if (typeof value == 'function') {
        value = value.bind(state);
      }
      state[i] = value;
    }
    realized = realizeNode(node.rendered = state.render(node.props, node.children));
    node.state = state;
  }
  return node.realized = realized;
}

function replaceNode(node, next) {
  let realized = node.realized;
  if (node.tag != next.tag) {
    realized.parentNode.replaceChild(realizeNode(next), realized);
  } else {
    if (node.type == text) {
      if (node.text != next.text) {
        realized.textContent = next.text;
      }
    } else if (node.type == element) {
      for (let i in next.props) {
        if (node.props[i] != next.props[i]) {
          realized[i] = proxyProp(i, next.props[i]);
        }
      }
      let x = node.children.length;
      let y = next.children.length;
      if (x < y) {
        for (let i = x; i < y; i++) {
          realized.appendChild(realizeNode(next.children[i]));
        }
      } else if (x > y) {
        for (let i = y; i < x; i++) {
          realized.removeChild(node.children[i].realized);
        }
      }
      let z = Math.min(x, y);
      for (let i = 0; i < z; i++) {
        replaceNode(node.children[i], next.children[i]);
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
    let rendered = node.rendered;
    node.rendered = node.tag.call(null, node.props, node.children);
    replaceNode(rendered, node.rendered);
    node.realized = node.rendered.realized;
  } else {
    let rendered = node.rendered;
    node.rendered = node.state.render(node.props, node.children);
    replaceNode(rendered, node.rendered);
    node.realized = node.rendered.realized;
  }
}

function flattenChildren(children) {
  return children.reduce((result, child) => {
    if (child === undefined || child === null) {
    } else if (Array.isArray(child)) {
      result.push(...child);
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

function createNode(tag, props, ...children) {
  return {
    isNode: true,
    type: typeof tag == 'string'
      ? (children = flattenChildren(children), element)
      : typeof tag == 'function'
        ? stateless
        : stateful,
    tag,
    props: props || {},
    children
  };
}

let roots = [];
let timeout;

function attachRoot(container, root) {
  roots.push(root);
  container.appendChild(realizeNode(root));
}

function detachRoot(root) {
  let index = roots.indexOf(root);
  if (index > -1) {
    roots.splice(index, 1);
    root.realized.parentNode.removeChild(root);
  }
}

function updateRoots() {
  if (!timeout) {
    timeout = setTimeout(() => {
      roots.forEach(updateNode);
      timeout = undefined;
    }, 16);
  }
}

export { createNode as h }
export { attachRoot as attach }
export { detachRoot as detach }
export { updateRoots as update }
