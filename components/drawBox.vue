<template>
  <div class="draw-box-wrapper" ref="drawboxwrapper">
    <div class="drawtext" ref="drawtext">
      (<ruby>
        {{ word.a }}
        <rt>{{ word.q }}</rt> </ruby
      >)
    </div>
    <div class="drawdebugbox">
      {{ x }},{{ y }}, {{ Math.round(r * 100) }}%, {{ px }}, {{ c_w }},
      {{ c_h }}
    </div>
    <div class="pointerbox">{{ pointNow }}</div>
    <draw-canvas2
      ref="drawcanvas"
      :points.sync="points"
      :mode.sync="mode"
      :w.sync="c_w"
      :h.sync="c_h"
    />
    <div class="command-bar">
      <v-btn small color="teal" icon @click="load">
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-btn small color="teal" icon @click="emitChange">
        <v-icon>mdi-ladybug</v-icon>
      </v-btn>
      <v-btn small color="teal" icon @click="replay">
        <v-icon>mdi-play-circle</v-icon>
      </v-btn>
      <v-btn small color="teal" icon @click="clear">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
  </div>
</template>
<script>
export default {
  props: ['word', 'index'],
  data() {
    return {
      x: 0,
      y: 0,
      r: 1,
      px: '',
      isOn: false,
      isEffective: false,
      points: [],
      pointNow: null,
      mode: 0,
      currentWidth: 0,
      c_w: 0,
      c_h: 0,
    }
  },
  mounted() {
    this.resize()
    console.log('drawBox mounted:', this.index, JSON.stringify(this.word))
  },
  methods: {
    resize() {
      if (this.currentWidth == window.innerWidth) {
        return
      }
      this.r = window.devicePixelRatio
      this.currentWidth = window.innerWidth
      let wrapper = this.$refs.drawboxwrapper
      this.px = Math.round(72 * this.r) + 'px'
      wrapper.style.fontSize = this.px
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
  },
}
</script>
<style lang="scss" scoped>
.draw-box-wrapper {
  display: block;
  position: relative;
  padding: 0.5em 0 0.5em 0.5em;
  margin: 0;
  width: 350px;
  height: 550px;
  // font-size: 14px;
}

.drawtext {
  position: relative;
}

.drawdebugbox {
  position: absolute;
  top: 0;
  left: 0;
  writing-mode: horizontal-tb;
  font-size: 10px;
}

.command-bar {
  position: absolute !important;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column-reverse;
}

.pointerbox {
  position: absolute;
  bottom: 0;
  left: 0;
  writing-mode: horizontal-tb;
  font-size: 10px;
}

ruby {
  color: rgba(0, 0, 0, 0);
  word-break: keep-all;
}

rt {
  color: #202020;
  font-size: 0.2em;
}
</style>
