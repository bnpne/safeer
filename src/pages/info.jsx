import Page from '../../Core/Page/Page'

function infoHtml() {
  return (
    <section id="page" class="info">
      <h1>Info</h1>
    </section>
  )
}

export default class Info extends Page {
  constructor() {
    super({html: infoHtml(), path: '/info'})
  }

  create() {
    super.create()
  }
}
