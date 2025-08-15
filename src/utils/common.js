import moment from "moment";

export const cdnBaseUrl =
  "https://trendy-download.oss-cn-beijing.aliyuncs.com/web";

// 从列表中转vals为Label, 要求value格式完全一致才可计算
export function readFromList(
  vals,
  list,
  char = "，",
  emptytxt = "<无>",
  opt = {}
) {
  char = !!char ? char : "，";
  const label = opt.label || "label";
  const value = opt.value || "value";
  // value => label
  if (
    [undefined, null, ""].indexOf(vals) !== -1 ||
    [undefined, null, ""].indexOf(list) !== -1 ||
    !list.length
  ) {
    if (process.env.NODE_ENV !== "production") {
      console.error("readFromList方法传入参数有误，重新检查代码。");
      console.error(vals, list, char);
    }
    return emptytxt;
  }
  if (!(vals instanceof Array)) {
    vals = [vals.toString()];
  }
  if (!vals.length) return emptytxt;
  const result = list
    .filter((el) => {
      return (
        vals.indexOf(el[value]) !== -1 || vals.indexOf("" + el[value]) !== -1
      );
    })
    .map((el) => el[label]);
  return result.length > 0 ? result.join(char) : emptytxt;
}

export function readFromTree(vals = [], map = [], children = "children") {
  let result = [];
  for (let k in map) {
    if (map[k][children]) {
      // result = result.concat(k + "：" + readFromList(vals, map[k][children]));
      result.push(readFromList(vals, map[k][children]));
    }
  }
  // console.log(result);
  return result.filter((el) => !/<无>$/.test(el)).join("；") || "<无>";
}

export function readItemFromTree(val, map = [], opt) {
  opt = {
    children: "children",
    valType: "value",
    ...opt,
  };
  let result;

  function read(map) {
    for (let k in map) {
      if (map[k][opt.valType] === val) {
        result = map[k];
        return;
      }
      if (map[k][opt.children]) {
        read(map[k][opt.children]);
      }
    }
  }
  read(map);
  return result;
}

// 千分位标记法
export function toThousands(num) {
  if (!num && num !== 0) return;
  if (isNaN(num)) {
    console.error("千分位标记法：输入不能转化为一个合法数字。" + num);
    return num;
  }
  // return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  let [n1, n2] = (num + "").split(".");
  n2 = n2 ? n2 : "";

  return (
    n1.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    ((num + "").match(/\./) ? "." + n2 : "")
  );
}
export function parseThousands(str) {
  return str.replace(/\$\s?|(,*)/g, "");
}

// 计算百分比
export function divisionFilter(a, b, fixed = 2) {
  if (a === 0) {
    return "0%";
  } else if (b === 0) {
    return "100%";
  } else {
    return ((a / b) * 100).toFixed(fixed) + "%";
  }
}

// 混合对象
export function mixinObj(o1, o2) {
  let floor = 0;
  for (const k in o2) {
    floor = 0;
    if (o2[k] instanceof Array) {
      o1[k] = [].concat(o2[k]);
    } else if (typeof o2[k] !== "object") {
      o1[k] = o2[k];
    } else {
      floor++;
      o1[k] = o1[k] || {};
      if (floor < 5) {
        mixinObj(o1[k], o2[k]);
      } else {
        try {
          o1[k] = Object.assign({}, o1[k], o2[k]);
        } catch (err) {
          o1[k] = o2[k];
        }
      }
    }
  }
  return o1;
}

/**
 * 返回图表的 dataURL 用于生成图片。
 * @param chart 需要获取 DataURL 的 chart 实例
 * @returns 返回图表的 dataURL
 */
function toDataURL(chart) {
  const c = chart.container.querySelector("canvas");
  const canvas = c.getContext("2d");
  const renderer = chart.renderer;
  const canvasDom = canvas.get("el");
  let dataURL = "";
  if (renderer === "svg") {
    const clone = canvasDom.cloneNode(true);
    const svgDocType = document.implementation.createDocumentType(
      "svg",
      "-//W3C//DTD SVG 1.1//EN",
      "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"
    );
    const svgDoc = document.implementation.createDocument(
      "http://www.w3.org/2000/svg",
      "svg",
      svgDocType
    );
    svgDoc.replaceChild(clone, svgDoc.documentElement);
    const svgData = new XMLSerializer().serializeToString(svgDoc);
    dataURL = "data:image/svg+xml;charset=utf8," + encodeURIComponent(svgData);
  } else if (renderer === "canvas") {
    dataURL = canvasDom.toDataURL("image/png");
  }
  return dataURL;
}

/**
 * 图表图片导出
 * @param chart chart 实例
 * @param name 图片名称，可选，默认名为 'G2Chart'
 */
export function downloadImage(chart, name = "G2Chart") {
  const download = () => {
    const element = chart.container.querySelector("canvas");
    const newCanvas = document.createElement("canvas");
    newCanvas.width = element.width + 40;
    newCanvas.height = element.height + 40;
    newCanvas.id = "newCanvas";

    // document.querySelector("#app").appendChild(newCanvas);
    const ctx = newCanvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(element, 20, 20, newCanvas.width - 20, newCanvas.height - 20);

    const imgData = newCanvas.toDataURL("image/png");
    fileDownload(imgData);
  };
  const fileDownload = (imgData) => {
    const aLink = document.createElement("a");
    aLink.style.display = "none";
    aLink.href = imgData;
    aLink.download = name + ".png";
    // 触发点击-然后移除
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
  };
  return download();
}

export function obj2arr(obj, type = "kv", opt = {}) {
  const label = opt.label || "label";
  const value = opt.value || "value";

  if (typeof obj === "string") {
    let str = obj;
    if (str[0] === "{" && str[str.length - 1] === "}") {
      str =
        "[" +
        str
          .slice(1, str.length - 1)
          .split(",")
          .map((itemStr) => "{" + itemStr + "}") +
        "]";
    }
    return JSON.parse(str).map((item) => {
      for (let key in item) {
        key = isNaN(+key) ? key : +key;
        return {
          [label]: type === "kv" ? item[key] : key,
          [value]: type === "kv" ? key : item[key],
        };
      }
    });
  } else if (obj instanceof Array) {
    return obj.map((item) => {
      return {
        [label]: item,
        [value]: item,
      };
    });
  } else {
    const arr = [];
    for (let key in obj) {
      key = isNaN(+key) ? key : +key;
      arr.push({
        [label]: type === "kv" ? obj[key] : key,
        [value]: type === "kv" ? key : obj[key],
      });
    }
    return arr;
  }
}

/*  地图用颜色获取器：*/
export const COLORS = [
  "#1c4aa2",
  "#24519f",
  "#2e599b",
  "#355f97",
  "#3c6594",
  "#3c6594",
  "#4c728c",
  "#517889",
  "#537f85",
  "#568581",
  "#588c7d",
  "#5b9379",
  "#5e9a76",
  "#61a172",
  "#61a76e",
  "#62ae6a",
  "#62b566",
  "#63be60",
  "#64c45d",
  "#64c859",
]; // 0% ~ 100%

/**
 * 根据输入的小数返回一个颜色值。
 * @param num 小数，表示当前取色比例
 * @returns 一个16位预设颜色值
 */
export function getColorByPercent(num = 0) {
  if (isNaN(num)) {
    console.log("数据可能有误。");
  }
  // if(num < 0 || num > 1){
  // console.log("数据可能有误，需要一个0～1之间的数表示比例。")
  // }
  return COLORS[Math.floor(num * COLORS.length)] || COLORS[COLORS.length - 1];
}

export const g2ColorList = [
  "#6d96f2",
  "#d2dffa",
  "#83d7ae",
  "#d7f3e6",
  "#687795",
  "#d1d6df",
  "#eec14f",
  "#faecc2",
  "#da7362",
  "#f2d3cf",
  "#88cae9",
  "#daeef8",
  "#926bb8",
  "#ddd2e9",
  "#f2a15f",
  "#fae3cd",
  "#4f9798",
  "#c4dfdf",
  "#f2a3c5",
  "#fae3ed",
];

export function getDurationList(
  list = [3, 5, 15, 20, 30, 60, 90, 9999],
  readable = false
) {
  let result = list.map((v) => {
    if (v === 9999) {
      return {
        label: "不限",
        value: v,
      };
    }
    if (v === -1) {
      return {
        label: "不分时长",
        value: -1,
      };
    }
    if (v === -2) {
      return {
        label: "所有时长",
        value: -2,
      };
    }
    return {
      label: v + "秒",
      value: v,
    };
  });
  if (readable) return result.map((el) => el.label).join("，");
  return result;
}

export function formatDate(timestamp) {
  return timestamp ? moment(+timestamp).format("YYYY/MM/DD") : "无";
}

export function formatTime(timestamp) {
  try {
    return timestamp ? moment(+timestamp).format("YYYY/MM/DD HH:mm:ss") : "无";
  } catch (err) {
    console.error("错误的时间戳格式：");
    console.error(err);
    return "无";
  }
}

// 下载文件用
export function fileDownload(href, download) {
  const downloadLink = document.createElement("a");
  downloadLink.href = href;
  downloadLink.download = download || href;
  downloadLink.click();
}

// 图片转码
export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

// filterSendData
export function filterSendData(sendData = {}, options = {}) {
  let opt = {
    formatArray: "string", // "string","array","none"
    ...options,
  };
  // console.log(opt);
  for (let key in sendData) {
    // formatArray
    if (Array.isArray(sendData[key])) {
      if (opt.formatArray === "string") {
        sendData[key] = JSON.stringify(sendData[key]);
      } else if (opt.formatArray === "array") {
        sendData[key] = sendData[key].join(",");
      }
    }
  }
  return sendData;
}

export const eNumber = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export function fc(arr) {
  if (!arr.length) {
    console.warn("不正确的数组");
    console.warn(arr);
    return {};
  }
  let sum = arr.reduce((sum, el) => Math.fround(sum + el), 0);
  let ave = sum / arr.length;
  let re =
    arr.reduce((sum, el) => Math.fround(sum + Math.pow(el - ave, 2)), 0) /
    arr.length;
  return {
    fc: re,
    sd: Math.sqrt(re, 2),
    sum,
    ave,
  };
}

export function timeago(dateTimeStamp) {
  //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
  let minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
  let hour = minute * 60;
  let day = hour * 24;
  let week = day * 7;
  let halfamonth = day * 15;
  let month = day * 30;
  let now = new Date().getTime(); //获取当前时间毫秒
  let diffValue = now - dateTimeStamp; //时间差

  if (diffValue < 0) {
    return;
  }
  let minC = diffValue / minute; //计算时间差的分，时，天，周，月
  let hourC = diffValue / hour;
  let dayC = diffValue / day;
  let weekC = diffValue / week;
  let monthC = diffValue / month;
  let result = "";
  //此处考虑小数情况，感谢 情非得已https://blog.csdn.net/weixin_48495574 指正
  if (monthC >= 1 && monthC < 4) {
    result = " " + parseInt(monthC) + "月前";
  } else if (weekC >= 1 && weekC < 4) {
    result = " " + parseInt(weekC) + "周前";
  } else if (dayC >= 1 && dayC < 7) {
    result = " " + parseInt(dayC) + "天前";
  } else if (hourC >= 1 && hourC < 24) {
    result = " " + parseInt(hourC) + "小时前";
  } else if (minC >= 1 && minC < 60) {
    result = " " + parseInt(minC) + "分钟前";
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = "刚刚";
  } else {
    let datetime = new Date();
    datetime.setTime(dateTimeStamp);
    let Nyear = datetime.getFullYear();
    let Nmonth =
      datetime.getMonth() + 1 < 10
        ? "0" + (datetime.getMonth() + 1)
        : datetime.getMonth() + 1;
    let Ndate =
      datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    let Nhour =
      datetime.getHours() < 10
        ? "0" + datetime.getHours()
        : datetime.getHours();
    let Nminute =
      datetime.getMinutes() < 10
        ? "0" + datetime.getMinutes()
        : datetime.getMinutes();
    let Nsecond =
      datetime.getSeconds() < 10
        ? "0" + datetime.getSeconds()
        : datetime.getSeconds();
    result = Nyear + "-" + Nmonth + "-" + Ndate;
  }
  return result;
}
// 获取文件名
export function getFileNameFromUrl(
  url,
  filename = "下载文件",
  emptyTxt = "<无>"
) {
  const result = url.match(new RegExp("/([^/?#]+)[^/]*$"));
  if (!result) return emptyTxt;
  return result.length > 0 ? result[0].replace(new RegExp("^/"), "") : filename;
}
