<template>
  <div>
    <!-- 子项合并的FormItem -->
    <a-form-item
      v-if="fieldDesc.type === 'children'"
      :label="fieldDesc.label"
      v-bind="{ ...formItemLayout, ...fieldDesc.itemProps }"
    >
      <FormItemWithChildren
        v-bind="{ fieldDesc, field }"
        v-decorator="[field, fieldDesc.options]"
      />
    </a-form-item>
    <!-- 自定义的FormItem -->
    <template v-else-if="fieldDesc.type === 'fullslot'">
      <a-row
        class="ant-form-item"
        :class="fieldDesc.status.error ? 'ant-form-item-with-help' : ''"
      >
        <a-col v-bind="formItemLayout.labelCol" class="ant-form-item-label">
          <label
            :for="field"
            :title="fieldDesc.label"
            class="ant-form-item-required"
            >{{ fieldDesc.label }}</label
          >
        </a-col>
        <a-col
          v-bind="formItemLayout.wrapperCol"
          class="ant-form-item-control-wrapper"
        >
          <div
            class="ant-form-item-control"
            :class="fieldDesc.status.error ? 'has-error' : 'has-success'"
          >
            <!-- Real Form Input Here -->
            <slot
              :name="fieldDesc.slotName"
              class="ant-row ant-form-item"
            ></slot>
            <!-- Real Form Input End -->
            <div class="ant-form-explain" v-show="fieldDesc.status.error">
              {{
                fieldDesc.status.errormsg ||
                "Something wrong with " + fieldDesc.label
              }}
            </div>
          </div>
        </a-col>
      </a-row>
    </template>
    <template v-else-if="fieldDesc.type === 'divider'">
      <a-divider
        class="formDivider"
        orientation="left"
        v-bind="fieldDesc.props"
        >{{ fieldDesc.label }}</a-divider
      >
    </template>
    <!-- others -->
    <a-form-item
      v-else
      :label="fieldDesc.label"
      v-bind="{ ...formItemLayout, ...fieldDesc.itemProps }"
      v-show="fieldDesc.type !== 'hidden' && fieldDesc.invisible !== true"
    >
      <!-- Text (default) -->
      <a-input
        v-if="
          !fieldDesc.type ||
          fieldDesc.type === 'text' ||
          fieldDesc.type === true
        "
        v-decorator="[field, fieldDesc.options]"
        v-bind="fieldDesc.props"
      >
        <slot name="addonBefore" slot="addonBefore"></slot>
        <slot name="addonAfter" slot="addonAfter"></slot>
      </a-input>
      <!-- Hidden -->
      <a-input
        v-if="fieldDesc.type === 'hidden'"
        v-decorator="[field, fieldDesc.options]"
        v-bind="fieldDesc.props"
      />
      <!-- Number -->
      <template v-if="fieldDesc.type === 'number'">
        <a-input-group compact>
          <a-input-number
            :style="{
              width: fieldDesc.props && fieldDesc.props.ps ? '40%' : '100%',
            }"
            v-decorator="[field, fieldDesc.options]"
            v-bind="fieldDesc.props"
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
          (fieldDesc.props && fieldDesc.props.optionFilterProp) ||
          (fieldDesc.inputSearch && 'children')
        "
        :showSearch="
          fieldDesc.inputSearch ||
          (fieldDesc.props && fieldDesc.props.showSearch)
        "
        @search="handleSearch"
        @change="handleChange"
        :notFoundContent="'--无结果--'"
      >
        <a-select-option v-for="item in fieldDesc.list" :key="item.value">{{
          item.label
        }}</a-select-option>
      </a-select>
      <!-- Tree -->
      <a-tree-select
        v-if="fieldDesc.type === 'tree'"
        v-decorator="[field, fieldDesc.options]"
        style="width: 100%"
        :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
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
            <a-col
              :span="+fieldDesc.span || 8"
              v-for="item in fieldDesc.list"
              :key="item.value"
            >
              <a-checkbox v-bind="item">{{ item.label }}</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </template>
      <!-- radio -->
      <template v-if="fieldDesc.type === 'radio'">
        <a-radio-group
          v-decorator="[field, fieldDesc.options]"
          v-bind="fieldDesc.props"
          style="width: 100%"
        >
          <a-row>
            <a-col
              :span="+fieldDesc.span || 8"
              v-for="item in fieldDesc.list"
              :key="item.value"
            >
              <a-radio-button v-bind="item">{{ item.label }}</a-radio-button>
            </a-col>
          </a-row>
        </a-radio-group>
      </template>
      <!-- upload -->
      <template v-if="fieldDesc.type === 'upload'">
        <a-upload
          :showUploadList="true"
          @preview="uploadhandlePreview"
          @change="uploadhandleChange"
          v-decorator="[
            field,
            {
              valuePropName: 'fileList',
              ...fieldDesc.options,
              getValueFromEvent: normFiles,
            },
          ]"
          v-bind="fieldDesc.props"
        >
          <template
            v-if="
              (_fieldDesc.firstLength || fileList.length) <
              (fieldDesc.limit || 1)
            "
          >
            <a-button> <a-icon type="upload" />上传 </a-button>
          </template>
        </a-upload>
        <a-modal
          :visible="previewVisible"
          :footer="null"
          @cancel="handleCancel"
        >
          <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
      </template>
      <!-- customer-upload -->
      <template v-if="fieldDesc.type === 'customer-upload'">
        <CUpload
          v-bind="{ fieldDesc, field }"
          v-decorator="[field, fieldDesc.options]"
        />
      </template>
      <!-- 滑块效果 -->
      <template v-if="fieldDesc.type === 'slider'">
        <a-row>
          <a-col :span="16">
            <a-slider
              @afterChange="afterChange"
              v-decorator="[field, fieldDesc.options]"
              v-bind="fieldDesc.props"
            />
          </a-col>
          <a-col :span="4" style="text-align: center">{{ sliderValue }}</a-col>
        </a-row>
      </template>
      <!-- 开关效果 -->
      <template v-if="fieldDesc.type === 'switch'">
        <a-switch
          v-bind="fieldDesc.props"
          v-decorator="[
            field,
            Object.assign({ valuePropName: 'checked' }, fieldDesc.options),
          ]"
        />
      </template>
      <!-- 日期选择 -->
      <template v-if="fieldDesc.type === 'dateRange'">
        <a-range-picker
          v-decorator="[field, fieldDesc.options]"
          v-bind="fieldDesc.props"
        />
      </template>
      <!-- 日期选择 -->
      <template v-if="fieldDesc.type === 'date'">
        <a-date-picker
          v-decorator="[field, fieldDesc.options]"
          v-bind="fieldDesc.props"
        />
      </template>
      <!-- 插槽 -->
      <slot v-if="fieldDesc.type === 'slot'" :name="fieldDesc.slotName"></slot>
      <!-- form-item结束 -->
    </a-form-item>
  </div>
</template>

<script>
import CUpload from "./CUpload";
import FormItemWithChildren from "./FormItemWithChildren";

export default {
  name: "SFormItem",
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
      previewImage: "",
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
      sliderValue: (this.fieldDesc?.type === "slider" &&
        this.fieldDesc?.options?.initialValue) || [0, 0],
    };
  },
  created() {
    if (this.layout) {
      this.formItemLayout = {
        ...this.layout,
      };
    }
    if (this.fieldDesc.type === "children") {
      if (!this.fieldDesc.children) {
        console.error("该表单项没有子项");
        return;
      }
    }
  },
  computed: {
    _fieldDesc() {
      let _fieldDesc = { ...this.fieldDesc };
      if (_fieldDesc.type === "upload") {
        _fieldDesc.firstLength = Array.isArray(_fieldDesc.props.defaultList)
          ? _fieldDesc.props.defaultList.length
          : 0;
      }
      return _fieldDesc;
    },
  },
  methods: {
    handleCancel() {
      this.previewVisible = false;
    },
    uploadhandlePreview(file) {
      this.previewImage = file?.response?.data?.url;
      if (!this.previewImage) {
        window.open(file.url);
      } else {
        this.previewVisible = true;
      }
    },
    uploadhandleChange(info) {
      this.fileList = info.fileList;
      this._fieldDesc.firstLength = 0;
      if (typeof this.fieldDesc.onChange === "function") {
        this.fieldDesc.onChange(info);
      }
    },
    handleSearch(value) {
      const fieldDesc = this.fieldDesc;
      if (typeof fieldDesc.onSearch === "function") {
        fieldDesc.onSearch(value);
      }
    },
    handleChange(value) {
      const fieldDesc = this.fieldDesc;
      if (typeof fieldDesc.onChange === "function") {
        fieldDesc.onChange(value);
      }
      this.$emit("change", value);
    },
    afterChange(value) {
      this.sliderValue = value;
      return value;
    },
    handleChildChange(value) {
      this.$emit("change", value);
    },
    normFiles(e) {
      // console.log(e);
      return e && e.fileList;
    },
  },
};
</script>
