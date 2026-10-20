<script>
export default {
  name: "Login",
  mounted() {
    if (process.env.NODE_ENV === "production") {
      window.location.href = "http://smartedu.gzucm.edu.cn/login/index.php";
    } else {
      console.error("无效的token");
      console.log("http://" + location.host + "/?token=");
    }
  },
  render() {
    return <div>...</div>;
  },
};
</script>
