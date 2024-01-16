// Virtual DOM

export function toVirtualDom(node, attributes, ...children) {
  // Flatten the children array to handle nested arrays
  const flattenedChildren = [].concat(...children)
  return {
    node,
    attributes,
    children: flattenedChildren.length ? flattenedChildren : null,
  }
}

export function render(virtualNode) {
  if (typeof virtualNode === 'string') {
    return document.createTextNode(virtualNode)
  }

  const element = document.createElement(virtualNode.node)

  Object.keys(virtualNode.attributes || {}).forEach(attr => {
    element.setAttribute(attr, virtualNode.attributes[attr])
  })

  if (Array.isArray(virtualNode.children)) {
    virtualNode.children.forEach(child => {
      const childElement = render(child)
      element.appendChild(childElement)
    })
  } else if (virtualNode.children) {
    const childElement = render(virtualNode.children)
    element.appendChild(childElement)
  }

  return element
}
