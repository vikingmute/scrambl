;(() => {
  var CHARS = {
    blocks: '\u2588\u2593\u2592\u2591',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    numbers: '0123456789',
    braille:
      '\u2801\u2802\u2803\u2804\u2805\u2806\u2807\u2808\u2809\u280A\u280B\u280C\u280D\u280E\u280F\u2810\u2811\u2812\u2813\u2814\u2815\u2816\u2817\u2818\u2819\u281A\u281B\u281C\u281D\u281E\u281F\u2820\u2821\u2822\u2823\u2824\u2825\u2826\u2827\u2828\u2829\u282A\u282B\u282C\u282D\u282E\u282F\u2830\u2831\u2832\u2833\u2834\u2835\u2836\u2837\u2838\u2839\u283A\u283B\u283C\u283D\u283E\u283F',
  }

  var CURSORS = {
    blocks: '\u2591\u2592\u2593\u2588',
    symbols: '<>{}[]',
    numbers: '0101',
    braille: '\u2801\u2803\u2807\u283F',
  }

  var activeMode = 'blocks'
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var activeScrambles = new WeakMap()

  function scrambleText(el, text, opts) {
    if (!opts) opts = {}
    var previous = activeScrambles.get(el)
    if (previous) cancelAnimationFrame(previous)
    if (prefersReduced) {
      el.textContent = text
      return
    }
    var charset = opts.chars || CHARS.blocks
    var cursor = opts.cursor || ''
    var duration = opts.duration || 800
    var dir = opts.from || 'left'
    var len = text.length
    var order = []
    for (var i = 0; i < len; i++) order.push(i)

    if (dir === 'right') order.reverse()
    else if (dir === 'center') {
      var mid = len / 2
      order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))
    } else if (dir === 'random') {
      for (var k = order.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1))
        var tmp = order[k]
        order[k] = order[j]
        order[j] = tmp
      }
    }

    var start = performance.now()
    var revealed = {}

    function render(out) {
      if (!opts.fixedCells) {
        el.textContent = out
        return
      }

      el.setAttribute('aria-label', out)
      el.textContent = ''
      var cellClass = opts.cellClass || 'scramble-glyph'
      for (var si = 0; si < out.length; si++) {
        var span = document.createElement('span')
        span.className = cellClass
        span.textContent = out[si] === ' ' ? '\u00A0' : out[si]
        el.appendChild(span)
      }
    }

    function frame(now) {
      var p = Math.min((now - start) / duration, 1)
      var count = Math.floor(p * len)
      for (var ri = Object.keys(revealed).length; ri < count && ri < order.length; ri++)
        revealed[order[ri]] = true
      var cursorStart = count
      var cursorEnd = Math.min(count + cursor.length, order.length)

      var out = ''
      for (var ci = 0; ci < len; ci++) {
        if (revealed[ci]) out += text[ci]
        else {
          var oi = order.indexOf(ci)
          if (cursor && oi >= cursorStart && oi < cursorEnd)
            out += cursor[(oi - cursorStart) % cursor.length]
          else out += charset[Math.floor(Math.random() * charset.length)]
        }
      }
      render(out)
      if (p < 1) activeScrambles.set(el, requestAnimationFrame(frame))
      else {
        activeScrambles.delete(el)
        if (opts.onComplete) opts.onComplete()
      }
    }
    activeScrambles.set(el, requestAnimationFrame(frame))
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function highlightCode(code) {
    var pattern =
      /(\/\/.*)|('[^'\n]*(?:\\.[^'\n]*)*'|"[^"\n]*(?:\\.[^"\n]*)*"|`[^`\n]*(?:\\.[^`\n]*)*`)|(\b(?:import|from|const|function|return|true|false)\b)|(\b\d+(?:\.\d+)?\b)|(\b(?:text|chars|from|duration|ease|trigger|cursor|perturbation|seed|loop|onComplete)\b)(?=\s*:)/g
    var html = ''
    var lastIndex = 0
    var match

    while ((match = pattern.exec(code)) !== null) {
      html += escapeHtml(code.slice(lastIndex, match.index))
      var token = escapeHtml(match[0])
      if (match[1]) html += '<span class="code-comment">' + token + '</span>'
      else if (match[2]) html += '<span class="code-string">' + token + '</span>'
      else if (match[3]) html += '<span class="code-keyword">' + token + '</span>'
      else if (match[4]) html += '<span class="code-number">' + token + '</span>'
      else if (match[5]) html += '<span class="code-property">' + token + '</span>'
      lastIndex = pattern.lastIndex
    }

    html += escapeHtml(code.slice(lastIndex))
    return html
  }

  function renderHighlightedCode(el, code) {
    el.innerHTML = highlightCode(code)
  }

  var CODE_SAMPLES = {
    vanilla: {
      file: 'app.ts',
      code: "import { scramble } from '@scrambl/core'\n\nscramble(document.querySelector('h1'), {\n  text: 'Hello World',\n  chars: 'blocks',\n  from: 'left',\n  duration: 800,\n  ease: 'easeOutCubic',\n})",
    },
    react: {
      file: 'Hero.tsx',
      code: "import { useScramble } from '@scrambl/react'\n\nfunction Hero() {\n  const { ref, replay } = useScramble({\n    text: 'Hello World',\n    chars: 'blocks',\n    trigger: 'hover',\n  })\n\n  return <h1 ref={ref} onClick={replay} />\n}",
    },
    vue: {
      file: 'Hero.vue',
      code: "<script setup>\nimport { useScramble } from '@scrambl/vue'\n\nconst { ref, replay } = useScramble({\n  text: 'Hello World',\n  chars: 'blocks',\n  trigger: 'hover',\n})\n</script>\n\n<template>\n  <h1 ref=\"ref\" @click=\"replay\" />\n</template>",
    },
    docs: {
      file: 'options.ts',
      code: "// Full option set\nscramble(el, {\n  text: 'Target text',\n  from: 'left',        // 'left' | 'right' | 'center' | 'random'\n  chars: 'blocks',     // preset name or custom string\n  cursor: '\u2591\u2592\u2593\u2588',      // sweep cursor pattern\n  duration: 800,        // ms\n  ease: 'easeOutCubic', // or custom (t) => t\n  perturbation: 0.28,   // 0..1 randomization\n  seed: 42,             // deterministic PRNG\n  loop: true,           // infinite loop\n  onComplete: () => {}, // callback\n})",
    },
  }

  var PG_CHARS = {
    blocks: '\u2591\u2592\u2593',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    numbers: '0123456789',
    braille: '\u2801\u2803\u2807\u2809\u280B\u280F\u2813\u2817\u281B\u281F',
    katakana:
      '\uFF71\uFF72\uFF73\uFF74\uFF75\uFF76\uFF77\uFF78\uFF79\uFF7A\uFF7B\uFF7C\uFF7D\uFF7E\uFF7F',
    binary: '01',
    hex: '0123456789ABCDEF',
  }

  function initPlayground() {
    var pgOutput = document.getElementById('pgOutput')
    var pgText = document.getElementById('pgText')
    var pgDuration = document.getElementById('pgDuration')
    var pgDurationVal = document.getElementById('pgDurationVal')
    var pgCursor = document.getElementById('pgCursor')
    var pgRun = document.getElementById('pgRun')
    if (!pgOutput || !pgText || !pgRun) return

    var pgCharset = 'blocks'
    var pgDir = 'left'

    document.querySelectorAll('[data-chars]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pgCharset = btn.getAttribute('data-chars')
        document.querySelectorAll('[data-chars]').forEach((c) => {
          c.classList.toggle('is-active', c === btn)
        })
        runPlayground()
      })
    })

    document.querySelectorAll('[data-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pgDir = btn.getAttribute('data-dir')
        document.querySelectorAll('[data-dir]').forEach((c) => {
          c.classList.toggle('is-active', c === btn)
        })
        runPlayground()
      })
    })

    pgDuration.addEventListener('input', () => {
      pgDurationVal.textContent = pgDuration.value + 'ms'
    })

    pgText.addEventListener('input', () => {
      pgOutput.textContent = pgText.value || 'Hello, Scrambl!'
    })

    pgText.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runPlayground()
    })

    pgRun.addEventListener('click', runPlayground)

    function runPlayground() {
      var text = pgText.value || 'Hello, Scrambl!'
      var chars = PG_CHARS[pgCharset] || PG_CHARS.blocks
      var dur = Number.parseInt(pgDuration.value, 10) || 800
      var cursor = pgCursor.value || ''
      scrambleText(pgOutput, text, {
        chars: chars,
        cursor: cursor,
        duration: dur,
        from: pgDir,
        fixedCells: true,
        cellClass: 'pg-glyph',
      })
    }
  }

  function init() {
    var headTop = document.getElementById('headTop')
    var headBottom = document.getElementById('headBottom')
    if (!headTop || !headBottom) return

    scrambleText(headTop, 'Scramble', {
      chars: CHARS.blocks,
      cursor: CURSORS.blocks,
      duration: 900,
      from: 'left',
      fixedCells: true,
    })
    scrambleText(headBottom, 'text', {
      chars: CHARS.blocks,
      cursor: CURSORS.blocks,
      duration: 1000,
      from: 'right',
      fixedCells: true,
    })

    var brandEl = document.querySelector('.scramble-el')
    if (brandEl)
      scrambleText(brandEl, 'Scrambl', {
        chars: CHARS.blocks,
        cursor: CURSORS.blocks,
        duration: 700,
      })

    headTop.addEventListener('pointerenter', () => {
      scrambleText(headTop, 'Scramble', {
        chars: CHARS[activeMode],
        cursor: CURSORS[activeMode],
        duration: 500,
        fixedCells: true,
      })
    })
    headBottom.addEventListener('pointerenter', () => {
      scrambleText(headBottom, 'text', {
        chars: CHARS[activeMode],
        cursor: CURSORS[activeMode],
        duration: 500,
        fixedCells: true,
      })
    })

    var chipBtns = document.querySelectorAll('[data-mode]')
    chipBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeMode = btn.getAttribute('data-mode')
        chipBtns.forEach((c) => {
          c.classList.toggle('is-active', c === btn)
        })
        scrambleText(headTop, 'Scramble', {
          chars: CHARS[activeMode],
          cursor: CURSORS[activeMode],
          duration: 700,
          from: 'left',
          fixedCells: true,
        })
        scrambleText(headBottom, 'text', {
          chars: CHARS[activeMode],
          cursor: CURSORS[activeMode],
          duration: 780,
          from: 'right',
          fixedCells: true,
        })
      })
    })

    var codeBlock = document.getElementById('codeBlock')
    var codeFilename = document.getElementById('codeFilename')
    if (codeBlock) renderHighlightedCode(codeBlock, CODE_SAMPLES.vanilla.code)

    document.querySelectorAll('[data-fw]').forEach((btn) => {
      btn.addEventListener('click', () => {
        var fw = btn.getAttribute('data-fw')
        document.querySelectorAll('[data-fw]').forEach((b) => {
          b.classList.toggle('is-active', b === btn)
        })
        var sample = CODE_SAMPLES[fw]
        if (sample && codeBlock && codeFilename) {
          codeFilename.textContent = sample.file
          scrambleText(codeBlock, sample.code, {
            chars: CHARS.blocks,
            cursor: CURSORS.blocks,
            duration: 600,
            from: 'left',
            onComplete: () => {
              renderHighlightedCode(codeBlock, sample.code)
            },
          })
        }
      })
    })

    initPlayground()

    function syncClock() {
      var el = document.getElementById('clock')
      if (el) el.textContent = 'SYNC ' + new Date().toTimeString().slice(0, 8)
    }
    syncClock()
    setInterval(syncClock, 1000)

    if (!prefersReduced) setupMatrix()
  }

  function setupMatrix() {
    var canvas = document.getElementById('field')
    if (!canvas) return
    var ctx = canvas.getContext('2d')
    if (!ctx) return
    var glyphs = '01<>[]{}#$%&*+-=SCRAMBL'
    var columns = []

    function resize() {
      var r = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * r)
      canvas.height = Math.floor(window.innerHeight * r)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(r, 0, 0, r, 0, 0)
      var count = Math.ceil(window.innerWidth / 22)
      columns = []
      for (var i = 0; i < count; i++) columns.push(Math.random() * window.innerHeight)
    }

    function draw() {
      ctx.fillStyle = 'rgba(5,7,10,0.14)'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.font = '13px ui-monospace,SFMono-Regular,Menlo,monospace'
      ctx.fillStyle = 'rgba(92,255,177,0.28)'
      for (var i = 0; i < columns.length; i++) {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * 22, columns[i])
        columns[i] = columns[i] > window.innerHeight + Math.random() * 800 ? 0 : columns[i] + 22
      }
      requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
