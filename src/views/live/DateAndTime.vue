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
      default: null
    },
  },
  data() {
    return {
      selfValue: null,
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
        // 避免在值没有真正改变时触发更新
        if (newVal && this.selfValue && moment(newVal).isSame(this.selfValue)) {
          return;
        }
        
        if (newVal) {
          this.selfValue = moment(newVal);
          this.tempValue = { 
            date: moment(newVal), 
            time: moment(newVal) 
          };
        } else {
          this.selfValue = null;
          this.tempValue = { 
            date: null, 
            time: null 
          };
        }
        // 不再在watch中触发change事件，避免死循环
      },
    },
  },
  methods: {
    onDateChange(v) {
      if (v && this.tempValue.time) {
        this.selfValue = moment(v).set({ 
          hour: this.tempValue.time.hour(), 
          minute: this.tempValue.time.minute(), 
          second: 0 
        });
      } else if (v) {
        this.selfValue = moment(v).set({ 
          hour: 0, 
          minute: 0, 
          second: 0 
        });
      } else {
        this.selfValue = null;
      }
      this.triggerChange(this.selfValue);
    },
    onTimeChange(v) {
      if (v && this.tempValue.date) {
        this.selfValue = moment(this.tempValue.date).set({ 
          hour: v.hour(), 
          minute: v.minute(), 
          second: 0 
        });
      } else if (v) {
        // 只有时分，没有日期，使用今天日期
        const today = moment().startOf('day');
        this.selfValue = today.set({ 
          hour: v.hour(), 
          minute: v.minute(), 
          second: 0 
        });
      } else {
        this.selfValue = null;
      }
      this.triggerChange(this.selfValue);
    },
    triggerChange(changedValue) {
      // 只有当值真正改变时才触发change事件
      this.$emit("change", changedValue);
    },
  },
};
</script>
