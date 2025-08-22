<template>
  <div>
    <a-date-picker :format="'YYYY-MM-DD'" style="margin-left: 10px" @change="onDateChange" v-model="tempValue.date" />
    <a-time-picker format="HH:mm" @change="onTimeChange" v-model="tempValue.time" />
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "DateAndTime",
  props: {
    value: {
      type: [Date, String, Number, moment],
      default: () => new moment(),
    },
  },
  data() {
    return {
      // 可以在这里定义其他数据属性
      selfValue: new moment(), // moment 整体时间，最终值
      tempValue: {
        // 给组件看的
        date: null,
        time: null,
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        console.log("DateAndTime value:", newVal);
        newVal = newVal || moment();
        this.selfValue = newVal;
        this.tempValue = { date: newVal ? moment(newVal) : new moment(), time: newVal ? moment(newVal) : new moment() };
        this.triggerChange(newVal || this.selfValue);
      },
    },
  },
  methods: {
    // 可以在这里定义其他方法
    onDateChange(v) {
      this.selfValue = v ? moment(v).set({ hour: this.selfValue.hour(), minute: this.selfValue.minute(), second: 0 }) : null;
      this.triggerChange(this.selfValue);
    },
    onTimeChange(v) {
      this.selfValue = v ? moment(this.selfValue).set({ hour: v.hour(), minute: v.minute(), second: 0 }) : null;
      this.triggerChange(this.selfValue);
    },
    triggerChange(changedValue) {
      console.log("DateAndTime changed:", changedValue.format());
      this.$emit("change", changedValue);
    },
  },
};
</script>
