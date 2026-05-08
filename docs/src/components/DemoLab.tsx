import { scramble } from '@scrambl/core'
import type { CharsetPreset, RenderMode, RevealDirection, ScrambleOptions } from '@scrambl/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import './DemoLab.css'

type DemoCase = {
  title: string
  text: string
  note: string
  options: ScrambleOptions
}

const charsets: CharsetPreset[] = [
  'blocks',
  'shades',
  'braille',
  'symbols',
  'numbers',
  'binary',
  'hex',
  'katakana',
  'katakanaFull',
]

const directions: RevealDirection[] = ['left', 'right', 'center', 'random']
const renderModes: RenderMode[] = ['auto', 'text', 'cells']

const demoCases: DemoCase[] = [
  {
    title: 'Hero headline',
    text: 'SYSTEM ONLINE',
    note: 'blocks + left + cursor',
    options: {
      chars: 'blocks',
      from: 'left',
      duration: 1200,
      cursor: '▌',
      ease: 'easeOutCubic',
      override: '',
    },
  },
  {
    title: 'Glitch burst',
    text: 'ERROR: SIGNAL LOST',
    note: 'symbols + random + perturbation',
    options: {
      chars: 'symbols',
      from: 'random',
      duration: 520,
      perturbation: 0.9,
      ease: 'easeOutQuad',
      loop: 2,
    },
  },
  {
    title: 'Numeric ticker',
    text: 'BUILD 2026.05.07',
    note: 'numbers + right',
    options: {
      chars: 'numbers',
      from: 'right',
      duration: 900,
      ease: 'easeOutExpo',
      seed: 407,
    },
  },
  {
    title: 'Kana decode',
    text: 'Wake up, Scrambl',
    note: 'katakana + center + cells',
    options: {
      chars: 'katakana',
      from: 'center',
      duration: 1500,
      cursor: '░',
      renderMode: 'cells',
      ease: 'easeInOutCubic',
    },
  },
  {
    title: 'Multilingual',
    text: '你好 Scrambl こんにちは',
    note: 'katakanaFull + auto',
    options: {
      chars: 'katakanaFull',
      from: 'left',
      duration: 1300,
      renderMode: 'auto',
      fill: ' ',
    },
  },
  {
    title: 'Long label',
    text: 'Zero-dependency text scramble animation library',
    note: 'braille + stable layout',
    options: {
      chars: 'braille',
      from: 'random',
      duration: 1800,
      renderMode: 'auto',
      perturbation: 0.35,
      seed: 99,
    },
  },
]

function optionLine(options: ScrambleOptions) {
  const entries = Object.entries(options).filter(([, value]) => value !== undefined)

  return entries
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}: '${value}'`
      return `${key}: ${String(value)}`
    })
    .join(',\n  ')
}

function DemoTile({ demo, replayToken }: { demo: DemoCase; replayToken: number }) {
  const [localReplayToken, setLocalReplayToken] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void replayToken
    void localReplayToken
    if (!ref.current) return

    const instance = scramble(ref.current, {
      text: demo.text,
      ...demo.options,
    })

    return () => instance.destroy()
  }, [demo, localReplayToken, replayToken])

  return (
    <article className="demo-tile">
      <div className="demo-tile__meta">
        <div>
          <span>{demo.title}</span>
          <small>{demo.note}</small>
        </div>
        <button
          aria-label={`Replay ${demo.title}`}
          className="demo-tile__replay"
          onClick={() => setLocalReplayToken((value) => value + 1)}
          type="button"
        >
          Replay
        </button>
      </div>
      <div className="demo-tile__output" ref={ref}>
        {demo.text}
      </div>
      <pre className="demo-tile__code">
        <code>{`scramble(el, {
  text: '${demo.text}',
  ${optionLine(demo.options)}
})`}</code>
      </pre>
    </article>
  )
}

function Workbench({ replayToken }: { replayToken: number }) {
  const [text, setText] = useState('Scrambl Demo Lab\nmultiline ready')
  const [chars, setChars] = useState<CharsetPreset>('blocks')
  const [from, setFrom] = useState<RevealDirection>('center')
  const [duration, setDuration] = useState(1600)
  const [perturbation, setPerturbation] = useState(0)
  const [renderMode, setRenderMode] = useState<RenderMode>('auto')
  const outputRef = useRef<HTMLDivElement | null>(null)

  const options = useMemo<ScrambleOptions>(
    () => ({
      text,
      chars,
      from,
      duration,
      perturbation,
      renderMode,
      cursor: chars === 'numbers' ? '' : '▌',
      ease: 'easeOutCubic',
      override: '',
      seed: 2026,
    }),
    [chars, duration, from, perturbation, renderMode, text],
  )

  useEffect(() => {
    void replayToken
    if (!outputRef.current) return
    const instance = scramble(outputRef.current, options)

    return () => instance.destroy()
  }, [options, replayToken])

  return (
    <section className="demo-workbench" aria-label="Interactive demo workbench">
      <div className="demo-workbench__preview">
        <span className="demo-eyebrow">Workbench</span>
        <div className="demo-workbench__output" ref={outputRef}>
          {text}
        </div>
      </div>

      <div className="demo-controls">
        <label className="demo-field">
          <span>Text</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            spellCheck={false}
          />
        </label>

        <div className="demo-field">
          <span>Chars</span>
          <div className="demo-segmented">
            {charsets.map((item) => (
              <button
                className={item === chars ? 'is-active' : ''}
                key={item}
                onClick={() => setChars(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-field">
          <span>Direction</span>
          <div className="demo-segmented demo-segmented--compact">
            {directions.map((item) => (
              <button
                className={item === from ? 'is-active' : ''}
                key={item}
                onClick={() => setFrom(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-range-grid">
          <label className="demo-field">
            <span>Duration {duration}ms</span>
            <input
              max="2600"
              min="200"
              onChange={(event) => setDuration(Number(event.target.value))}
              step="100"
              type="range"
              value={duration}
            />
          </label>
          <label className="demo-field">
            <span>Perturbation {perturbation.toFixed(2)}</span>
            <input
              max="1"
              min="0"
              onChange={(event) => setPerturbation(Number(event.target.value))}
              step="0.05"
              type="range"
              value={perturbation}
            />
          </label>
        </div>

        <div className="demo-field">
          <span>Render mode</span>
          <div className="demo-segmented demo-segmented--compact">
            {renderModes.map((item) => (
              <button
                className={item === renderMode ? 'is-active' : ''}
                key={item}
                onClick={() => setRenderMode(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function DemoLab() {
  const [replayToken, setReplayToken] = useState(0)

  return (
    <div className="demo-lab">
      <div className="demo-lab__header">
        <div>
          <span className="demo-eyebrow">Examples</span>
          <h2>Demo Lab</h2>
          <p>
            Fast visual coverage for presets, timing, render modes, and multilingual edge cases.
          </p>
        </div>
        <button type="button" onClick={() => setReplayToken((value) => value + 1)}>
          Replay all
        </button>
      </div>

      <Workbench replayToken={replayToken} />

      <section className="demo-grid" aria-label="Scrambl parameter examples">
        {demoCases.map((demo) => (
          <DemoTile demo={demo} key={demo.title} replayToken={replayToken} />
        ))}
      </section>
    </div>
  )
}
