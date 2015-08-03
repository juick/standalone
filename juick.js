var juickTag;
var juickPage;

function juickInit(uname) {
  var message=juickGetHashVar("message");
  juickTag=juickGetHashVar("tag");
  juickPage=juickGetHashVar("page");
  if(juickPage) juickPage=parseInt(juickPage);
  if(!juickPage || juickPage<1) juickPage=1;

  var msgs=document.getElementById("messages");
  while(msgs.hasChildNodes()) msgs.removeChild(msgs.lastChild);
  var replies=document.getElementById("replies");
  while(replies.hasChildNodes()) replies.removeChild(replies.lastChild);
  document.getElementById("navigation").style.display="none";

  var nodes=document.getElementsByClassName("loadScript");
  for(var i=0; i<nodes.length; i++)
    nodes[i].parentNode.removeChild(nodes[i]);
  if(message && message>0) {
    var url="http://api.juick.com/thread?mid="+message+"&callback=juickParseThread";
    juickLoadScript(url);
  } else {
    var url="http://api.juick.com/messages?uname="+uname;
    if(juickTag && juickTag!='') url+="&tag="+encodeURI(juickTag);
    if(juickPage && juickPage>0) url+="&page="+juickPage;
    url+="&callback=juickParseMessages";
    juickLoadScript(url);
  }
}

function juickLoadScript(src) {
  var scripttag=document.createElement("script");
  scripttag.setAttribute("type","text/javascript");
  scripttag.setAttribute("src",src);
  scripttag.setAttribute("class","loadScript");
  document.getElementsByTagName("head")[0].appendChild(scripttag);
}

function juickParseMessages(json) {
  var msgs=document.getElementById("messages");
  for(var i=0; i<json.length; i++) {

    var ts=json[i].timestamp.split(/[\-\s]/);
    var date=new Date(ts[0],ts[1]-1,ts[2]);
    var ihtml='<div class="date"><div class="day">'+date.getDate()+'</div><div class="month">'+date.getMonthName()+'</div><div class="year">'+(1900+date.getYear())+'</div></div>';

    if(json[i].tags) {
      ihtml+='<div><ul class="tags">';
      for(var n=0; n<json[i].tags.length; n++)
        ihtml+='<li><a href="#tag='+json[i].tags[n]+'">'+json[i].tags[n]+'</a></li>';
      ihtml+='</ul></div>';
    }

    ihtml+='<div class="text">';
    if(json[i].photo)
      ihtml+='<div class="photo"><a href="'+json[i].photo.medium+'"><img src="'+json[i].photo.small+'" alt="Photo"/></a></div>';
    if(json[i].video)
      ihtml+='<b>Attachment:</b> <a href="'+json[i].video.mp4+'">Video</a><br/>';
    if(json[i].location)
      ihtml+='<b>Location:</b> <a href="/places/'+json[i].location.place_id+'">'+json[i].location.name+'</a><br/>';
    ihtml+=juickFormatText(json[i].body);
    ihtml+='</div>';



    var replies=json[i].replies;
    if(!replies) replies=0;
    ihtml+='<div class="replies"><a href="#message='+json[i].mid+'">'+juickReplies+': '+replies+'</a></div>';

    var li=document.createElement("li");
    li.innerHTML=ihtml;
    msgs.appendChild(li);
  }

  var nav="";
  if(juickPage && juickPage>1) {
    nav+='<a href="#';
    if(juickTag && juickTag!='') nav+='tag='+juickTag+'&';
    if(juickPage>2) nav+='page='+(juickPage-1);
    nav+='">'+juickNewer+'</a>';
  }
  if(juickPage>1 && json.length==20) nav+=' &nbsp; ';
  if(json.length==20) {
    nav+='<a href="#';
    if(juickTag && juickTag!='') nav+='tag='+juickTag+'&';
    nav+='page='+(juickPage+1);
    nav+='">'+juickOlder+'</a>';
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
  //console.log(txt);
  //txt=txt.replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;");
  txt=txt.replace(/\n/g,"<br/>");
  txt = urlify(txt);
  return txt;
}

function is_img(url){
  var imgRegex = /\.(jpg|png|gif|jpeg|svg)((\?|:).+)?$/;
  return imgRegex.test(url);
}

function classify(url){
  if (is_img(url)){
    return 'image'
  } else if (/(youtube|youtu).(com|be)/.test(url)){
    console.log('Return youtube: ', url)
    return 'youtube'
  } else if (/vimeo.com/.test(url)){
    return 'vimeo'
  } else if (/^https?:\/\/(?:i.)?imgur.com/.test(url)) {
    return 'imgur'
    //return 'other'
  } else if (/coub.com/.test(url)){
    return 'coub'
  } else {
    return 'other'
  }
}

function get_youtubeid(url){

  if (url.indexOf('youtube.com') >= 0){
    var video_id = url.split('v=')[1];

  } else if (url.indexOf('youtu.be') >= 0) {
    var s = url.split('/');
    var video_id = s[s.length-1];
  }
  if (!video_id){ return };
  var ampersandPosition = video_id.indexOf('&');
  if(ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  return video_id
}

function get_imgurid(url){
  console.log(url);
  var r = /imgur.com\/(?:gallery\/)?(\w+)(?:\..+)?/;
  if (r.test(url)) {
    var i = url.match(r)[1];
    if (i.length >= 7){
      return i;
    } else {
      return 'a/'+i;
    }
  } else {
    return ''
  }
}

function urlify(text) {
  var adimumUrlRegex = /<((https?|ftp)(:\/\/[^\s()<>]+))>/g;
  if (adimumUrlRegex.test(text)){
    text = text.replace(adimumUrlRegex, function(_, inner){
      return ' '+inner+' '
    });
  }
  var urlRegex = /(https?|ftp)(:\/\/[^\s()<>]+)/g;

  return text.replace(urlRegex, function(url) {
    var cls = classify(url);
    if (cls == 'image'){
      return '<div class="div_a_pic"><a class="a_pic" href="' + url + '">' + '<img src="'+url+'"style="position: relative; margin: auto; max-width: 800px"/></a></div>';
    } else if (cls == 'youtube' && get_youtubeid(url)){
      var yid = get_youtubeid(url);
      return '<iframe id="ytplayer" type="text/html" width="800" height="490" src="http://www.youtube.com/embed/'+yid+'" frameborder="0"></iframe>';
    } else if (cls == 'coub') {
      var u = url.replace('view', 'embed')
      return '<iframe src="'+u+'?muted=false&autostart=false&originalSize=false&hideTopBar=false&startWithHD=false" allowfullscreen="true" frameborder="0" width="800" height="490"></iframe>';

    } else if (cls == 'vimeo') {
      var vid = url.match(/\/(\d+)$/)[1];
      return '<iframe src="https://player.vimeo.com/video/'+vid+'" width="800" height="490" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
    } else if (cls == 'imgur'){
      var iid = get_imgurid(url);
      console.log('iid: ', iid);
      var a = '<blockquote class="imgur-embed-pub" data-context="false" lang="en" data-id="' + iid + '"/>';
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'http://s.imgur.com/min/embed.js';
      s.async = true;
      setTimeout(function(){
        console.info('Append ', s, ' to ', document.body);
        document.body.appendChild(s);
      }, 300);
      return a
    } else {
      return '<a class="a_other" href="' + url + '">'+decodeURIComponent(url)+'</a>';
    }
  })
}
