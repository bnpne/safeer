export default class SplitText {
  constructor({
    paragraph,
    lines = false,
    words = false,
    chars = false,
    hasIndent = false,
  }) {
    this.para = paragraph
    this.lines = lines
    this.words = words
    this.chars = chars
    this.wordsArray = []
    this.wordsArrayInner = []
    this.linesArray = []
    this.linesArrayInner = []
    this.charsArrayWords = []
    this.charsArrayChars = []
    this.hasIndent = hasIndent

    if (!this.lines && !this.words && !this.chars) {
      return
    }

    this.init()
  }

  init() {
    // Create a copy of the text and node
    this.tempText = this.para.innerHTML
    this.tempNode = this.para.cloneNode(true)

    // Create bounds
    this.bounds = this.para.getBoundingClientRect()

    // Clear node
    this.para.innerHTML = ''

    if (this.chars) {
      this.createChars()
    } else {
      this.createWords()
    }
    this.build()

    if (this.lines) this.createLines()
  }

  createChars() {
    const splitWords = this.splitWords(this.tempText)

    const span = document.createElement('span')
    const innerSpan = span.cloneNode()
    console.log('check', window.mobileAndTabletCheck())
    span.style.padding = window.mobileAndTabletCheck()
      ? '1.5rem 4rem'
      : '0 1rem'
    span.style.display = 'inline-block'
    // span.style.display = 'inline'
    span.style.overflowY = 'hidden'
    // span.style.overflow = 'hidden'
    innerSpan.style.display = 'inline-block'
    innerSpan.style.padding = '0  0 1.09rem 0'

    splitWords.forEach(w => {
      const ws = span.cloneNode()
      const is = innerSpan.cloneNode()

      const splitChars = w.split('')
      splitChars.forEach(s => {
        const text = document.createTextNode(s)
        let l = is.cloneNode()
        l.appendChild(text)
        ws.appendChild(l)

        this.charsArrayChars.push(l)
      })

      // if (this.lines) {
      //   ws.appendChild(text)
      // } else {
      //   is.appendChild(text)
      //   ws.appendChild(is)
      // }
      //
      this.charsArrayWords.push(ws)
    })
  }

  createWords() {
    const splitWords = this.splitWords(this.tempText)
    const span = document.createElement('span')
    span.style.overflow = 'hidden'
    const innerSpan = span.cloneNode()
    span.style.display = 'inline-block'

    splitWords.forEach(w => {
      const ws = span.cloneNode()
      const is = innerSpan.cloneNode()

      const text = document.createTextNode(w)

      if (this.lines) {
        ws.appendChild(text)
      } else {
        is.appendChild(text)
        ws.appendChild(is)
      }

      this.wordsArray.push(ws)
      this.wordsArrayInner.push(is)
    })
  }

  createLines() {
    const cs = window.getComputedStyle(this.para, null)
    const fontSize = parseFloat(cs.fontSize)
    const lineThreshold = fontSize * 0.2
    let lineOffset = null

    const wordsInEachLine = [] // paragraph
    let wordsInCurrentLine = [] // words
    this.linesArray = []

    // Iterate through words and separate into lines

    this.wordsArray.forEach((w, i) => {
      const {top} = this.getPosition(w, this.para)

      if (lineOffset === null || top - lineOffset >= lineThreshold) {
        lineOffset = top
        wordsInEachLine.push((wordsInCurrentLine = []))
      }

      wordsInCurrentLine.push(w)
    })

    // Remove inner html
    this.para.innerHTML = ''

    // Create line text element

    wordsInEachLine.forEach(wa => {
      const span = document.createElement('span')
      span.style.overflow = 'hidden'
      const innerSpan = span.cloneNode()
      span.style.display = 'block'

      let lineString = ''

      wa.forEach((w, i) => {
        lineString += w.innerHTML
        if (i < wa.length) {
          lineString += ' '
        }
      })

      if (lineString !== ' ') {
        const text = document.createTextNode(lineString)

        innerSpan.appendChild(text)
        span.appendChild(innerSpan)
        this.linesArray.push(span)
        this.linesArrayInner.push(innerSpan)
      }
    })

    this.linesArray.forEach(la => {
      this.para.appendChild(la)
    })
  }

  build() {
    if (this.para.innerHTML !== '') {
      this.para.innerHTML = ''
    }

    if (this.wordsArray) {
      this.wordsArray.forEach((w, i) => {
        this.para.appendChild(w)

        if (i < this.wordsArray.length) {
          this.para.append(' ')
          // todo space between words
        }
      })
    }

    if (this.charsArrayWords) {
      this.charsArrayWords.forEach((c, i) => {
        this.para.appendChild(c)
        if (i < this.charsArrayWords.length) {
          this.para.append('')
          // todo no space between characters
        }
      })
    }
  }

  splitWords(element) {
    // Splits words by space
    if (element instanceof Element) {
      return element.innerHTML.trim().split(/\s+/)
    } else {
      return element.split(/\s+/)
    }
  }

  getPosition(node, parent) {
    const parentRect = parent.getBoundingClientRect()
    const {width, height, x, y} = node.getBoundingClientRect()
    const left = x - parentRect.x
    const top = y - parentRect.y

    return {width, height, top, left}
  }

  resize() {
    if (this.words || this.charsArrayWords) {
      return
    }

    if (this.lines) {
      this.build()
      this.createLines()
    }
  }
}
