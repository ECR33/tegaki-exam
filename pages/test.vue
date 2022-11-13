<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="200"
      offset-x
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="teal"
          dark
          v-bind="attrs"
          v-on="on"
          fab
          small
          style="position: absolute; top: 5px; left: 5px"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <div style="margin-top: 2em; width: 100%">
              <v-slider v-model="fontSize" thumb-label min="32" max="96" />
            </div>
            <div style="white-space: nowrap">大きさ</div>
          </v-list-item>
          <v-list-item>
            <v-select
              :items="tests"
              label="テスト"
              item-text="name"
              item-value="numbers"
              :return-object="true"
              v-model="selectedTest"
            />
          </v-list-item>
          <v-list-item>
            <v-list-item-action>
              <v-switch v-model="showAnswers" />
            </v-list-item-action>
            <v-list-item-title>答え合わせ</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="menu = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    <div class="kanji-test">
      <h1 v-html="selectedSubject">
      </h1>
      <h3>{{ description }}</h3>
      <div class="group">
        <ans-box
          :q="q.exam"
          v-for="(q, index) in selectedQuestions"
          :key="index"
          :index="index"
          :fs="fontSize"
          :sa="showAnswers"
        />
        <div class="ans-box-wrapper-last"></div>
        <!-- <draw-box2 :word="testdata" :index="0" @change="drawBoxChange" /> -->
      </div>
    </div>
    <div v-if="debug">
      {{ deviceWidth }} {{ deviceHeight }} {{ devicePixelRatio }}
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
      subject: 'マンデーテスト',
      description: 'さあ、君は全問正解出るか！',
      questions: [],
      deviceWidth: 0,
      deviceHeight: 0,
      devicePixelRatio: 0,
      fontSize: 41,
      parsed_questions: null,
      tests: null,
      selectedTest: null,
      menu: false,
      showAnswers: false,
      points_debug: '',
      debug: false,
    }
  },
  watch: {
    menu() {
      if (this.menu == false) {
        this.save()
      }
    },
    selectedTest() {
      this.subject = this.selectedTest.name
      this.showAnswers = false
    },
  },
  computed: {
    testdata() {
      if (this.parsed_questions != null) {
        return this.parsed_questions[3].exam[0]
      } else {
        return []
      }
    },
    q_pages() {
      const ret = []
      const cols = Math.floor(this.q_cols.length / 2)
      for (let i = 0; i < cols; i++) {
        ret.push(this.q_cols.slice(i * 2, (i + 1) * 2))
      }
      // console.log('pages', JSON.stringify(ret))
      return ret
    },
    q_cols() {
      const len = this.questions.length
      const cols = Math.floor(len / 8)
      const ret = []
      for (let i = 0; i <= cols; i++) {
        ret.push(this.questions.slice(i * 8, (i + 1) * 8))
      }
      return ret
    },
    selectedQuestions() {
      if (!this.parsed_questions || !this.selectedTest) {
        return []
      } else {
        return this.parsed_questions.filter((q) => {
          // console.log('selectedQuestions: pq', q.number, this.selectedTest)
          if (this.selectedTest.numbers.indexOf(q.number) >= 0) {
            return true
          } else {
            return false
          }
        })
      }
    },
    selectedSubject() {
      let ret = ''
      if (this.selectedTest) {
        let tmp = this.selectedTest.name.match(/[0-9]+|\D+/gi)
        tmp.forEach((el) => {
          if (/[0-9]/gi.test(el)) {
            console.log('number', el)
            ret += '<span class="combine">' + el + '</span>'
          } else {
            console.log('string', el)
            ret += el
          }
        })
        console.log('selectedSubject:', this.selectedTest.name, ret)
      }
      return ret
    },
  },
  async mounted() {
    const base = '/tegaki-exam'
    let res = await this.$axios.get(`${base}/questions.csv`)
    this.questions = Papa.parse(res.data, { header: true }).data
    this.parsed_questions = kt.csv2obj(res.data)
    console.log(`parsed_questions: ${JSON.stringify(this.parsed_questions)}`)
    res = await this.$axios.get('/tests.csv')
    console.log('tests row', res.data)
    this.tests = kt.csv2tests(res.data)
    console.log('tests', JSON.stringify(this.tests))
    this.deviceWidth = screen.width
    this.deviceHeight = screen.height
    this.devicePixelRatio = window.devicePixelRatio
    this.load()
    console.log('testdata', this.testdata)
  },
  methods: {
    drawBoxChange(val) {
      console.log('drawBoxChange', val)
      this.points_debug = JSON.stringify(val)
    },
    save() {
      localStorage.setItem('kanji_test_config', this.fontSize)
    },
    load() {
      this.fontSize = localStorage.getItem('kanji_test_config') || this.fontSize
    },
  },
}
</script>
<style lang="scss">
.kanji-test {
  font: 14px/1.7 'Lucida Grande', 'Hiragino Kaku Gothic ProN',
    'ヒラギノ角ゴ ProN W3', '游ゴシック', 'Yu Gothic', sans-serif;
  width: 100%;
  height: 97vh;
  color: #202020;
  display: flex;
  align-items: flex-start;
  align-content: flex-end;
  @media (orientation: landscape) {
    margin: 1em 0;
    padding: 1em;
    flex-direction: row-reverse;
    float: right;
    h1,
    h3 {
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }
  }
  @media (orientation: portrait) {
    margin: 0;
    padding: 0;
    flex-direction: column;
    h1,
    h3 {
      writing-mode: horizontal-tb;
    }
  }
}

.group {
  // writing-mode: vertical-rl;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  align-content: flex-start;
  width: 85vw;
  @media (min-resolution: 1dppx) {
    font-size: 14px;
  }
  @media (min-resolution: 2dppx) {
    font-size: 28px;
  }
  @media (min-resolution: 3dppx) {
    font-size: 32 qpx;
  }
}

.ansbox {
  font-size: 3em;
  line-height: 1.2;
  position: relative;
}

.ans-box-wrapper-last {
  position: relative;
  padding: 0.5em 0.7em 0.5em 0;
  border-bottom: #c0c0c0 solid 1px;
  flex-grow: 1;
}

.combine {
  text-combine-upright: all;
  -webkit-text-combine: horizontal;
}

.line {
  text-decoration: underline;
  text-underline-position: right;
  text-decoration-style: wavy;
}
</style>
