<template>
  <div>
    <a-card :bordered="false">
      <template v-slot:title
        >最新数据 <span class="subTitle">更新至{{ statisticsDate }}</span>
      </template>
      <a-row>
        <a-col v-for="item in headList" :span="6" :key="item.key">
          <a-statistic :title="item.title" :value="item.value" style="text-align: center" />
          <div class="statisticList" v-if="item.day" style="text-align: center">
            <div>
              <b>日</b><span :class="getColorClassName(item.day)">{{ item.day }}</span>
            </div>
            <div>
              <b>周</b><span :class="getColorClassName(item.week)">{{ item.week }}</span>
            </div>
            <div>
              <b>月</b><span :class="getColorClassName(item.month)">{{ item.month }}</span>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
    <a-card :bordered="false" title="互动行为数据">
      <bar :data="barData" />
    </a-card>
    <a-card :bordered="false" title="互动内容分析">
      <a-row>
        <a-col :span="12">
          <tag-cloud :tag-list="tagList1" :height="200" :force-fit="true"  />
        </a-col>
        <a-col :span="12">
          <tag-cloud :tag-list="tagList2" :height="200" :force-fit="true" />
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import { fetch1, fetch2, ciyun1, ciyun2 } from "@/api/analysis";
import Bar from "@/components/Charts/Bar";
import TagCloud from "@/components/Charts/TagCloud";

export default {
  name: "Anaylsis",
  components: {
    Bar,
    TagCloud,
  },
  data() {
    return {
      statisticsDate: "xxxx-xx-xx",
      headList: [
        {
          key: "liveUsers",
          title: "直播人数",
          value: "0",
          day: "--",
          week: "--",
          month: "--",
        },
        {
          key: "totalUsers",
          title: "累计总人数",
          value: "0",
        },
        {
          key: "liveDuration",
          title: "直播时长",
          value: "0",
          day: "--",
          week: "--",
          month: "--",
        },
        {
          key: "totalDuration",
          title: "累计直播时长",
          value: "0",
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
        this.statisticsDate = res.data.statisticsDate;
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
        this.barData.forEach(el => {
          el.y = res.data[el.key];
        });
      });
    },
    fetch3() {
      ciyun1().then(res => {
        this.tagList1 = res.list.map(el => {
          return {
            name: el.label,
            value: el.size,
          };
        });
      });
      ciyun2().then(res => {
        this.tagList2 = res.list.map(el => {
          return {
            name: el.label,
            value: el.size,
          };
        });
      });
    },
    getColorClassName(str) {
      if (str === "0.00%") return "a-grey";
      if (/^-/.test(str)) return "a-green";
      return "a-red";
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
</style>
