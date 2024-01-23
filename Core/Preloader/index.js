import STORE from '../Store'
import Emitter from '../Emitter'
import gsap from 'gsap'
import * as THREE from 'three'

import {getCaseStudies} from '../Utils/data'

import Home from '../../src/pages/home'

import ImageMaterial from '../Canvas/materials/imageMaterial'

export default class Preloader {
  constructor({el, pagesParent}) {
    this.preloader = el
    this.pageParent = pagesParent

    this.em = new Emitter()
    this.pageLoaded = false

    STORE.preloadTimeline = gsap
      .timeline({
        easing: 'easeOutCubic',
        duration: 0.7,
        paused: true,
        onComplete: () => {
          this.destroy()
        },
      })
      .fromTo(
        this.preloader,
        {opacity: 1},
        {
          opacity: 0,
          delay: 1,
        },
      )

    this.load()
  }

  async load() {
    await this.buildPages().then(async () => {
      await STORE.router.inject().then(() => {
        this.loaded()
      })
    })
  }

  buildPages() {
    return new Promise(async (resolve, reject) => {
      const c = await getCaseStudies()

      if (c) {
        if (!STORE.home) {
          STORE.home = STORE.router.pages['/'] = new Home({cases: c})
        }

        const media = {}

        c.forEach((ci, i) => {
          const IMG_TRANSFORM = `?auto=format&w=1000`
          const textureLoader = new THREE.TextureLoader()

          const mediaArray = []

          ci.images.forEach((image, i) => {
            const url = image.url + IMG_TRANSFORM
            const dimensions = image.dimensions
            const tex = textureLoader.load(url)

            const element = {
              tex: tex,
              dimensions: dimensions,
            }

            const mesh = this.loadMesh(element)
            mediaArray.push(mesh)
          })

          media[i] = mediaArray
        })

        STORE.home.media = media

        STORE.home.init()
      }
      resolve()
    })
  }

  loadMesh(element) {
    if (element) {
      const plane = new THREE.PlaneGeometry(1, 1)

      const material = new ImageMaterial({
        texture: element.tex,
        imageBounds: [element.dimensions.width, element.dimensions.height],
        scale:
          element.dimensions.aspectRatio <= 1
            ? [element.dimensions.aspectRatio, 1]
            : [1, 1 / element.dimensions.aspectRatio],
      })

      material.material.userData.dimensions = element.dimensions

      const mesh = new THREE.Mesh(plane, material.material)
      mesh.frustumCulled = false
      STORE.scene.add(mesh)

      return mesh
    } else {
      return
    }
  }

  loaded() {
    this.em.emit('completed')
  }

  destroy() {
    this.preloader.remove()
  }
}
