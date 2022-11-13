<template>
  <div class="ans-box-wrapper">
    <div v-for="(word, index) in q" :key="index">
      <div
        class="wordbox"
        :style="{ 'font-size': fs / 2 + 'px' }"
        v-if="word.type == 0"
      >
        {{ word.q }}
      </div>
      <div v-if="debug" class="debugbox">{{ x }},{{ y }}</div>
      <draw-box2
        :word="word"
        :index="index"
        :fs="fontSize"
        :sa="sa"
        v-if="word.type == 1"
      />
    </div>
  </div>
</template>
<script>
// 君の(実力)を(発揮)する,きみの(じつりょく)を(はっき)する
// きみの<ruby>実力<rt>じつりょく</rt></ruby>を<ruby>発揮<rt>はっき</rt></ruby>する
//
// [ {text: '君の', type: 0}, {text: '実力', type: 1}, {text:'を', type:0}, ....]

export default {
  props: ['q', 'index', 'fs', 'sa'],
  data() {
    return {
      question: [],
      answer: [],
      html: '',
      handwriter: null,
      canvas: null,
      ansbox: null,
      x: 0,
      y: 0,
      fontSize: 64,
      mode: 0,
      debug: false,
    }
  },
  watch: {
    'q.answer'() {
      this.answer = this.analyse(this.q.answer)
      console.log('a:', JSON.stringify(this.answer))
    },
    'q.question'() {
      this.question = this.analyse(this.q.question)
      console.log('q:', JSON.stringify(this.question))
    },
    fs() {
      this.fontSize = this.fs
    },
  },
  created() {},
  mounted() {
    this.fontSize = this.fs
    // console.log('asnBox mouned:', this.index, JSON.stringify(this.q))
  },
  methods: {
    debugPrint() {
      let w = this.canvas.width
      let h = this.canvas.height
      let a_x = this.ansbox.clientX
      let a_y = this.ansbox.clientY
      let a_w = this.ansbox.clientWidth
      let a_h = this.ansbox.clientHeight
      console.log(`canvas: w:${w}, h:${h}`)
      console.log(`ansbox: w:${a_w}, h:${a_h}`)
      console.log(`q: ${JSON.stringify(this.q)}`)
    },
    create() {
      let ret = ''
      for (let i = 0; i < this.q.length; i++) {
        let ans = this.q[i].a
        if (this.q[i].type == 0) {
          ret += '<span class="text">' + ans + '</span>'
        } else if (this.q[i].type == 1) {
          ret += '（<ruby>' + ans + '<rt>' + this.q[i].q + '</rt></ruby>）'
        }
      }
      return ret
    },
  },
}
</script>
<style lang="scss">
.ans-box-wrapper {
  position: relative;
  padding: 0.5em 0.7em 0.5em 0;
  border-bottom: #c0c0c0 solid 1px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.wordbox {
  display: block;
  writing-mode: vertical-rl;
  // position: absolute;
  // top: 0.5em;
  // left: 0;
  // border: 1px #c0c0c0 solid;
  // font-size: 2em;
}
</style>
