import gsap from 'gsap'
import Page from '../../Core/Page/Page'
import STORE from '../../Core/Store'

function homeHtml(cases) {
  return (
    <section id="page" class="home">
      <div class="home__container">
        {cases &&
          cases.map((c, i) => (
            <div key={i} class="home__images">
              <div class="home__images--container">
                <div class="home__images--nav">
                  <span class="home__images--nav__left"></span>
                  <span class="home__images--nav__right"></span>
                </div>
                {c.images.length > 0 &&
                  c.images.map((image, index) => (
                    <div
                      style={`z-index: ${
                        c.images.length - index
                      }; aspect-ratio: ${image.dimensions.aspectRatio};`}
                      class="home__images--wrapper"
                      data-image-case={i}
                    >
                      <img
                        class="home__images--image"
                        src={image.url}
                        alt={`iamge-${i}-${index}`}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        {cases &&
          cases.map((c, i) => (
            <div key={i} class="home__title">
              <p>{c?.title}</p>
              <p>{c?.responsibility}</p>
            </div>
          ))}
      </div>
    </section>
  )
}

export default class Home extends Page {
  constructor({cases}) {
    super({html: homeHtml(cases), path: '/'})
    this.cases = cases
    this.currentCaseIndex = 0
    this.currentImageIndex = 0
  }

  create() {
    super.create()
  }

  init() {
    this.navLeft = this.template.querySelector('.home__images--nav__left')
    this.navRight = this.template.querySelector('.home__images--nav__right')
    this.mainImages = this.template.querySelectorAll('[data-image-case]')

    if (this.media) {
      this.currentMedia = this.media[this.currentCaseIndex]
      this.displayReference = this.template.querySelectorAll(
        `[data-image-case="${this.currentCaseIndex}"]`,
      )[0]
      this.positionAnima = this.currentMedia.map(m => {
        return m.position
      })
      this.scaleAnima = this.currentMedia.map(m => {
        return m.scale
      })

      this.resizeMedia()
      this.positionMedia(this.currentImageIndex)
      this.setMediaPosition(this.currentImageIndex)
    }

    this.addListeners()
  }

  onInject() {
    super.onInject()
    // set display image
    this.displayReferenceBounds = this.displayReference.getBoundingClientRect()
    this.resizeDisplay(this.media[0][0])
  }

  resizeMedia() {
    Object.values(this.media).forEach((m, i) => {
      m.forEach((mesh, index) => {
        if (index === this.currentImageIndex) {
          if (this.injected) {
            this.resizeDisplay(mesh)
          }
        } else {
          mesh.scale.set(
            mesh.material.uniforms.scale.value[0],
            mesh.material.uniforms.scale.value[1],
          )
        }
        if (i !== this.currentCaseIndex) {
          mesh.material.uniforms.opacity.value = 0
        }
      })
    })
  }

  resizeDisplay(mesh) {
    const width =
      (STORE.viewport.width * this.displayReferenceBounds.width) /
      STORE.screen.width
    const height =
      (STORE.viewport.height * this.displayReferenceBounds.height) /
      STORE.screen.height

    mesh.scale.set(width, height)
  }

  scaleMedia(imageIndex) {
    STORE.scaleArray = []

    this.currentMedia.forEach((mesh, index) => {
      if (index === imageIndex) {
        const width =
          (STORE.viewport.width * this.displayReferenceBounds.width) /
          STORE.screen.width
        const height =
          (STORE.viewport.height * this.displayReferenceBounds.height) /
          STORE.screen.height

        const scale = {
          width: width,
          height: height,
        }
        STORE.scaleArray.push(scale)
      } else {
        const scale = {
          width: mesh.material.uniforms.scale.value[0],
          height: mesh.material.uniforms.scale.value[1],
        }
        STORE.scaleArray.push(scale)
      }
    })
  }

  positionMedia(imageIndex) {
    STORE.positionArray = []

    this.currentMedia.forEach((mesh, index) => {
      if (index === imageIndex) {
        STORE.positionArray.push(0)
      } else if (index > imageIndex) {
        const offset = index - (imageIndex + 1)
        STORE.positionArray.push(STORE.viewport.width * 0.35 + offset)
      } else if (index < imageIndex) {
        const offset = index - imageIndex + 1
        STORE.positionArray.push(-STORE.viewport.width * 0.35 + offset)
      }
    })
  }

  setMediaPosition(imageIndex) {
    this.currentMedia.forEach((mesh, index) => {
      if (index === imageIndex) {
        mesh.position.x = 0
      } else if (index > imageIndex) {
        const offset = index - (imageIndex + 1)
        mesh.position.x = STORE.viewport.width * 0.35 + offset
      } else if (index < imageIndex) {
        const offset = index - imageIndex + 1
        mesh.position.x = -STORE.viewport.width * 0.35 + offset
      }
    })
  }

  animateMediaPosition() {
    gsap.to(this.positionAnima, {
      x: function (index) {
        return STORE.positionArray[index]
      },
      duration: 0.7,
      ease: 'easeOutCubic',
    })
  }

  animateMediaScale() {
    console.log(this.scaleAnima)
    gsap.to(this.scaleAnima, {
      x: function (index) {
        return STORE.scaleArray[index].width
      },
      y: function (index) {
        return STORE.scaleArray[index].height
      },
      duration: 0.7,
      ease: 'easeOutCubic',
    })
  }

  addListeners() {
    if (this.navLeft && this.navRight) {
      this.navLeft.addEventListener('click', () => {
        if (
          this.currentImageIndex > 0 &&
          this.currentImageIndex <= this.media[this.currentCaseIndex].length
        ) {
          this.currentImageIndex--
          this.positionMedia(this.currentImageIndex)
          this.scaleMedia(this.currentImageIndex)
          this.animateMediaPosition()
          this.animateMediaScale()
        }
      })
      this.navRight.addEventListener('click', () => {
        if (
          this.currentImageIndex >= 0 &&
          this.currentImageIndex < this.media[this.currentCaseIndex].length - 1
        ) {
          this.currentImageIndex++
          this.positionMedia(this.currentImageIndex)
          this.scaleMedia(this.currentImageIndex)
          this.animateMediaPosition()
          this.animateMediaScale()
        }
      })
    }
  }
}
