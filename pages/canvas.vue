<template>
  <div>
    <div class="wrapper">
      <!-- <draw-canvas2 ref="drawcanvas" :points.sync="points" :mode.sync="mode" /> -->
      <draw-box2 :word="testdata" :index="0" @change="drawBoxChange" />
    </div>
    <div>
      <v-btn @click="undo"><v-icon>mdi-undo</v-icon></v-btn>
      <v-btn @click="redo"><v-icon>mdi-redo</v-icon></v-btn>
    </div>
    <div>
      <v-btn @click="clear" color="error">clear</v-btn>
      <v-btn @click="replay" color="primary">replay</v-btn>
      <v-btn @click="redraw" color="primary">redraw</v-btn>
      <v-btn @click="save" color="secondary">save</v-btn>
    </div>
  </div>
</template>
<script>
const Papa = require('papaparse')
import kt from '~/lib/kanji_test'
export default {
  layout: 'pyper',
  data() {
    return {
      mode: 0,
      points: [],
      parsed_questions: null,
    }
  },
  computed: {
    testdata() {
      if (this.parsed_questions != null) {
        return this.parsed_questions[0][0]
      } else {
        return []
      }
    },
  },
  mounted() {
    this.$axios.get('/questions.csv').then((res) => {
      this.questions = Papa.parse(res.data, { header: true }).data
      this.parsed_questions = kt.csv2obj(res.data)
    })
  },

  methods: {
    clear() {
      this.points = []
    },
    replay() {
      this.load()
      this.mode = 2
    },
    redraw() {
      this.load()
      this.mode = 1
    },
    save() {
      localStorage.setItem('canvasdata', JSON.stringify(this.points))
    },
    load() {
      let tmp = localStorage.getItem('canvasdata') || '[]'
      this.points = JSON.parse(tmp)
    },
    undo() {
      this.mode = 3
    },
    redo() {
      this.mode = 4
    },
    drawBoxChange(val) {
      console.log('drawBoxChange', val)
      this.points_debug = JSON.stringify(val)
    },
  },
}
</script>
<style lang="scss">
.wrapper {
  display: block;
  position: relative;
  width: 300px;
  height: 500px;
  border: 1px solid #808080;
}
</style>
