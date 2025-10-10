<template>
  <!-- 表格搜索栏 -->
  <a-form layout="inline" class="searchForm" :style="noNeedGrids && { marginBottom: 0 }">
    <template v-if="noNeedGrids">
      <template v-for="(queryDesc, query) in queryField">
        <!-- {{queryDesc}}--{{query}} -->
        <a-form-item :key="query" :label="queryDesc.label" v-bind="queryDesc.formItemLayout || {}" v-show="queryDesc.type !== 'hidden' && queryDesc.invisible !== true">
          <!-- select -->
          <a-select
            v-if="queryDesc.type === 'select'"
            v-model="queryParam[query]"
            v-bind="mixinProps(queryDesc)"
            @keydown.enter.native="_queryFilter"
            @change="e => _selectChange(e, queryDesc)"
            @search="e => _selectSearch(e, queryDesc)"
            :options="queryDesc.list">
          </a-select>
          <!-- dataRange -->
          <a-range-picker
            v-else-if="queryDesc.type === 'dateRange'"
            v-model="queryParam[query]"
            v-bind="queryDesc.props"
            @keydown.enter.native="_queryFilter"
            @change="e => _selectChange(e, queryDesc)" />
          <!-- text -->
          <a-input v-else-if="queryDesc.type === 'hidden'" v-model="queryParam[query]" />
          <!-- text -->
          <a-input v-else v-model="queryParam[query]" placeholder="输入查询内容" v-bind="queryDesc.props" @keydown.enter.native="_queryFilter" />
        </a-form-item>
      </template>
      <template v-if="noNeedGrids.needQueryButton">
        <a-button type="primary" style="margin-left: 8px" icon="search" @click="_queryFilter">{{ okButtonText }} </a-button>
        <a-button style="margin-left: 8px" v-if="!hiddenClearBtn" @click="_clearQuery"> {{ cancelButtonText }}</a-button>
      </template>
    </template>
    <!-- 栅格系统 -->
    <a-row v-else :gutter="48">
      <a-col v-bind="{ ..._formLayout.items, ...queryDesc.items }" v-for="(queryDesc, query) in queryField" :key="query" v-show="queryDesc.type !== 'hidden' && queryDesc.invisible !== true">
        <!-- {{queryDesc}}--{{query}} -->
        <a-form-item :label="queryDesc.label" v-bind="queryDesc.formItemLayout || {}" style="width: 100%">
          <!-- select -->
          <a-select
            v-if="queryDesc.type === 'select'"
            v-model="queryParam[query]"
            v-bind="mixinProps(queryDesc)"
            @keydown.enter.native="_queryFilter"
            @change="e => _selectChange(e, queryDesc)"
            @search="e => _selectSearch(e, queryDesc)"
            :options="queryDesc.list">
          </a-select>
          <!-- dataRange -->
          <a-range-picker
            v-else-if="queryDesc.type === 'dateRange'"
            v-model="queryParam[query]"
            v-bind="queryDesc.props"
            @keydown.enter.native="_queryFilter"
            @change="e => _selectChange(e, queryDesc)" />
          <!-- text -->
          <a-input v-else-if="queryDesc.type === 'hidden'" v-model="queryParam[query]" />
          <!-- text -->
          <a-input v-else v-model="queryParam[query]" placeholder="输入查询内容" v-bind="queryDesc.props" @keydown.enter.native="_queryFilter" />
        </a-form-item>
      </a-col>
      <a-col v-bind="_formLayout.operations" class="ant-form-item">
        <a-button type="primary" style="margin-left: 8px" icon="search" @click="_queryFilter">{{ okButtonText }} </a-button>
        <a-button style="margin-left: 8px" v-if="!hiddenClearBtn" @click="_clearQuery"> {{ cancelButtonText }}</a-button>
      </a-col>
    </a-row>
  </a-form>
</template>

<script>
import moment from "moment";
import { mixinObj } from "@/utils/common";
export default {
  name: "TableSearchForm",
  props: {
    queryField: Object,
    queryParam: Object,
    initialValue: Object,
    okButtonText: {
      type: String,
      default: "搜索",
    },
    cancelButtonText: {
      type: String,
      default: "清空",
    },
    formLayout: {
      type: Object,
      default: _ => {},
    },
    hiddenClearBtn: {
      type: [Boolean, Number],
      default: false,
    },
    autoCreatedFetch: { type: Boolean, default: true },
    saveQueryByRoute: { type: Boolean, default: true },
    noNeedGrids: { type: Boolean, default: false },
  },
  watch: {
    hiddenClearBtn(v) {
      console.log("hiddenClearBtn" + v);
    },
  },
  created() {
    this.saveQueryByRoute && this.autoCreatedFetch && this.init();
    !this.saveQueryByRoute && this.autoCreatedFetch && this._queryFilter();
  },
  data() {
    return {
      _initialValue: Object.assign({}, this.initialValue),
    };
  },
  computed: {
    _formLayout() {
      const formLayout = mixinObj(
        {
          items: {
            md: 8,
            sm: 24,
          },
          operations: {
            md: 8,
            sm: 24,
          },
          formItemLayout: {
            labelAlign: "left",
          },
        },
        this.formLayout
      );
      return formLayout;
    },
  },
  methods: {
    _queryFilter() {
      if (this.saveQueryByRoute) {
        this.$router
          .replace({
            ...this.$route,
            query: this.FilterQueryParamType(),
          })
          .catch(err => {
            err;
          });
      }
      this.$emit("queryFilter");
    },
    _clearQuery() {
      if (this.saveQueryByRoute) {
        this.$router.replace({ ...this.$route, query: {} });
      }
      this.$emit("clearQuery", this.initialValue || {});
    },
    _selectChange(e, queryDesc) {
      if (typeof queryDesc.onChange === "function") {
        return queryDesc.onChange(e);
      }
      if (this.noNeedGrids && !this.noNeedGrids.needQueryButton) {
        this._queryFilter();
      }
    },
    _selectSearch(e, queryDesc) {
      if (typeof queryDesc.onSearch === "function") {
        return queryDesc.onSearch(e);
      }
    },
    FilterQueryParamType() {
      let result = {};
      for (let key in this.queryParam) {
        try {
          if (!this.queryField[key]) return; // 不需要处理的辅助搜索项
          if (this.queryField[key].type === "dateRange") {
            result[key] = this.queryParam[key] && this.queryParam[key].map(m => m.valueOf() || m);
          } else {
            if (isNaN(+this.queryParam[key])) {
              result[key] = this.queryParam[key];
            } else {
              result[key] = +this.queryParam[key];
            }
          }
        } catch (err) {
          console.error(err);
          console.error("Key:" + key);
        }
      }
      return result;
    },
    init() {
      const query = this.$route.query;
      if (Object.keys(query).length > 0) {
        const initQueryParam = {};
        Object.keys(this.queryField).forEach(key => {
          if (query[key] === undefined) return;
          if (this.queryField[key].type === "dateRange") {
            initQueryParam[key] = query[key] && query[key].map(date => moment(+date));
          } else {
            let isNumber = !!this.queryField[key].keyType
              ? this.queryField[key].keyType === "number"
              : query[key] == undefined
              ? !!this.queryField[key].list || this.queryField[key].type === "select"
              : !isNaN(+query[key]);
            initQueryParam[key] = isNumber ? +query[key] : query[key];
          }
          if (query[key]) {
            this._selectChange(query[key], this.queryField[key]);
          }
        });
        // console.log(initQueryParam);
        this.$emit("queryFilter", initQueryParam);
        return;
      }
      this.$emit("queryFilter");
    },
    mixinProps(queryDesc, type = "select") {
      if (type === "select") {
        return {
          placeholder: queryDesc.doNotUseInputSearch ? "选择一项进行搜索" : "输入文字进行搜索",
          showSearch: !queryDesc.doNotUseInputSearch,
          optionFilterProp: !queryDesc.doNotUseInputSearch && "children",
          notFoundContent: "--无结果--",
          ...queryDesc.props,
        };
      }
    },
  },
};
</script>
