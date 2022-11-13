const Papa = require('papaparse')

export default {
  questions: null,
  parsed_questions: [],
  csv2obj(csv) {
    this.parsed_questions = []
    this.questions = Papa.parse(csv, { header: true }).data
    this.questions.forEach((q) => {
      let answer = this.analyse(q.answer)
      let question = this.analyse(q.question)
      let qObj = {
        grade: q.grade,
        term: q.term,
        number: q.number,
        exam: this.create(question, answer),
      }
      this.parsed_questions.push(qObj)
    })
    return this.parsed_questions
  },
  analyse(val) {
    let ret = []
    let tmp = ''
    let start = 0
    let l = val.indexOf('(', start)
    if (l == -1) {
      ret.push({ text: val, type: 1 })
      return ret
    }
    while (l != -1) {
      if (start != l) {
        if (start == 0) {
          tmp = val.slice(start, l)
          ret.push({ text: tmp, type: 0 })
        } else {
          tmp = val.slice(start + 1, l)
          ret.push({ text: tmp, type: 0 })
        }
      }
      let r = val.indexOf(')', l)
      if (r == -1) {
        // unmatch parences
        tmp = val.slice(l + 1)
        ret.push({ text: tmp, type: 0 })
        return ret
      } else {
        start = r
      }
      tmp = val.slice(l + 1, r)
      ret.push({ text: tmp, type: 1 })
      l = val.indexOf('(', start)
    }
    if (val.length > start) {
      tmp = val.slice(start + 1)
      ret.push({ text: tmp, type: 0 })
    }
    return ret
  },
  create(question, answer) {
    let ret_parsed = []
    for (let i = 0; i < question.length; i++) {
      let ans = answer[i] || { text: '' }
      ret_parsed.push({
        q: question[i].text,
        a: ans.text,
        type: question[i].type,
      })
    }
    return ret_parsed
  },
  csv2tests(csv) {
    let ret = []
    let tests = Papa.parse(csv, { header: true }).data
    console.log('csv2tests', JSON.stringify(tests))
    tests.forEach((t) => {
      console.log('t.numbers', t)
      let numbers = []
      let tmp = t.numbers.trim().split(' ')
      tmp.forEach((tt) => {
        numbers.push(tt)
      })
      let obj = {
        name: t.name,
        numbers: numbers,
      }
      ret.push(obj)
    })
    return ret
  },
}
