<template>
  <div>
    <a-row :gutter="16">
      <a-col
        style="text-align: right; font-size: 12px; font-weight: normal; line-height: 20px; color: #828290;">数据最新更新于：{{
          statisticsDate }}</a-col>
      <a-col v-for="(item, index) in headList" :span="6" :key="item.key">
        <stat-card :title="item.title" :value="item.value" :unit="item.unit" :icon="`analysis${index + 1}`" />
      </a-col>
    </a-row>

    <a-card :bordered="false" style="margin-top: 20px;">
      <template v-slot:title>
        <div style="display: flex; justify-content: space-between;">互动行为数据 <a-button icon="download"
            @click="exportExcel">导出数据</a-button> </div>
      </template>
      <!-- 修改: 添加无数据占位符 -->
      <div v-if="barData.every(item => !item.y || item.y === 0)"
        style="height: 254px; display: flex; align-items: center; justify-content: center; border: 1px dashed #d9d9d9; margin: 0 0 32px 32px;">
        <span style="color: #bfbfbf; font-size: 16px;">暂无数据</span>
      </div>
      <gradient-bar v-else :data="barData" title="互动行为数据" />
    </a-card>
    <a-card :bordered="false" title="互动内容分析" style="margin-top: 20px;">
      <a-row>
        <a-col :span="12">
          <div class="title5"><a-icon :component="ciyun1Icon" style="margin-right: 8px; font-size: 22px;" />老师互动内容词云
          </div>
          <!-- 修改: 添加无数据占位符 -->
          <div v-if="tagList1.length === 0"
            style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #d9d9d9;">
            <span style="color: #bfbfbf; font-size: 16px;">暂无数据</span>
          </div>
          <tag-cloud v-else :tag-list="tagList1" :height="200" :force-fit="true"
            :options="{ useCORS: true, enableCache: false, willReadFrequently: true }" />
        </a-col>
        <a-col :span="12">
          <div class="title5"><a-icon :component="ciyun2Icon" style="margin-right: 8px; font-size: 22px;" />学生互动内容词云
          </div>
          <!-- 修改: 添加无数据占位符 -->
          <div v-if="tagList2.length === 0"
            style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #d9d9d9;">
            <span style="color: #bfbfbf; font-size: 16px;">暂无数据</span>
          </div>
          <tag-cloud v-else :tag-list="tagList2" :height="200" :force-fit="true"
            :options="{ useCORS: true, enableCache: false, willReadFrequently: true }" />
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import { fetch1, fetch2, ciyun1, ciyun2 } from "@/api/analysis";
import { ciyun1 as ciyun1Icon, ciyun2 as ciyun2Icon } from "@/core/icons";
import Bar from "@/components/Charts/Bar";
import GradientBar from "@/components/Charts/GradientBar";
import TagCloud from "@/components/Charts/TagCloud";
import StatCard from "./StatCard";
import JsExportExcel from "js-export-excel";

export default {
  name: "Anaylsis",
  components: {
    Bar,
    GradientBar,
    TagCloud,
    StatCard,
  },
  data() {
    return {
      ciyun1Icon,
      ciyun2Icon,
      statisticsDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      // 图表颜色配置
      chartColor: ['#057CFB', '#057CFB', '#057CFB'], // 统一使用主颜色
      // 柱状图样式配置
      chartBarStyle: {
        fill: 'url(#barGradient)', // 使用渐变填充
        stroke: '#057CFB',
        lineWidth: 0,
        radius: [8, 8, 0, 0], // 增加顶部圆角大小
      },
      headList: [
        {
          key: "uv",
          title: "直播人数",
          value: "0",
          day: "--",
          week: "--",
          month: "--",
          unit: "人",

        },
        {
          key: "totalUv",
          title: "累计总人数",
          value: "0",
          unit: "人",

        },
        {
          key: "duration",
          title: "直播时长",
          value: "0",
          day: "--",
          week: "--",
          month: "--",
          unit: "min",

        },
        {
          key: "totalDuration",
          title: "累计直播时长",
          value: "0",
          unit: "min",

        },
      ],
      barData: [
        {
          x: `问答数`,
          key: "qa",
          y: 0,
        },
        {
          x: `反馈数`,
          key: "feedback",
          y: 0,
        },
        {
          x: `评论数`,
          key: "comment",
          y: 0,
        },
      ],
      tagList1: [],
      tagList2: [],
    };
  },
  created() {
    this.fetch1();
    this.fetch2();
    this.fetch3();
  },
  methods: {
    fetch1() {
      fetch1().then(res => {
        this.headList.forEach(el => {
          el.value = res.data[el.key];
          if (el.day) {
            el.day = res.data[el.key + "DayGrowth"];
            el.week = res.data[el.key + "WeekGrowth"];
            el.month = res.data[el.key + "MonthGrowth"];
          }
        });
      });
    },
    fetch2() {
      fetch2().then(res => {
        this.barData = this.barData.map(el => {
          el.y = res.data[el.key];
          return el;
        });
      });
    },
    fetch3() {
      ciyun1().then(res => {
        // 调用新方法调整权重
        this.tagList1 = this.adjustWeights(
          res.list.map(el => {
            return {
              name: el.label,
              value: el.size,
              originalValue: el.size, // 保存原始值用于tooltip显示
            };
          })
        );
      });
      ciyun2().then(res => {
        // 调用新方法调整权重
        this.tagList2 = this.adjustWeights(
          res.list.map(el => {
            return {
              name: el.label,
              value: el.size,
              originalValue: el.size, // 保存原始值用于tooltip显示
            };
          })
        );
      });
    },
    // 新增方法：调整相同词频的权重
    adjustWeights(list) {
      if (list.length <= 1) return list;

      // 创建新数组避免修改原数组
      const adjustedList = list.map(item => ({ ...item }));

      // 从第二个元素开始检查是否与前一个元素的originalValue相同
      for (let i = 1; i < adjustedList.length; i++) {
        if (adjustedList[i].originalValue === adjustedList[i - 1].originalValue) {
          adjustedList[i].value = adjustedList[i - 1].value + 0.1;
        }
      }

      return adjustedList;
    },
    getColorClassName(str) {
      if (str === "0.00%") return "a-grey";
      if (/^-/.test(str)) return "a-green";
      return "a-red";
    },
    exportExcel() {
      const option = {
        fileName: "互动行为数据",
        datas: [
          {
            sheetData: this.barData.map(item => ({
              类型: item.x,
              数量: item.y,
            })),
            sheetName: "互动行为数据",
            sheetFilter: ["类型", "数量"],
            sheetHeader: ["类型", "数量"],
          },
        ],
      };

      const toExcel = new JsExportExcel(option);
      toExcel.saveExcel();
    },
  },
};
</script>

<style lang="less" scoped>
.subTitle {
  font-size: 14px;
  color: #a6a6a6;
  margin-left: 30px;
}

.statisticList {
  b {
    display: inline-block;
    width: 2em;
    color: #b6b6b6;
  }

  span {
    display: inline-block;
    width: 3em;
  }
}

.title5 {
  font-weight: 500;
  line-height: 22px;
  color: #3D3D3D;

  .anticon {
    vertical-align: bottom;
  }
}
</style>