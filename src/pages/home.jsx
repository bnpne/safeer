import gsap from 'gsap'
import Page from '@Boiler/Page/Page'
import STORE from '@Boiler/Store'

import schism from '@Boiler/Utils/schism'

function homeHtml(cases) {
  return (
    <section id="page" class="home">
      <div class="home__container">
        <div class="home__images">
          <div class="home__images--container">
            <div class="home__images--nav">
              <span class="home__images--nav__left"></span>
              <span class="home__images--nav__right"></span>
            </div>
            {cases &&
              cases.map((c, i) => (
                <div class="home__images--dom" key={i}>
                  <div
                    data-about
                    style={`background-color: ${c.caseColor}; color: ${c.textColor};`}
                    class="home__images--about"
                  >
                    {c.description && c.descriptionFooter && (
                      <div class="home__images--about__inner">
                        <p>{c.description}</p>
                        <br />
                        <p>{c.descriptionFooter}</p>
                      </div>
                    )}
                  </div>
                  {c.images.length > 0 &&
                    c.images.map((image, index) => (
                      <div
                        style={`z-index: ${
                          c.images.length - index
                        }; aspect-ratio: ${image.dimensions.aspectRatio};`}
                        class="home__images--wrapper"
                        data-image-case={index}
                      >
                        <img
                          class="home__images--image"
                          src={image.url}
                          alt={`image-${i}-${index}`}
                        />
                      </div>
                    ))}
                </div>
              ))}
          </div>
          <div class="home__images--info">
            <p data-info-title>ABOUT +</p>
            <p style="display: inline-flex;">
              <span data-current-image-index></span>
              <span>/</span>
              <span data-current-image-total></span>
            </p>
            <p data-info-next>NEXT PROJECT</p>
          </div>
        </div>
        {cases &&
          cases.map((c, i) => (
            <div key={i} class="home__title">
              <p data-word>{c?.title}</p>
              <p data-word>{c?.responsibility}</p>
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
    this.aboutActive = false
    this.titleAnima = []
    this.oldTitleAnima = []
  }

  create() {
    super.create()
  }

  init() {
    this.mainNav = document.querySelector('#nav')

    if (this.mainNav) {
      this.navWords = this.mainNav.querySelectorAll('[data-word]')
    }
    console.log(this.navWords)
    const navAnima = []
    this.navWords.forEach(nv => {
      const s = new schism({target: nv, mutation: 'chars'})
      navAnima.push(s.charArray)
    })
    this.navLeft = this.template.querySelector('.home__images--nav__left')
    this.navRight = this.template.querySelector('.home__images--nav__right')
    this.mainImages = this.template.querySelectorAll('[data-image-case]')
    this.info = this.template.querySelector('.home__images--info')
    this.infoTitle = this.template.querySelector('[data-info-title]')
    this.infoImageIndex = this.template.querySelector(
      '[data-current-image-index]',
    )
    this.infoImageTotal = this.template.querySelector(
      '[data-current-image-total]',
    )
    this.infoNext = this.template.querySelector('[data-info-next]')

    this.about = this.template.querySelectorAll('[data-about]')

    this.titles = []
    const titleElements = this.template.querySelectorAll('.home__title')
    titleElements.forEach((te, i) => {
      const para = te.querySelectorAll('[data-word]')
      const titleObj = {}

      para.forEach((p, i) => {
        titleObj[i] = new schism({target: p, mutation: 'chars'})
      })

      this.titles.push(titleObj)
    })

    if (this.media) {
      this.currentMedia = this.media[this.currentCaseIndex]
      this.displayReference = this.template.querySelectorAll(
        '[data-image-case="0"]',
      )

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
    this.setTitle()

    this.addListeners()

    STORE.preloadTimeline
      .fromTo(
        navAnima,
        {y: '100%'},
        {
          y: '0%',
          stagger: 0.015,
        },
      )
      .to(
        this.titleAnima,
        {
          y: '0%',
          stagger: 0.015,
        },
        '>-50%',
      )
  }

  onInject() {
    super.onInject()

    // set display image
    this.displayReferenceBounds =
      this.displayReference[this.currentCaseIndex].getBoundingClientRect()

    this.resizeDisplay(this.media[0][0])
    this.setInfo()
  }

  setInfo() {
    if (
      this.info &&
      this.infoTitle &&
      this.infoImageIndex &&
      this.infoImageTotal &&
      this.infoNext
    ) {
      this.info.style.maxWidth = `${this.displayReferenceBounds.width}px`

      this.infoImageIndex.innerHTML = this.currentImageIndex + 1
      this.infoImageTotal.innerHTML = this.currentMedia.length
    }

    if (this.about[this.currentCaseIndex]) {
      this.about[this.currentCaseIndex].style.width =
        `${this.displayReferenceBounds.width}px`
      this.about[this.currentCaseIndex].style.height =
        `${this.displayReferenceBounds.height}px`
    }
  }

  setTitle() {
    this.oldTitleAnima = this.titleAnima
    this.titleAnima = []

    Object.values(this.titles[this.currentCaseIndex]).forEach(t => {
      this.titleAnima.push(t.charArray)
    })
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

    if (!mesh) {
      Object.values(this.media).forEach((m, i) => {
        if (i === this.currentCaseIndex) {
          m.forEach((me, i) => {
            if (i === this.currentImageIndex) {
              me.scale.set(width, height)
            }
          })
        }
      })
    } else {
      mesh.scale.set(width, height)
    }
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
        let offset = index - (imageIndex + 1)
        let padding

        if (mesh.scale.x >= 1) {
          padding = offset * (mesh.scale.x / 4)
        } else {
          padding = 0
        }

        STORE.positionArray.push(STORE.viewport.width * 0.35 + offset + padding)
      } else if (index < imageIndex) {
        let offset = index - imageIndex + 1
        let padding

        if (mesh.scale.x >= 1) {
          padding = offset * (mesh.scale.x / 4)
        } else {
          padding = 0
        }

        STORE.positionArray.push(
          -STORE.viewport.width * 0.35 + offset + padding,
        )
      }
    })
  }

  setMediaPosition(imageIndex) {
    this.currentMedia.forEach((mesh, index) => {
      if (index === imageIndex) {
        mesh.position.x = 0
      } else if (index > imageIndex) {
        let offset = index - (imageIndex + 1)
        let padding

        if (mesh.scale.x >= 1) {
          padding = offset * (mesh.scale.x / 4)
        } else {
          padding = 0
        }

        mesh.position.x = STORE.viewport.width * 0.35 + offset + padding
      } else if (index < imageIndex) {
        let offset = index - imageIndex + 1
        let padding

        if (mesh.scale.x >= 1) {
          padding = offset * (mesh.scale.x / 4)
        } else {
          padding = 0
        }

        mesh.position.x = -STORE.viewport.width * 0.35 + offset + padding
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

  aboutCase() {
    const animaEl =
      this.currentMedia[this.currentImageIndex].material.uniforms.opacity

    if (this.aboutActive === false) {
      this.navLeft.style.pointerEvents = 'none'
      this.navRight.style.pointerEvents = 'none'
      this.infoTitle.innerHTML = 'ESC/RETURN -'
      gsap.to(animaEl, {
        value: 0,
        duration: 0.5,
        ease: 'easeOutCubic',
      })
      gsap.to(this.about[this.currentCaseIndex], {
        opacity: 1,
        duration: 0.5,
        ease: 'easeOutCubic',
      })

      this.aboutActive = true
    } else {
      this.navLeft.style.pointerEvents = 'auto'
      this.navRight.style.pointerEvents = 'auto'
      this.infoTitle.innerHTML = 'ABOUT +'
      gsap.to(animaEl, {
        value: 1,
        duration: 0.5,
        ease: 'easeOutCubic',
      })
      gsap.to(this.about[this.currentCaseIndex], {
        opacity: 0,
        duration: 0.5,
        ease: 'easeOutCubic',
      })

      this.aboutActive = false
    }
  }

  nextCase() {
    const nextTl = gsap.timeline({
      duration: 0.3,
      ease: 'easeInQuint',
      paused: true,
    })

    if (this.currentCaseIndex < Object.entries(this.media).length - 1) {
      this.currentCaseIndex++
    } else if (
      this.currentCaseIndex ===
      Object.entries(this.media).length - 1
    ) {
      this.currentCaseIndex = 0
    }

    const oldCurrentMedia = this.currentMedia
    const newCurrentMedia = this.media[this.currentCaseIndex]
    this.currentMedia = newCurrentMedia

    const oldAnimaPos = []
    const oldAnimaOpacity = []
    oldCurrentMedia.forEach(cm => {
      oldAnimaPos.push(cm.position)
      oldAnimaOpacity.push(cm.material.uniforms.opacity)
    })

    const newAnimaPos = []
    const newAnimaOpacity = []
    newCurrentMedia.forEach(cm => {
      newAnimaPos.push(cm.position)
      newAnimaOpacity.push(cm.material.uniforms.opacity)
    })

    this.setTitle()

    nextTl
      .to(oldAnimaPos, {
        y: -0.2,
        stagger: {
          each: 0.025,
          ease: 'easeOutCubic',
          from: this.currentImageIndex,
        },
      })
      .to(
        oldAnimaOpacity,
        {
          value: 0,
          stagger: {
            each: 0.025,
            ease: 'easeOutCubic',
            from: this.currentImageIndex,
          },
          onComplete: () => {
            this.currentImageIndex = 0
            this.scaleMedia(this.currentImageIndex)
            this.resize()
            oldCurrentMedia.forEach(cm => {
              cm.position.y = 0
            })
            this.positionAnima = this.currentMedia.map(m => {
              return m.position
            })
            this.scaleAnima = this.currentMedia.map(m => {
              return m.scale
            })
          },
        },
        '<',
      )
      .to(
        this.info,
        {
          opacity: 0,
        },
        '<',
      )
      .to(
        this.oldTitleAnima,
        {
          y: '100%',
        },
        '<',
      )
      .fromTo(
        newAnimaPos,
        {
          y: -0.2,
        },
        {
          y: 0,
          stagger: {
            each: 0.025,
            ease: 'easeOutCubic',
            from: this.currentImageIndex,
          },
          ease: 'easeOutCubic',
        },
      )
      .to(
        newAnimaOpacity,
        {
          value: 1,
          stagger: {
            each: 0.025,
            ease: 'easeOutCubic',
            from: this.currentImageIndex,
          },
          ease: 'easeOutCubic',
        },
        '<',
      )
      .to(
        this.info,
        {
          opacity: 1,
        },
        '<',
      )
      .to(
        this.titleAnima,
        {
          y: '0%',
        },
        '<',
      )

    nextTl.play()
  }

  prevCase() {
    const prevTl = gsap.timeline({
      duration: 0.3,
      ease: 'easeInQuint',
      paused: true,
    })

    if (this.currentCaseIndex > 0) {
      this.currentCaseIndex--
    } else if (this.currentCaseIndex === 0) {
      this.currentCaseIndex = Object.entries(this.media).length - 1
    }

    const oldCurrentMedia = this.currentMedia
    const newCurrentMedia = this.media[this.currentCaseIndex]
    this.currentMedia = newCurrentMedia

    const oldAnimaPos = []
    const oldAnimaOpacity = []
    oldCurrentMedia.forEach(cm => {
      oldAnimaPos.push(cm.position)
      oldAnimaOpacity.push(cm.material.uniforms.opacity)
    })

    const newAnimaPos = []
    const newAnimaOpacity = []
    newCurrentMedia.forEach(cm => {
      newAnimaPos.push(cm.position)
      newAnimaOpacity.push(cm.material.uniforms.opacity)
    })

    this.setTitle()

    prevTl
      .to(oldAnimaPos, {
        y: 0.2,
        stagger: {
          each: 0.025,
          ease: 'easeOutCubic',
          from: this.currentImageIndex,
        },
      })
      .to(
        oldAnimaOpacity,
        {
          value: 0,
          stagger: {
            each: 0.025,
            ease: 'easeOutCubic',
            from: this.currentImageIndex,
          },
          onComplete: () => {
            this.currentImageIndex = 0
            this.scaleMedia(this.currentImageIndex)
            this.resize()
            oldCurrentMedia.forEach(cm => {
              cm.position.y = 0
            })
            this.positionAnima = this.currentMedia.map(m => {
              return m.position
            })
            this.scaleAnima = this.currentMedia.map(m => {
              return m.scale
            })
          },
        },
        '<',
      )
      .to(
        this.info,
        {
          opacity: 0,
        },
        '<',
      )
      .to(
        this.oldTitleAnima,
        {
          y: '100%',
        },
        '<',
      )
      .fromTo(
        newAnimaPos,
        {
          y: 0.2,
        },
        {
          y: 0,
          stagger: {
            each: 0.025,
            ease: 'easeOutCubic',
            from: this.currentImageIndex,
          },
          ease: 'easeOutCubic',
        },
      )
      .to(
        newAnimaOpacity,
        {
          value: 1,
          stagger: {
            each: 0.025,
            ease: 'easeOutCubic',
            from: this.currentImageIndex,
          },
          ease: 'easeOutCubic',
        },
        '<',
      )
      .to(
        this.info,
        {
          opacity: 1,
        },
        '<',
      )
      .to(
        this.titleAnima,
        {
          y: '0%',
        },
        '<',
      )

    prevTl.play()
  }

  addListeners() {
    window.addEventListener('keydown', e => {
      if (e.keyCode === 27 || e.code === 'Escape') {
        if (this.aboutActive === true) {
          this.aboutCase()
        }
      } else if (e.keyCode === 13 || e.code === 'Enter') {
        if (this.aboutActive === false) {
          this.aboutCase()
        }
      } else if (e.keyCode === 39 || e.code === 'ArrowRight') {
        if (
          this.currentImageIndex >= 0 &&
          this.currentImageIndex < this.media[this.currentCaseIndex].length - 1
        ) {
          console.log('right')
          this.currentImageIndex++
          this.positionMedia(this.currentImageIndex)
          this.scaleMedia(this.currentImageIndex)
          this.animateMediaPosition()
          this.animateMediaScale()
          this.infoImageIndex.innerHTML = this.currentImageIndex + 1
        }
      } else if (e.keyCode === 37 || e.code === 'ArrowLeft') {
        if (
          this.currentImageIndex > 0 &&
          this.currentImageIndex <= this.media[this.currentCaseIndex].length
        ) {
          console.log('left')
          this.currentImageIndex--
          this.positionMedia(this.currentImageIndex)
          this.scaleMedia(this.currentImageIndex)
          this.animateMediaPosition()
          this.animateMediaScale()
          this.infoImageIndex.innerHTML = this.currentImageIndex + 1
        }
      } else if (e.keyCode === 40 || e.code === 'ArrowDown') {
        this.nextCase()
      } else if (e.keyCode === 38 || e.code === 'ArrowUp') {
        this.prevCase()
      }
    })

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
          this.infoImageIndex.innerHTML = this.currentImageIndex + 1
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
          this.infoImageIndex.innerHTML = this.currentImageIndex + 1
        }
      })
    }
    if (this.infoTitle && this.infoNext) {
      this.infoNext.addEventListener('click', () => {
        this.nextCase()
      })
      this.infoTitle.addEventListener('click', () => {
        this.aboutCase()
      })
    }
  }

  resize() {
    this.displayReferenceBounds =
      this.displayReference[this.currentCaseIndex].getBoundingClientRect()
    this.setInfo()
    this.resizeDisplay()
    this.resizeMedia()
    this.setMediaPosition(this.currentImageIndex)
  }
}
