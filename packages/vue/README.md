# @scrambl/vue

Vue composables and components for text scramble effects. Powered by `@scrambl/core`.

## Install

```bash
npm install @scrambl/vue
```

## Composable

```vue
<script setup>
import { useScramble } from '@scrambl/vue'

const { ref, replay } = useScramble({
  text: 'Hello World',
  chars: 'blocks',
  trigger: 'hover',
})
</script>

<template>
  <h1 ref="ref" />
</template>
```

## Component

```vue
<ScrambleText as="h1" text="Hello" chars="blocks" trigger="hover" />
```

## Docs

[scrambl.dev/frameworks/vue](https://scrambl.dev/frameworks/vue/)

## License

MIT
