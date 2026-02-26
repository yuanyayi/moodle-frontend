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
      <bar v-else :data="barData" width="100%" />
    </a-card>
    <a-card :bordered="false" title="互动内容分析">
      <a-row>
        <a-col :span="12">
          <!-- 修改: 添加无数据占位符 -->
          <div v-if="tagList1.length === 0"
            style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #d9d9d9;">
            <span style="color: #bfbfbf; font-size: 16px;">暂无数据</span>
          </div>
          <tag-cloud v-else :tag-list="tagList1" :height="200" :force-fit="true"
            :options="{ useCORS: true, enableCache: false, willReadFrequently: true }" />
        </a-col>
        <a-col :span="12">
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
import Bar from "@/components/Charts/Bar";
import TagCloud from "@/components/Charts/TagCloud";
import StatCard from "./StatCard";
import JsExportExcel from "js-export-excel";

export default {
  name: "Anaylsis",
  components: {
    Bar,
    TagCloud,
    StatCard,
  },
  data() {
    return {
      statisticsDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      headList: [
        {
          key: "uv",
          title: "直播人数",
          value: "0",
          unit: "人",
          day: "--",
          week: "--",
          month: "--",
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
          unit: "min",
          day: "--",
          week: "--",
          month: "--",
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
          x: `点赞数`,
          key: "like",
          y: 0,
        },
        {
          x: `收藏数`,
          key: "collection",
          y: 0,
        },
        {
          x: `分享数`,
          key: "share",
          y: 0,
        },
      ],
      tagList1: [],
      tagList2: [],
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getAnalysisData();
      this.getAnalysisData2();
      this.getTagCloudData();
      this.getTagCloudData2();
    },
    getColorClassName(value) {
      if (value === "--") {
        return "statisticNoData";
      }
      return value.charAt(0) === "-" ? "statisticDown" : "statisticUp";
    },
    async getAnalysisData() {
      await fetch1().then((res) => {
        if (res.status === 200) {
          this.headList[0].value = res.data.uv;
          this.headList[1].value = res.data.totalUv;
          this.headList[2].value = res.data.duration;
          this.headList[3].value = res.data.totalDuration;
          this.headList[0].day = res.data.day;
          this.headList[0].week = res.data.week;
          this.headList[0].month = res.data.month;
          this.headList[2].day = res.data.day;
          this.headList[2].week = res.data.week;
          this.headList[2].month = res.data.month;
          this.barData[0].y = res.data.qa;
          this.barData[1].y = res.data.like;
          this.barData[2].y = res.data.collection;
          this.barData[3].y = res.data.share;
        } else {
          this.$message.error(res.message);
        }
      });
    },
    async getAnalysisData2() {
      await fetch2().then((res) => {
        if (res.status === 200) {
          console.log(res.data);
        } else {
          this.$message.error(res.message);
        }
      });
    },
    async getTagCloudData() {
      await ciyun1().then((res) => {
        if (res.status === 200) {
          this.tagList1 = res.data;
        } else {
          this.$message.error(res.message);
        }
      });
    },
    async getTagCloudData2() {
      await ciyun2().then((res) => {
        if (res.status === 200) {
          this.tagList2 = res.data;
        } else {
          this.$message.error(res.message);
        }
      });
    },
    exportExcel() {
      var option = {
        filename: `互动行为数据_${this.statisticsDate}`,
        sheets: [
          {
            sheetData: this.barData,
            sheetName: "互动行为数据",
            sheetHeader: ["数据类型", "key", "数量"],
            columnWidths: [20, 10, 10],
          },
        ],
      };
      var toExcel = new JsExportExcel(option);
      toExcel.saveExcel();
    },
  },
};
</script>

<style scoped>
.subTitle {
  font-size: 14px;
  color: #999;
  margin-left: 16px;
}

.statisticList {
  margin-top: 10px;
  font-size: 12px;
}

.statisticUp {
  color: #f5222d;
}

.statisticDown {
  color: #52c41a;
}

.statisticNoData {
  color: #999;
}
</style>