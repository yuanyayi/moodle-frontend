<template>
  <!-- Real Form Input Here -->
  <a-input-group compact>
    <template v-for="(childDesc, childField) in fieldDesc.children">
      <!-- input -->
      <a-input
        :key="childField"
        v-model="childValue[childField]"
        v-if="
          childDesc.type !== 'hidden' &&
          (!childDesc.type || childDesc.type === 'text')
        "
        v-bind="childDesc.props"
        @change="
          (e) => {
            handleTxtChange(childField, e.target.value);
          }
        "
      />
      <!-- Number -->
      <template v-if="childDesc.type === 'number'">
        <a-input-number
          :key="childField"
          v-model="childValue[childField]"
          v-bind="childDesc.props"
          @change="
            (val) => {
              handleNumberChange(childField, val);
            }
          "
        />
        <span
          v-if="childDesc.props && childDesc.props.ps"
          :key="childField + 'ps'"
          style="line-height: 32px; height: 32px; padding-left: 3px"
          :style="childDesc.props.ps.style"
          >{{ childDesc.props.ps.text }}</span
        >
      </template>
      <!-- Select -->
      <a-select
        v-if="childDesc.type === 'select'"
        :key="childField"
        v-model="childValue[childField]"
        :placeholder="
          childDesc.inputSearch ? '输入文字进行搜索' : '选择一项进行搜索'
        "
        :showSearch="childDesc.inputSearch"
        :optionFilterProp="childDesc.inputSearch && 'children'"
        v-bind="childDesc.props"
        @change="
          (val) => {
            handleSelectChange(childField, val);
          }
        "
        :notFoundContent="'--无结果--'"
      >
        <a-select-option v-for="item in childDesc.list" :key="item.value">{{
          item.label
        }}</a-select-option>
      </a-select>
      <!-- Radio -->
      <a-radio-group
        v-if="childDesc.type === 'radio'"
        :key="childField"
        v-model="childValue[childField]"
        v-bind="childDesc.props"
        @change="
          (val) => {
            handleRadioChange(childField, val);
          }
        "
      >
        <a-row>
          <a-col
            :span="+childDesc.span || 8"
            v-for="item in childDesc.list"
            :key="item.value"
          >
            <a-radio :value="item.value">{{ item.label }}</a-radio>
          </a-col>
        </a-row>
      </a-radio-group>
      <!-- 开关效果 -->
      <span
        class="item-cell"
        v-if="childDesc.type === 'switch'"
        :key="childField"
      >
        <a-switch
          v-model="childValue[childField]"
          v-bind="{
            ...fieldDesc.props,
            ...childDesc.props,
            valuePropName: 'checked',
          }"
          @change="(val) => handleTxtChange(childField, val)"
        />
      </span>
      <!-- checkbox -->
      <span
        class="item-cell"
        v-if="childDesc.type === 'checkbox'"
        :key="childField"
      >
        <a-checkbox-group
          v-model="childValue[childField]"
          v-bind="childDesc.props"
          @change="
            (val) => {
              handleTxtChange(childField, val);
            }
          "
        >
          <a-row>
            <a-col v-for="item in childDesc.list" :key="item.value">
              <a-checkbox v-bind="item">{{ item.label }}</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </span>
      <!-- dateRange -->
      <template v-if="childDesc.type === 'dateRange'">
        <a-range-picker
          v-model="childValue[childField]"
          v-bind="childDesc.props"
          @change="
            (val) => {
              triggerChange({ [childField]: val });
            }
          "
          :key="childField"
        />
      </template>
      <!-- 纯文字 -->
      <div
        :key="childField"
        v-if="childDesc.type === 'string'"
        class="ant-input-string"
      >
        {{ childDesc.value }}
      </div>
    </template>
  </a-input-group>
</template>

<script>
export default {
  name: "FormItemWithChildren",
  props: {
    value: { type: Object, default: (_) => {}, require: false },
    field: { type: String, require: true },
    fieldDesc: { type: Object, default: (_) => {} },
  },
  data() {
    return {
      childValue: {},
      formatter: function (value) {
        return value;
      },
      parse: function (childValue) {
        return childValue;
      },
    };
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val = {}) {
        if (val === null || val === undefined) {
          try {
            val = this.fieldDesc.options.initialValue;
          } catch (err) {
            val = {};
          }
        }
        this.childValue = this.formatter(val);
      },
    },
    "fieldDesc.props": {
      deep: true,
      immediate: true,
      handler(props) {
        if (props) {
          if (typeof props.formatter === "function") {
            this.formatter = props.formatter;
          }
          if (typeof props.parse === "function") {
            this.parse = props.parse;
          }
        }
      },
    },
  },
  created() {
    this.childValue = this.formatter(this.value);
  },
  methods: {
    handleNumberChange(field, val) {
      this.triggerChange({ [field]: val });
    },
    handleSelectChange(field, val) {
      this.triggerChange({ [field]: val });
    },
    handleTxtChange(field, val) {
      this.triggerChange({ [field]: val });
    },
    handleRadioChange(field, val) {
      // { nativeEvent, preventDefault, stopPropagation, target }
      this.triggerChange({ [field]: val.target.value });
    },
    triggerChange(changedValue) {
      // Should provide an event to pass value to Form.
      let val = { ...this.childValue, ...changedValue };
      this.$emit("change", this.parse(val), changedValue);
    },
  },
};
</script>

<style lang="less" scoped>
.ant-input-group.ant-input-group-compact > .item-cell:not(:last-child) {
  margin-right: 10px;
}
.ant-input-string {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  display: inline-block;
  height: 32px;
  padding: 4px 5px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.5;
}
</style>
