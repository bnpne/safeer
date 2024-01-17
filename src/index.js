import './styles/index.scss'

// Core
import STORE from '@Boiler/Store'
import R from '@Boiler/R'
import Canvas from '@Boiler/Canvas'
import Preloader from '@Boiler/Preloader'
import Router from '@Boiler/Router'

// Helpers
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {CustomEase} from 'gsap/all'

// Pages
// Import your pages here
// These will be loaded by the preloader
import Home from './pages/home'
import Info from './pages/info'

// Admin
import {renderStudio} from 'sanity'
import {config} from '@Boiler/Admin'

gsap.registerPlugin(ScrollTrigger, CustomEase)

class App {
  constructor() {
    this.app = document.querySelector('#app')
    this.main = document.querySelector('#main')
    this.admin = document.querySelector('#admin')

    if (
      window.location.pathname === '/admin' ||
      window.location.pathname.indexOf('/admin') === 0
    ) {
      this.app.remove()
      window.history.pushState({}, document.title, '/admin')
      const preloadElement = document.querySelector('[data-preloader]')
      preloadElement.remove()
      const nav = document.querySelector('#nav')
      nav.remove()

      this.loadAdmin()
    } else {
      document.documentElement.style.fontSize = `calc(100vw / 1728 * 10)`

      this.admin.remove()
      const r = document.querySelector('#r')
      const preloadElement = document.querySelector('[data-preloader]')
      this.pagesParent = document.querySelector('#app')
      STORE.url = window.location.pathname

      STORE.setUrl = function (data) {
        this.url = data
      }

      // this.pages = {
      //   '/': new Home(),
      //   '/info': new Info(),
      // }

      this.pages = {}

      STORE.router = new Router({
        pages: this.pages,
        pagesParent: this.pagesParent,
      })

      STORE.preloader = new Preloader({
        el: preloadElement,
        pagesParent: this.pagesParent,
      })

      STORE.lenis = new Lenis({
        lerp: 0.1,
        wrapper: this.main,
        content: this.app,
      })

      // R.add(time => {
      //   STORE.lenis.raf(time)
      // }, 0)

      // STORE.lenis.on('scroll', () => {
      //   ScrollTrigger.refresh()
      // })
      CustomEase.create('easeOutCubic', '0.33, 1, 0.68, 1')

      this.canvas = new Canvas({el: r})

      this.load()
    }
  }

  loadAdmin() {
    renderStudio(this.admin, config)
  }

  load() {
    STORE.preloader.em.on('completed', () => {
      this.init()
    })
  }

  init() {
    R.add(() => this.loop())

    // STORE.lenis.on('scroll', ({scroll}) => {
    //   STORE.router.tree.currentPage.scroll(scroll)
    // })

    this.resize()
    this.listeners()
    this.linkListeners()

    STORE.preloadTimeline.play()
  }

  listeners() {
    window.addEventListener('wheel', this.wheel.bind(this), {
      passive: true,
    })
    window.addEventListener('resize', this.resize.bind(this), {
      passive: true,
    })
    window.addEventListener('popstate', this.popState.bind(this), {
      passive: true,
    })
  }

  linkListeners() {
    const links = document.querySelectorAll('a')

    links.forEach(l => {
      const local = l.href.indexOf(window.location.origin) > -1

      if (local) {
        l.onclick = e => {
          e.preventDefault()

          if (l.getAttribute('href') !== window.location.pathname) {
            STORE.dispatch('setUrl', [l.getAttribute('href')])
            STORE.router.route()
          }
        }
      } else if (
        l.href.indexOf('mailto') === -1 &&
        l.href.indexOf('tel') === -1
      ) {
        l.rel = 'noopener'
        l.target = '_blank'
      }
    })
  }

  popState() {
    STORE.dispatch('setUrl', [window.location.pathname])
    STORE.router.route()
  }

  wheel(e) {
    // console.log(e)
  }

  resize() {
    this.canvas && this.canvas.resize()
    STORE.allez && STORE.allez.checkResize()
    STORE.router.tree.currentPage.resize()
  }

  loop() {
    if (this.canvas) this.canvas.loop()
  }
}

new App()
