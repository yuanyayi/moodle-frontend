<template>
  <div ref="chartContainer" class="gradient-bar-chart"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: "GradientBar",
  props: {
    title: {
      type: String,
      default: "",
    },
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      const chart = echarts.init(this.$refs.chartContainer);

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const data = params[0];
            return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.color.colorStops[0].color};"></span>${data.name}：${data.value}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.data.map(item => item.x),
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Value',
            type: 'bar',
            barWidth: '30%',
            data: this.data.map(item => item.y),
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#057CFB'
                },
                {
                  offset: 1,
                  color: 'rgba(5, 124, 251, 0.1)'
                }
              ])
            }
          }
        ]
      };

      chart.setOption(option);

      window.addEventListener('resize', () => {
        chart.resize();
      });
    }
  }
};
</script>

<style scoped>
.gradient-bar-chart {
  width: 100%;
  height: 254px;
}
</style>