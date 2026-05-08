<p align="center">
  <a href="https://scrambl.vikingz.me">
    <img src="https://scrambl.vikingz.me/logo-mark.webp" alt="Scrambl" width="96" />
  </a>
</p>

<h1 align="center">@scrambl/vue</h1>

<p align="center">
  Vue composables and components for Scrambl text effects.
</p>

<p align="center">
  <a href="https://scrambl.vikingz.me/frameworks/vue/">Vue Docs</a>
  ·
  <a href="https://scrambl.vikingz.me/examples/demo-lab/">Demo Lab</a>
  ·
  <a href="https://github.com/vikingmute/scrambl/issues">Issues</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@scrambl/vue"><img src="https://img.shields.io/npm/v/@scrambl/vue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@scrambl/vue"><img src="https://img.shields.io/npm/dm/@scrambl/vue" alt="npm downloads" /></a>
  <a href="https://github.com/vikingmute/scrambl/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT license" /></a>
</p>

`@scrambl/vue` provides a composable and a component for text scramble animations in Vue. It includes `@scrambl/core` as a dependency, so you do not need to install the core package separately.

## Install

```bash
npm install @scrambl/vue
```

## `useScramble`

The composable is the primary API. Attach the returned template ref to the element you want to animate.

```vue
<script setup>
import { useScramble } from '@scrambl/vue'

const { ref, replay, pause, resume, isPlaying } = useScramble({
  text: 'Hello World',
  chars: 'blocks',
  from: 'left',
  duration: 800,
  trigger: 'hover',
  playOnMount: true,
})
</script>

<template>
  <div>
    <h1 ref="ref" />
    <button @click="replay">Replay</button>
    <button @click="pause">Pause</button>
    <button @click="resume">Resume</button>
    <span v-if="isPlaying">Playing</span>
  </div>
</template>
```

### Composable Options

`useScramble` accepts every [`ScrambleOptions`](https://scrambl.vikingz.me/api/options/) field plus:

| Option | Default | Description |
| --- | --- | --- |
| `trigger` | `'manual'` | `manual`, `hover`, `click`, or `inView` |
| `playOnMount` | `true` | Play immediately when the element mounts |
| `inViewOptions` | `{ threshold: 0.1 }` | `IntersectionObserver` options for `trigger: 'inView'` |

### Composable Return Value

| Property | Description |
| --- | --- |
| `ref` | Template ref for the target element |
| `replay()` | Restart the animation |
| `pause()` | Pause playback |
| `resume()` | Resume playback |
| `isPlaying` | Reactive playing state |

## `ScrambleText`

Use the component for straightforward cases.

```vue
<script setup>
import { ScrambleText } from '@scrambl/vue'
</script>

<template>
  <ScrambleText
    as="h1"
    text="Hello World"
    chars="blocks"
    trigger="hover"
  />
</template>
```

The component accepts all scramble options as props plus:

| Prop | Default | Description |
| --- | --- | --- |
| `as` | `'span'` | HTML element tag to render |

## Exposed Methods

Access component controls through a template ref.

```vue
<script setup>
import { ref } from 'vue'
import { ScrambleText } from '@scrambl/vue'

const scrambleRef = ref()
</script>

<template>
  <ScrambleText ref="scrambleRef" text="Hello" chars="blocks" />
  <button @click="scrambleRef?.replay()">Replay</button>
</template>
```

## Patterns

### Scroll Reveal

```vue
<script setup>
import { useScramble } from '@scrambl/vue'

const { ref } = useScramble({
  text: 'Revealed on scroll',
  chars: 'braille',
  trigger: 'inView',
  playOnMount: false,
  duration: 1200,
  from: 'random',
})
</script>

<template>
  <p ref="ref" />
</template>
```

### Text Cycling

```vue
<script setup>
import { ref as vueRef, onMounted, onUnmounted } from 'vue'
import { useScramble } from '@scrambl/vue'

const words = ['Developer', 'Designer', 'Creator']
const index = vueRef(0)

const { ref, replay } = useScramble({
  text: words[index.value],
  chars: 'katakana',
  duration: 600,
})

let timer: number

onMounted(() => {
  timer = window.setInterval(() => {
    index.value = (index.value + 1) % words.length
    replay()
  }, 3000)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <span ref="ref" />
</template>
```

## Requirements

- Vue 3.3+
- Modern browsers with `requestAnimationFrame`
- TypeScript declarations are included

## License

MIT
