<template>
  <div class="draw-box-wrapper" ref="drawboxwrapper">
    <div class="drawtext" ref="drawtext">
      <span>（</span>
      <ruby :class="{ 'ruby-hint': !hint }">
        {{ word.a }}
        <rt>{{ ans }}</rt>
      </ruby>
      <span>）</span>
    </div>
    <div v-if="debug" class="drawdebugbox">
      {{ x }},{{ y }}, {{ Math.round(ratio * 100) }}%, {{ px }}, {{ c_w }},
      {{ c_h }}
    </div>
    <div v-if="debug" class="pointerbox">{{ pointNow }}</div>
    <draw-canvas2
      ref="drawcanvas"
      :points.sync="points"
      :mode.sync="mode"
      :w.sync="c_w"
      :h.sync="c_h"
    />
    <div class="command-bar">
      <div v-if="debug">
        <v-btn
          :x-small="ratio < 2"
          :small="ratio >= 2"
          color="teal"
          icon
          @click="load"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn
          :x-small="ratio < 2"
          :small="ratio >= 2"
          color="teal"
          icon
          @click="emitChange"
        >
          <v-icon>mdi-ladybug</v-icon>
        </v-btn>
        <v-btn
          :x-small="ratio < 2"
          :small="ratio >= 2"
          color="teal"
          icon
          @click="replay"
        >
          <v-icon>mdi-play-circle</v-icon>
        </v-btn>
      </div>
      <v-btn
        :x-small="ratio < 2"
        :small="ratio >= 2"
        color="teal"
        icon
        @click="undo"
      >
        <v-icon>mdi-undo</v-icon>
      </v-btn>
      <v-btn
        :x-small="ratio < 2"
        :small="ratio >= 2"
        color="teal"
        icon
        @click="redo"
      >
        <v-icon>mdi-redo</v-icon>
      </v-btn>
      <v-btn
        :x-small="ratio < 2"
        :small="ratio >= 2"
        color="teal"
        icon
        @click="showHint"
      >
        <v-icon>mdi-help-circle</v-icon>
      </v-btn>
      <v-btn
        :x-small="ratio < 2"
        :small="ratio >= 2"
        color="teal"
        icon
        @click="clear"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
  </div>
</template>
<script>
export default {
  props: ['word', 'index', 'fs', 'sa', 'md'],
  data() {
    return {
      x: 0,
      y: 0,
      ratio: 1,
      fontSize: 64,
      px: '',
      isOn: false,
      isEffective: false,
      points: [],
      pointNow: null,
      mode: 0,
      currentWidth: 0,
      c_w: 0,
      c_h: 0,
      drawtext: null,
      hint: false,
      showAnswers: false,
      debug: false,
    }
  },
  watch: {
    word() {
      this.$nextTick(() => {
        if (this.word.a.length > 0) {
          this.clear()
          this.resize()
        }
      })
    },
    fs() {
      this.fontSize = this.fs
      this.$nextTick(() => {
        this.init()
        this.$nextTick(() => {
          this.resize()
        })
      })
      // console.log('drawBox2: fs changed', this.fs, this.fontSize)
    },
    sa() {
      console.log('drawBox2: showAnswers chenged')
      this.showAnswers = this.sa
    },
    md() {
      this.mode = this.md
    },
    mode() {
      this.$emit('update:md', this.mode)
    },
  },
  computed: {
    ans() {
      if (this.showAnswers) {
        return this.word.a
      } else {
        return this.word.q
      }
    },
  },
  mounted() {
    this.drawtext = this.$refs.drawtext
    this.init()
    this.$nextTick(() => {
      this.resize()
    })
    window.addEventListener('orientationchange', this.resizeEvent)
    window.addEventListener('resize', this.resizeEvent)
  },
  methods: {
    init() {
      this.ratio = window.devicePixelRatio
      let wrapper = this.$refs.drawboxwrapper
      let baseSize = Math.round(this.fontSize * this.ratio)
      this.px = baseSize + 'px'
      wrapper.style.fontSize = this.px
      wrapper.style.padding = `28px 0 0 0` //`28px 10px 10px 10px`
      let w = Math.round(baseSize + (this.fontSize / 2) * this.ratio)
      wrapper.style.width = `${w}px`
      // 20: padding * 2
      // 40: ruby width
      this.c_w = w
      // console.log('drawBox2: initialized', this.c_w, this.fontSize)
    },
    resize() {
      // if (this.currentWidth == window.innerWidth) {
      //   return
      // }
      this.currentWidth = window.innerWidth
      let wrapper = this.$refs.drawboxwrapper
      let baseSize = Math.round(this.fontSize * this.ratio)
      let h = Math.round(baseSize * (this.word.a.length + 2) - baseSize / 3)
      // baseSize /3 => tweak by hand
      wrapper.style.height = `${h}px`
      this.c_h = h
      // console.log('drawBox2: resized', this.fontSize)
    },
    resizeEvent() {
      console.log('drawBox2: resize event occured')
      this.resize()
    },
    replay() {
      this.mode = 2
    },
    clear() {
      this.points = []
    },
    emitChange() {
      this.mode = 5
      this.$nextTick(() => {
        this.$emit('change', this.points)
      })
    },
    load() {
      this.$axios.get('/data_b.json').then((res) => {
        this.points = res.data
      })
    },
    showHint() {
      this.hint = true
      setTimeout(() => {
        this.hint = false
      }, 1000)
    },
    undo() {
      this.mode = 3
    },
    redo() {
      this.mode = 4
    },
  },
}
</script>
<style lang="scss">
.draw-box-wrapper {
  display: block;
  position: relative;
  margin: 0;
  // border: 1px solid black;
  // box-sizing: content-box;
}

.drawtext {
  display: block;
  position: absolute;
  top: -0.5em;
  left: 0;
  bottom: 0;
  right: 0;
  writing-mode: vertical-rl;
  white-space: nowrap;
  // overflow: hidden;
}

.drawdebugbox {
  position: absolute;
  top: 0;
  left: 0;
  writing-mode: horizontal-tb;
  font-size: 10px;
}

.command-bar {
  writing-mode: horizontal-tb;
  position: absolute !important;
  top: 0;
  right: 0;
  display: flex;
  // flex-direction: column-reverse;
}
@media print {
  .command-bar {
    display: none;
  }
}

.pointerbox {
  position: absolute;
  bottom: 0;
  left: 0;
  writing-mode: horizontal-tb;
  font-size: 10px;
}

ruby {
  word-break: keep-all;
  color: rgba(200, 200, 200, 255);
}

.ruby-hint {
  color: rgba(200, 200, 200, 0);
  transition: color 2s;
}

rt {
  color: #202020;
  font-size: 0.2em;
}
</style>
