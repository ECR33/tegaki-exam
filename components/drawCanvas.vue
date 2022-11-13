<template>
  <canvas
    ref="canvas"
    class="drawcanvas"
    @pointerdown.prevent.stop="pointerdown"
    @pointerup.prevent.stop="pointerup"
    @pointermove.prevent.stop="pointermove"
    :width="c_w"
    :height="c_h"
  ></canvas>
</template>
<script>
export default {
  props: ['points', 'mode', 'w', 'h'],
  data() {
    return {
      x: 0,
      y: 0,
      r: 1,
      px: '',
      color: '#606060',
      c_w: 0,
      c_h: 0,
      currentWidth: 0,
      isOn: false,
      isEffective: false,
      isMoved: false,
      currnetPoint: null,
      currentLine: null,
      innerPoints: [],
      redodata: [],
    }
  },
  watch: {
    mode() {
      switch (this.mode) {
        case 0:
          // handwriting
          break
        case 1:
          // redraw
          this.clear()
          this.reDraw()
          this.$emit('update:mode', 0)
          break
        case 2:
          // replay
          this.clear()
          this.rePlay()
          this.$emit('update:mode', 0)
          break
        case 3:
          // undo
          this.undo()
          this.$emit('update:mode', 0)
          break
        case 4:
          // redo
          this.redo()
          this.$emit('update:mode', 0)
          break
        case 5:
          // sync points
          this.$emit('update:points', this.innerPoints)
          this.$emit('update:mode', 0)
      }
    },
    points() {
      if (this.points.length == 0) {
        this.innerPoints = this.points
        this.clear()
      } else {
        if (this.mode == 0) {
          this.innerPoints = this.points
        }
      }
    },
  },
  mounted() {
    this.resize()
    window.addEventListener('orientationchange', this.resize)
    window.addEventListener('resize', this.resize)
  },
  methods: {
    getPoint(e) {
      return { x: e.layerX, y: e.layerY }
    },
    pointerup(e) {
      if (this.isOn) {
        e.target.releasePointerCapture(e.pointerId)
        let p = this.getPoint(e)
        if (this.isEffective) {
          this.isEffective = false
          // this.drawLine(p)
          if (!this.isMoved) {
            this.currentLine.push(p)
          }
          this.isMoved = false
          this.innerPoints.push(this.currentLine)
          this.isOn = false
        }
      }
      this.currentLine = null
      this.currnetPoint = null
    },
    pointerdown(e) {
      if (this.mode != 0) {
        return
      }
      if (e.isPrimary) {
        this.isOn = true
        this.isEffective = false
        this.isMoved = false
        e.target.setPointerCapture(e.pointerId)
        let p = this.getPoint(e)
        setTimeout(() => {
          if (this.isOn) {
            this.isEffective = true
            this.currentLine = []
            this.currnetPoint = p
            this.drawLine(p)
          }
        }, 50)
      } else {
        this.isOn = false
        e.target.releasePointerCapture(e.pointerId)
        this.currentLine = null
        this.currnetPoint = null
      }
    },
    pointermove(e) {
      if (this.isOn && this.isEffective) {
        this.isMoved = true
        let p = this.getPoint(e)
        this.drawLine(p)
        this.currentLine.push(p)
        this.currnetPoint = p
      }
    },
    drawLine(p) {
      let context = this.canvas.getContext('2d')
      context.beginPath()
      context.moveTo(this.currnetPoint.x, this.currnetPoint.y)
      context.lineTo(p.x, p.y)
      context.lineWidth = 3
      context.lineCap = 'round'
      context.strokeStyle = this.color
      context.stroke()
    },
    reDraw() {
      this.$nextTick(() => {
        for (let i = 0; i < this.innerPoints.length; i++) {
          this.currnetPoint = this.innerPoints[i][0]
          for (let j = 0; j < this.innerPoints[i].length; j++) {
            this.drawLine(this.innerPoints[i][j])
            this.currnetPoint = this.innerPoints[i][j]
          }
        }
      })
    },
    rePlay() {
      this.$nextTick(async () => {
        for (let i = 0; i < this.innerPoints.length; i++) {
          this.currnetPoint = this.innerPoints[i][0]
          for (let j = 0; j < this.innerPoints[i].length; j++) {
            this.drawLine(this.innerPoints[i][j])
            this.currnetPoint = this.innerPoints[i][j]
            await this.sleep(10)
          }
          await this.sleep(500)
        }
      })
    },
    resize() {
      if (this.currentWidth == window.innerWidth) {
        return
      }
      this.currentWidth = window.innerWidth
      setTimeout(() => {
        this.r = window.devicePixelRatio
        this.canvas = this.$refs.canvas
        console.log('canvas', this.canvas.clientWidth, this.canvas.clientHeight)
        // let wrapper = this.$refs.wrapper
        // this.px = Math.round(72 * this.r) + 'px'
        // wrapper.style.fontSize = this.px
        // this.canvas.setAttribute('width', this.canvas.clientWidth)
        // this.canvas.setAttribute('height', this.canvas.clientHeight)
        this.c_w = this.canvas.clientWidth
        this.c_h = this.canvas.clientHeight
        this.$emit('update:w', this.canvas.clientWidth)
        this.$emit('update:h', this.canvas.clientHeight)
        let a_w = window.screen.availWidth
        let s_w = window.screen.width
        let c_w = document.documentElement.clientWidth
        console.log(`resize: ${a_w}, ${s_w}, ${c_w}, ${this.r * 100}`)
      }, 200)
    },
    clear() {
      let context = this.canvas.getContext('2d')
      context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, ms)
      })
    },
    undo() {
      if (this.innerPoints.length == 0) {
        return
      }
      let tmp = this.innerPoints.slice(-1)
      this.redodata.push(tmp[0])
      this.innerPoints = this.innerPoints.slice(0, -1)
      this.clear()
      this.reDraw()
    },
    redo() {
      if (this.redodata.length == 0) {
        return
      }
      let tmp = this.redodata.slice(-1)
      this.innerPoints.push(tmp[0])
      this.redodata = this.redodata.slice(0, -1)
      this.clear()
      this.reDraw()
    },
  },
}
</script>
<style lang="scss" scoped>
.drawcanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px #c0c0c0 dashed;
  // touch-action: pinch-zoom;
  touch-action: none;
}
</style>
