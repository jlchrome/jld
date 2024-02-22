fetch = require("node-fetch");
var exp = require("express");
console.log("hello world")
var app = exp();
app.use(exp.urlencoded())
app.post("/", async function(req,res){
  var url = req.query.url
  var h = req.headers
  var headers = {accept:h.accept,"accept-encoding":h["accept-encoding"],"accept-language":"en-en","cache-control":"max-age=1","cookie":h.cookie,"user-agent":h["user-agent"]}
  var result = await fetch(url,{"method":"post",headers:headers,body:JSON.stringify(req.body)})
  res.send(await result.text())
})
app.get("/", async function(req,res){
  var url = req.query.url;
  if(!url&&req.headers.referer&&req.headers.referer.includes("url")){
    var nurl = new URL(req.url, new URLSearchParams(new URL(req.headers.referer).search).get("url"))
    res.redirect("https://browser.icelite.repl.co/?url="+encodeURIComponent(nurl));
    return
  }
  if(!url){
    res.send("Request failed. Please try again by putting the URL in the type bar. Thanks for using New Tab.")
    return
  }
  var h = req.headers
  var headers = {accept:h.accept,"accept-encoding":h["accept-encoding"],"accept-language":"en-en","cache-control":"max-age=1","cookie":h.cookie,"user-agent":h["user-agent"]}
  var response = await fetch(url,{method:req.method,headers:headers}).catch(function(err){
    res.send("error")
  })
  var type = response.headers.get('content-type')
  if(type.match(/image\/(?!svg)/)){
    //res.set(response.headers.raw())
    res.set("Access-Control-Allow-Origin", "*")
    res.set("Access-Control-Allow-Credentials","*")
    res.set("Content-Type", type)
    res.send(await response.buffer())
    return
  }
  var text = await response.text()
  //text = text.replace(/((href|src|action)\=\")(http(.*?))(\")/g, "$1https://growlingtightweblogsoftware--five-nine.repl.co/?url=$3\"")
  text = text.replace(/((href|src|action)\=\")(.*?)(\")/g, function(_,arg1,arg2,arg3,arg4){
var newurl = new URL(arg3,url)
if(!String(newurl).match(/^http/)){
  return arg1 + newurl + arg4
}
return arg1 + "https://browser.icelite.repl.co/?url=" + encodeURIComponent(newurl) + arg4
})
if(type.match(/text\/css/)){
  text = text.replace(/\"(http(s)?\:\/\/([a-zA-Z]{1,10}\.)?([a-zA-Z0-9]{1,20})\.([a-zA-Z\.]{2,10})(\/([-a-zA-Z0-9\$_\.,\+!*'()@&?#%\/;=]{0,150}))?)/gim, "https://browser.icelite.repl.co/?url=$1")
}
if(type.match(/text\/html/)){
  text += "<script>onmessage=function(e){eval(e.data)}</script>"
}
res.set("Content-Type", type)
res.set("Access-Control-Allow-Credentials", "*")
res.set("Access-Control-Allow-Origin", "*")
  res.send(text)
})
app.get("*", function(req,res){
  try{
  var newurl = new URL(req.path,new URLSearchParams(new URL(req.headers.referer).search).get("url"))
  res.redirect("https://browser.icelite.repl.co/?url="+encodeURIComponent(newurl))
  }
  catch(err){
    res.send("error")
  }
})
app.listen(3000)
process.on('unhandledRejection', (err, p) => {
  return
});
