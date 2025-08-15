<template>
  <a-spin :spinning="loading">
    <div
      v-show="cityPackageList.length"
      id="mapWrap"
      ref="mapRef"
      class="map"
      tabindex="0"
      style="margin: auto; background-color: #f0f7fa; outline: none"
      :style="`height:${height}px;`"
    ></div>
    <empty
      v-show="!cityPackageList.length"
      :style="`height:${height}px; margin:0;`"
    />
  </a-spin>
</template>

<script>
import DataSet from "@antv/data-set";
import { Chart } from "@antv/g2";
import {
  toThousands,
  getColorByPercent,
  cdnBaseUrl,
  mixinObj,
} from "@/utils/common";
import Empty from "@/components/Empty.vue";

const mapColor = {
  "nation-stroke": "#426332",
  "coastline-stroke": "#b9b9b9",
  "province-stroke": "#cee1b0",
  "city-stroke": "#dedede", // 中国特有字段
  "city-fill": "#fdffe8",
  // "city-fill": undefined
};

export default {
  name: "LocalMap",
  components: { Empty },
  data() {
    return {
      loading: false,
      disCountry: {},
      markers: [],
      infoWindow: {},
      currentCity: "",
    };
  },
  props: {
    cityPackageList: Array,
    height: {
      type: Number,
      default: 300,
    },
    tooltipOpt: {
      type: Object,
      dfault: (_) => {},
    },
  },
  mounted() {
    let timer = setInterval(() => {
      // console.log(this.$refs.mapRef.offsetWidth);
      try {
        if (this.$refs.mapRef.offsetWidth > 0) {
          clearInterval(timer);
          this.init();
        }
      } catch (err) {
        console.error(err);
        clearInterval(timer);
      }
    }, 300);
  },
  computed: {
    _tooltipOpt() {
      const fillColorBy = (pack) => pack.estImpPv;
      return mixinObj(
        {
          itemTpl:
            "<div style='padding:5px 5px;margin-bottom:5px'><li class='input-item'>曝光量: {impPv}</li><li class='input-item'>曝光完成度: {estImpPv}</li></div>",
          fillColorBy,
          userViewItems: "cityPackage*impPv*estImpPv",
          userViewFormatter: (cityPackage, impPv, estImpPv) => {
            return {
              title: cityPackage,
              impPv: toThousands(impPv),
              estImpPv: Math.round(estImpPv * 10000) / 100 + "%",
            };
          },
        },
        this.tooltipOpt
      );
    },
  },
  watch: {
    cityPackageList: {
      handler: function (newVal) {
        this.$nextTick(this.refresh);
      },
      immediate: true,
    },
  },
  methods: {
    init() {
      this.loading = true;
      const chart = new Chart({
        container: "mapWrap",
        autoFit: true,
      });
      chart.tooltip({
        showTitle: true,
        showMarkers: false,
        shared: true,
        itemTpl: this._tooltipOpt.itemTpl,
      });
      // 同步度量
      chart.scale({
        longitude: {
          sync: true,
          max: 140,
          min: 72,
          range: this.calculateWidthRange(),
        },
        latitude: {
          sync: true,
          max: 54,
          min: 12,
          range: [0, 1],
        },
      });
      chart.axis(false);
      chart.legend(false);

      const chinaMapView = chart.createView();
      // 可视化用户数据
      const userData = this.cityPackageList.map((el) => {
        return {
          ...el,
          fillColor: getColorByPercent(this._tooltipOpt.fillColorBy(el)),
        };
      });
      const userView = chart.createView();
      userView.data(userData);
      userView
        .polygon()
        .position("longitude*latitude")
        .color("fillColor", (fillColor) => fillColor)
        .tooltip(
          this._tooltipOpt.userViewItems,
          this._tooltipOpt.userViewFormatter
        )
        .style({
          fillOpacity: 0.85,
        });
      userView.interaction("element-active");

      // console.time();
      // console.log("开始");
      // console.timeLog();
      const p1 = fetch(cdnBaseUrl + "/amap/china1.geo.json")
        .then((res) => res.json())
        .then((mapData) => {
          // 绘制世界地图背景
          const ds = new DataSet();
          this.ds = ds;
          const chinaMap = ds.createView("back").source(mapData, {
            type: "GeoJSON",
          });
          chinaMapView.data(chinaMap.rows);
          chinaMapView.tooltip(false);
          chinaMapView.polygon().position("longitude*latitude").style({
            fill: mapColor["city-fill"],
            stroke: mapColor["province-stroke"],
            lineWidth: 1,
          });
          // console.log("1. 渲染开始");
          // console.timeLog();
          chart.render();
          this.loading = false;
          // console.log("1. 渲染结束");
          // console.timeLog();
        })
        .then(() => {
          // console.log("3. 渲染开始");
          // console.timeLog();
          userView.render();
          // console.log("3. 渲染结束");
          // console.timeEnd();
        });
    },
    calculateWidthRange() {
      // 计算显示比例
      const width = (this.height / 3) * 4;
      let range = [0, 1];
      if (this.$refs.mapRef.offsetWidth > width) {
        let oneSide = +(
          (1 - width / this.$refs.mapRef.offsetWidth) /
          2
        ).toFixed(2);
        range = [oneSide, 1 - oneSide];
      }
      return range;
    },
  },
};
</script>

<style lang="less" scope>
.mapWrap {
  width: 500px;
}
.g2-tooltip {
  .g2-tooltip-title {
    font-size: 16px;
    font-weight: bold;
  }
  .input-item {
    margin-bottom: 0.5em;
    font-size: 14px;
  }
}
</style>
