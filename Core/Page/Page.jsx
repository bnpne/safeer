import STORE from '../Store'

export default class Page {
  constructor({parent, html, path}) {
    this.html = html ?? null
    this.parent = parent ?? null
    this.active = false
    this.path = path ?? null
    this.template = null

    this.create()
  }

  create() {
    // Load HTML
    if (this.html) {
      this.template = render(this.html)
    } else {
      return
    }

    this.created = true
  }

  init() {}

  onInject() {
    // Preemptive
    STORE.lenis.scrollTo('top', {immediate: true, force: true})
    this.injected = true
  }

  in() {
    return Promise.resolve()
  }

  out() {
    return Promise.resolve()
  }

  updatePath(path) {
    this.path = path
  }

  resize() {}

  scroll(scroll) {}
}
