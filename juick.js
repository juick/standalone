Date.prototype.getMonthName = function() {
  return ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'][this.getMonth()];
}
var juickReplies="Ответов";
var juickNewer="← Раньше";
var juickOlder="Позже →";
var juickName="ugnich";

var juickTag;
var juickLastMid;

function juickInit(uname) {
  var message=juickGetHashVar("message");
  juickTag=juickGetHashVar("tag");
  juickLastMid=juickGetHashVar("before_mid");
  if(juickLastMid) juickLastMid=parseInt(juickLastMid);
  if(!juickLastMid || juickLastMid<0) juickLastMid=0;

  var msgs=document.getElementById("messages");
  while(msgs.hasChildNodes()) msgs.removeChild(msgs.lastChild);
  var replies=document.getElementById("replies");
  while(replies.hasChildNodes()) replies.removeChild(replies.lastChild);
  document.getElementById("navigation").style.display="none";

  var nodes=document.getElementsByClassName("loadScript");
  for(var i=0; i<nodes.length; i++)
    nodes[i].parentNode.removeChild(nodes[i]);
  if(message && message>0) {
    var url="http://api.juick.com/thread?mid="+message;
    juickLoadScript(url, juickParseThread);
  } else {
    var url="http://api.juick.com/messages?uname="+uname;
    if(juickTag && juickTag!='') url+="&tag="+encodeURI(juickTag);
    if(juickLastMid && juickLastMid>0) url+="&before_mid="+juickLastMid;
    juickLoadScript(url, juickParseMessages);
  }
}

function juickLoadScript(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    callback(JSON.parse(xhr.responseText));
}

function juickParseMessages(json) {
  var msgs=document.getElementById("messages");
  for(var i=0; i<json.length; i++) {
    juickLastMid = parseInt(json[i].mid);
    var ts=json[i].timestamp.split(/[\-\s]/);
    var date=new Date(ts[0],ts[1]-1,ts[2]);
    var ihtml='<div class="date"><div class="day">'+date.getDate()+'</div><div class="month">'+date.getMonthName()+'</div></div>';
    
    ihtml+='<div class="text">';
    if(json[i].photo)
      ihtml+='<div class="photo"><a href="'+json[i].photo.medium+'"><img src="'+json[i].photo.small+'" alt="Photo"/></a></div>';
    if(json[i].video)
      ihtml+='<b>Attachment:</b> <a href="'+json[i].video.mp4+'">Video</a><br/>';
    if(json[i].location)
      ihtml+='<b>Location:</b> <a href="/places/'+json[i].location.place_id+'">'+json[i].location.name+'</a><br/>';
    ihtml+=juickFormatText(json[i].body || "");
    ihtml+='</div>';
    
    if(json[i].tags) {
      ihtml+='<ul class="tags">';
      for(var n=0; n<json[i].tags.length; n++)
        ihtml+='<li><a href="#tag='+json[i].tags[n]+'">'+json[i].tags[n]+'</a></li>';
      ihtml+='</ul>';
    }

    var replies=json[i].replies;
    if(!replies) replies=0;
    ihtml+='<div class="replies"><a href="#message='+json[i].mid+'">'+juickReplies+': '+replies+'</a></div>';

    var li=document.createElement("li");
    li.innerHTML=ihtml;
    msgs.appendChild(li);
  }
  
  var nav="";
  if(juickLastMid && juickLastMid>0) {
    if(json.length==20) {
      nav+='<a href="#';
      if(juickTag && juickTag!='') nav+='tag='+juickTag+'&';
      nav+='before_mid='+juickLastMid;
      nav+='">'+juickOlder+'</a>';
    }
  }
  if(nav!="") {
    document.getElementById("navigation").innerHTML=nav;
    document.getElementById("navigation").style.display="block";
  }
}

function juickParseThread(json) {
  var msg=new Array();
  msg[0]=json[0];
  juickParseMessages(msg);

  var replies=document.getElementById("replies");
  for(var i=1; i<json.length; i++) {

    var ihtml='<div class="username"><a href="http://juick.com/'+json[i].user.uname+'/">@'+json[i].user.uname+'</a>:</div>';
    
    ihtml+='<div class="text">';
    if(json[i].photo)
      ihtml+='<div class="photo"><a href="'+json[i].photo.medium+'"><img src="'+json[i].photo.small+'" alt="Photo"/></a></div>';
    if(json[i].video)
      ihtml+='<b>Attachment:</b> <a href="'+json[i].video.mp4+'">Video</a><br/>';
    ihtml+=juickFormatText(json[i].body);
    ihtml+='</div>';
    
    var li=document.createElement("li");
    li.style.backgroundImage='url(http://i.juick.com/as/'+json[i].user.uid+'.png)';
    li.innerHTML=ihtml;
    replies.appendChild(li);
  }
}

function juickGetHashVar(variable) {
  var query=window.location.hash.substring(1);
  var vars=query.split("&");
  for(var i=0; i<vars.length; i++) {
    var pair=vars[i].split("=");
    if(pair[0]==variable) return pair[1];
  }
}

function juickFormatText(txt) {
  txt=txt.replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;");
  txt=txt.replace(/\n/g,"<br/>");
  return txt;
}
