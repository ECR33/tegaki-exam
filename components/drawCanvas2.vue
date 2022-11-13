<template>
  <canvas ref="canvas" class="drawcanvas" :width="c_w" :height="c_h"></canvas>
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
      lineWidth: 3,
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
      eracedData: [],
      //
      canvas: null,
      context: null,
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
        this.eracedData = this.innerPoints
        this.redodata = []
        this.innerPoints = this.points
        this.clear()
      } else {
        if (this.mode == 0) {
          this.innerPoints = this.points
        }
      }
    },
    w() {
      this.c_w = this.w
    },
    h() {
      this.c_h = this.h
    },
  },
  mounted() {
    this.init()
    // this.resize()
    // window.addEventListener('orientationchange', this.resizeEvent)
    // window.addEventListener('resize', this.resize)
  },
  methods: {
    init() {
      this.canvas = this.$refs.canvas
      this.context = this.canvas.getContext('2d')
      this.canvas.addEventListener('pointerdown', this.pointerdown, false)
      this.canvas.addEventListener('pointerup', this.pointerup, false)
      this.canvas.addEventListener('pointermove', this.pointermove, false)
    },
    resize() {
      // if (this.currentWidth == window.innerWidth) {
      //   return
      // }
      this.currentWidth = window.innerWidth
      this.$nextTick(() => {
        this.r = window.devicePixelRatio
        this.c_w = this.canvas.clientWidth
        this.c_h = this.canvas.clientHeight
        this.$emit('update:w', this.canvas.clientWidth)
        this.$emit('update:h', this.canvas.clientHeight)
      })
      // setTimeout(() => {}, 50)
    },
    resizeEvent() {
      this.resize()
    },
    getPoint(e) {
      return { x: e.layerX, y: e.layerY }
    },
    pointerup(e) {
      if (!this.isMoved) {
        let p = this.getPoint(e)
        this.currentLine.push(p)
        this.context.lineTo(p.x, p.y)
        this.context.lineCap = 'round'
        this.context.lineWidth = this.lineWidth
        this.context.strokeStyle = this.color
        this.context.stroke()
      }
      this.innerPoints.push(this.currentLine)
      this.isMoved = false
    },
    pointerdown(e) {
      e.preventDefault()
      if (this.mode != 0) {
        return
      }
      this.redodata = []
      this.eracedData = []
      e.target.setPointerCapture(e.pointerId)
      let p = this.getPoint(e)
      this.currentLine = []
      this.currentLine.push(p)
      this.isMoved = false
      this.context.beginPath()
      this.context.moveTo(p.x, p.y)
    },
    pointermove(e) {
      if (e.buttons == 1 || e.witch == 1 || e.type == 'touchmove') {
        this.isMoved = true
        let p = this.getPoint(e)
        this.currentLine.push(p)
        this.context.lineTo(p.x, p.y)
        this.context.lineCap = 'round'
        this.context.lineWidth = this.lineWidth
        this.context.strokeStyle = this.color
        this.context.stroke()
      }
    },
    drawLine(p) {
      this.context.beginPath()
      this.context.moveTo(this.currnetPoint.x, this.currnetPoint.y)
      this.context.lineTo(p.x, p.y)
      this.context.lineWidth = this.lineWidth
      this.context.lineCap = 'round'
      this.context.strokeStyle = this.color
      this.context.stroke()
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
            await this.sleep(5)
          }
          await this.sleep(300)
        }
      })
    },
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.fillStyle = 'rgb(255,255,255'
    },
    sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, ms)
      })
    },
    undo() {
      if (this.eracedData.length > 0) {
        this.innerPoints = this.eracedData
        this.eracedData = []
        this.clear()
        this.reDraw()
        return
      }
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
<style lang="scss">
.drawcanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  touch-action: pinch-zoom;
  // touch-action: none;
}
@media screen {
  .drawcanvas {
    border: 1px #c0c0c0 dashed;
  }
}
@media print {
}
</style>
