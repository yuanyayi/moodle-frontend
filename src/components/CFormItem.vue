<template>
  <div>
    <!-- 子项合并的FormItem -->
    <a-form-item
      v-if="fieldDesc.type === 'children'"
      :name="field"
      :label="fieldDesc.label"
      v-bind="{ ...formItemLayout, ...fieldDesc.itemProps }"
    >
      <FormItemWithChildren
        :key="field"
        v-bind="{ fieldDesc, field }"
        v-decorator="[field, fieldDesc.options]"
        @change="handleChange"
      />
    </a-form-item>
    <!-- 自定义的FormItem -->
    <template v-else-if="fieldDesc.type === 'fullslot'">
      <a-row :name="field" class="ant-form-item" :class="fieldDesc.status.error ? 'ant-form-item-with-help' : ''">
        <a-col v-bind="formItemLayout.labelCol" class="ant-form-item-label">
          <label :for="field" :title="fieldDesc.label" class="ant-form-item-required">{{ fieldDesc.label }}</label>
        </a-col>
        <a-col v-bind="formItemLayout.wrapperCol" class="ant-form-item-control-wrapper">
          <div class="ant-form-item-control" :class="fieldDesc.status.error ? 'has-error' : 'has-success'">
            <!-- Real Form Input Here -->
            <slot :name="fieldDesc.slotName" class="ant-row ant-form-item"></slot>
            <!-- Real Form Input End -->
            <div class="ant-form-explain" v-show="fieldDesc.status.error">
              {{ fieldDesc.status.errormsg || 'Something wrong with ' + fieldDesc.label }}
            </div>
          </div>
        </a-col>
      </a-row>
    </template>
    <template v-else-if="fieldDesc.type === 'divider'">
      <a-divider class="formDivider" orientation="left" v-bind="fieldDesc.props">{{ fieldDesc.label }}</a-divider>
    </template>
    <!-- others -->
    <template v-else>
      <a-form-item
        v-if="fieldDesc.invisible !== true"
        v-show="fieldDesc.type !== 'hidden'"
        :name="field"
        :label="fieldDesc.label"
        v-bind="{ ...formItemLayout, ...fieldDesc.itemProps }"
      >
        <!-- Text (default) -->
        <a-input
          v-if="!fieldDesc.type || fieldDesc.type === 'text' || fieldDesc.type === true"
          v-decorator="[field, fieldDesc.options]"
          v-bind="fieldDesc.props"
        >
          <slot name="addonBefore" slot="addonBefore"></slot>
          <slot name="addonAfter" slot="addonAfter"></slot>
        </a-input>
        <!-- Hidden -->
        <a-input
          v-if="fieldDesc.type === 'hidden'"
          v-decorator="[field, { rules: [{ type: 'any' }] }]"
          v-bind="fieldDesc.props"
        />
        <!-- Number -->
        <template v-if="fieldDesc.type === 'number' || fieldDesc.type === 'price'">
          <a-input-group compact>
            <a-input-number
              :style="{
                width: fieldDesc.props && fieldDesc.props.ps ? '40%' : '100%',
              }"
              v-decorator="[field, fieldDesc.options]"
              v-bind="computeProps(fieldDesc)"
              @change="handleChange"
            />
            <span
              v-if="fieldDesc.props && fieldDesc.props.ps"
              style="width: 60%; padding: 5px 7px"
              :style="fieldDesc.props.ps.style"
              >{{ fieldDesc.props.ps.text }}</span
            >
          </a-input-group>
        </template>
        <!-- textarea -->
        <template v-if="fieldDesc.type === 'textarea'">
          <slot name="addonBefore"></slot>
          <a-textarea v-decorator="[field, fieldDesc.options]" v-bind="fieldDesc.props" :auto-size="{ minRows: 3 }" />
          <slot name="addonAfter"></slot>
        </template>
        <!-- Select -->
        <a-select
          v-if="fieldDesc.type === 'select'"
          v-decorator="[field, fieldDesc.options]"
          v-bind="fieldDesc.props"
          :placeholder="
            fieldDesc.props && fieldDesc.props.placeholder
              ? fieldDesc.props.placeholder
              : fieldDesc.inputSearch
              ? '输入文字进行搜索'
              : '请选择'
          "
          :optionFilterProp="
            (fieldDesc.props && fieldDesc.props.optionFilterProp) || (fieldDesc.inputSearch && 'children')
          "
          :showSearch="fieldDesc.inputSearch || (fieldDesc.props && fieldDesc.props.showSearch)"
          @search="handleSearch"
          @change="handleChange"
          :notFoundContent="'--无结果--'"
        >
          <template v-for="item in fieldDesc.list">
            <a-select-option :key="item.value" v-if="!item.hidden">{{ item.label }}</a-select-option>
          </template>
        </a-select>
        <!-- Tree -->
        <a-tree-select
          v-if="fieldDesc.type === 'tree'"
          v-decorator="[field, fieldDesc.options]"
          style="width: 100%"
          :dropdownStyle="fieldDesc.dropdownStyle || { maxHeight: '400px', overflow: 'auto' }"
          :treeData="fieldDesc.list"
          :placeholder="
            fieldDesc.props && fieldDesc.props.placeholder
              ? fieldDesc.props.placeholder
              : fieldDesc.inputSearch
              ? '输入文字进行搜索'
              : '请选择城市'
          "
          :optionFilterProp="'children'"
          v-bind="fieldDesc.props"
          v-on="fieldDesc.actions"
        ></a-tree-select>
        <!-- checkbox -->
        <template v-if="fieldDesc.type === 'checkbox'">
          <a-checkbox-group
            v-decorator="[field, fieldDesc.options]"
            v-bind="fieldDesc.props"
            @change="handleChange"
            style="width: 100%"
          >
            <a-row>
              <a-col :span="+fieldDesc.span || 8" v-for="item in fieldDesc.list" :key="item.value">
                <a-checkbox v-bind="item">{{ item.label }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </template>
        <!-- 多选树 -->
        <template v-if="fieldDesc.type === 'checkboxTree'">
          <a-checkbox-group
            v-decorator="[field, fieldDesc.options]"
            v-bind="fieldDesc.props"
            @change="handleChange"
            style="width: 100%"
          >
            <a-row v-for="(list, key, index) in fieldDesc.list" :key="index">
              <a-col :span="24" class="list-title">{{ key }}</a-col>
              <a-col :span="8" v-for="item in list" :key="item.value">
                <a-checkbox :value="item.value || item[fieldDesc.itemValueName]" :disabled="item.disabled">{{
                  item.label || item[fieldDesc.itemLabelName]
                }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </template>
        <!-- 多选分组 -->
        <template v-if="fieldDesc.type === 'checkboxGroup'">
          <a-checkbox-group
            v-decorator="[field, fieldDesc.options]"
            v-bind="fieldDesc.props"
            @change="handleChange"
            style="width: 100%"
          >
            <a-row v-for="(subList, key, index) in fieldDesc.list" :key="index">
              <a-col :span="24" class="list-title">{{ key }}</a-col>
              <a-col :span="8" v-for="item in subList" :key="item.value">
                <a-checkbox v-bind="item">{{ item.label }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group></template
        >
        <!-- radio -->
        <template v-if="fieldDesc.type === 'radio'">
          <a-radio-group v-decorator="[field, fieldDesc.options]" v-bind="fieldDesc.props" style="width: 100%">
            <a-row :style="fieldDesc.list.length < 4 ? { paddingTop: '8px' } : ''">
              <a-col :span="+fieldDesc.span || 8" v-for="item in fieldDesc.list" :key="item.value">
                <template v-if="fieldDesc.buttonStyle">
                  <a-radio-button v-bind="item">{{ item.label }}</a-radio-button>
                </template>
                <template v-else>
                  <a-radio v-bind="item">{{ item.label }}</a-radio>
                </template>
              </a-col>
            </a-row>
          </a-radio-group>
        </template>
        <!-- upload -->
        <template v-if="fieldDesc.type === 'upload'">
          <a-upload
            :fileList="fileList"
            :showUploadList="true"
            @preview="uploadhandlePreview"
            @change="uploadhandleChange"
            v-decorator="[field, fieldDesc.options]"
            v-bind="fieldDesc.props"
          >
            <div v-if="fileList.length < (fieldDesc.limit || 1)">
              <a-button> <a-icon type="upload" />上传 </a-button>
            </div>
          </a-upload>
          <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
            <img alt="example" style="width: 100%" :src="previewImage" />
          </a-modal>
        </template>
        <!-- customer-upload -->
        <template v-if="fieldDesc.type === 'customer-upload'">
          <CUpload v-bind="{ fieldDesc, field }" v-decorator="[field, fieldDesc.options]" />
        </template>
        <!-- 滑块效果 -->
        <template v-if="fieldDesc.type === 'slider'">
          <a-row>
            <a-col :span="16">
              <a-slider @afterChange="afterChange" v-decorator="[field, fieldDesc.options]" v-bind="fieldDesc.props" />
            </a-col>
            <a-col :span="4" style="text-align: center">{{ sliderValue }}</a-col>
          </a-row>
        </template>
        <!-- 开关效果 -->
        <template v-if="fieldDesc.type === 'switch'">
          <a-switch
            @change="handleChange"
            v-bind="fieldDesc.props"
            v-decorator="[field, Object.assign({ valuePropName: 'checked' }, fieldDesc.options)]"
          />
          <span
            v-if="fieldDesc.props && fieldDesc.props.ps"
            style="padding: 5px 7px"
            :style="fieldDesc.props.ps.style"
            >{{ fieldDesc.props.ps.text }}</span
          >
        </template>
        <!-- 日期选择 -->
        <template v-if="fieldDesc.type === 'dateRange'">
          <a-range-picker v-decorator="[field, fieldDesc.options]" v-bind="fieldDesc.props" />
        </template>
        <!-- 日期选择 -->
        <template v-if="fieldDesc.type === 'date'">
          <a-date-picker v-decorator="[field, fieldDesc.options]" v-bind="fieldDesc.props" v-on="fieldDesc.actions"/>
        </template>
        <!-- 插槽 -->
        <slot v-if="fieldDesc.type === 'slot'" :name="fieldDesc.slotName"></slot>
        <!-- form-item结束 -->
      </a-form-item>
    </template>
  </div>
</template>

<script>
import CUpload from './CUpload'
import FormItemWithChildren from './FormItemWithChildren'
// import { getBase64 } from "@/utils/common";
import { parseThousands, toThousands } from '@/utils/common'

export default {
  name: 'CFormItem',
  components: {
    CUpload,
    FormItemWithChildren,
  },
  props: {
    fieldDesc: Object,
    field: String,
    layout: Object,
  },
  data() {
    return {
      formItemLayout: {
        labelCol: {
          span: 5,
        },
        wrapperCol: {
          span: 17,
        },
      },
      // 预览处理
      previewVisible: false,
      previewImage: '',
      // 图片上传列表
      fileList: [
        // {
        //   uid: "-1",
        //   name: "xxx.png",
        //   status: "done",
        //   url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        // }
      ].concat(this.fieldDesc?.props?.fileList || []),
      // 滑块处理
      sliderValue: (this.fieldDesc?.type === 'slider' && this.fieldDesc?.options?.initialValue) || [0, 0],
    }
  },
  created() {
    if (this.layout) {
      this.formItemLayout = {
        ...this.layout,
      }
    }
    if (this.fieldDesc.type === 'children') {
      if (!this.fieldDesc.children) {
        console.error('该表单项没有子项')
        return
      }
    }
  },
  watch: {
    fieldDesc: {
      handler: function (val) {
        this.fileList = [].concat(this.fieldDesc?.props?.fileList || [])
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleCancel() {
      this.previewVisible = false
    },
    uploadhandlePreview(file) {
      this.previewImage = file?.response?.data?.url
      if (!this.previewImage) {
        window.open(file.url)
      } else {
        this.previewVisible = true
      }
    },
    uploadhandleChange(info) {
      this.fileList = info.fileList
      if (typeof this.fieldDesc.onChange === 'function') {
        this.fieldDesc.onChange(info)
      }
    },
    handleSearch(value) {
      const fieldDesc = this.fieldDesc
      if (typeof fieldDesc.onSearch === 'function') {
        fieldDesc.onSearch(value)
      }
    },
    handleChange(value) {
      const fieldDesc = this.fieldDesc
      if (typeof fieldDesc.onChange === 'function') {
        fieldDesc.onChange(value)
      }
      this.$emit('change', value)
    },
    afterChange(value) {
      this.sliderValue = value
      return value
    },
    handleChildChange(value) {
      this.$emit('change', value)
    },
    computeProps(fieldDesc) {
      if (fieldDesc.type === 'price') {
        return {
          formatter: toThousands,
          parse: parseThousands,
          precision: 2,
          ...fieldDesc.props,
        }
      }
      return fieldDesc.props
    },
  },
}
</script>

<style>
.list-title {
  padding: 3px 7px;
  background: #fafafa;
  color: #333;
  margin: 5px 0;
}
</style>
