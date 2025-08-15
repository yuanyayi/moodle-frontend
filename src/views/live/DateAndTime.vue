<template>
  <div>
    <a-date-picker :format="'YYYY-MM-DD'" style="margin-left: 10px" @change="onDateChange" v-model="tempValue.date" />
    <a-time-picker format="HH:mm" @change="onTimeChange" v-model="tempValue.time" />
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'DateAndTime',
  props: {
    val: {
      type: [Date, String, Number, moment],
      default: () => new moment(),
    },
  },
  data() {
    return {
      // 可以在这里定义其他数据属性
      value: new moment(), // moment
      tempValue: {
        date: null,
        time: null,
      },
    }
  },
  watch: {
    val: {
      immediate: true,
      handler(newVal) {
        this.tempValue = { date: newVal ? moment(newVal) : new moment(), time: newVal ? moment(newVal) : new moment() }
      },
    },
  },
  methods: {
    // 可以在这里定义其他方法
    onDateChange(v) {
      this.value = v ? moment(v).set({ hour: this.value.hour(), minute: this.value.minute(), second: 0 }) : null
      this.triggerChange(this.value)
    },
    onTimeChange(v) {
      this.value = v ? moment(this.value).set({ hour: v.hour(), minute: v.minute(), second: 0 }) : null
      this.triggerChange(this.value)
    },
    triggerChange(changedValue) {
      // console.log('DateAndTime changed:', changedValue.format())
      this.$emit('change', changedValue)
    },
  },
}
</script>
