var page = require('webpage').create(),
system = require('system'),
fs = require('fs');

var address = system.args[1];
page.viewportSize = { width: 1200, height: 900 };
page.onConsoleMessage = function(msg) {
    console.log(msg);
    fs.write("logs.txt", msg, 'a');
};

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  fs.write("logs.txt", msgStack.join('\n'), 'a');
  phantom.exit(4);
};

page.onResourceTimeout = function(request) {
    console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
    phantom.exit(3);
};

page.onCallback = function(data){
    if (data.exit) {
        //page.render('imgName.png',100);
        console.log("pdf start: "+data.fileName);
        page.render(data.fileName, 100);
        console.log("pdf complete");
        phantom.exit();
    }
    else if (data.write) {
      fs.write("logs.txt", '\n'+data.msg, 'a');
    }
    else if (data.scroll) {
      page.scrollPosition = { top: page.scrollPosition + 1000, left: 0 };
    }
};

console.log("url: " + address);
page.open(address, function (status) {
    if (status === "success") {
      window.callPhantom({ write: true, msg: "load success" });
        //waitFor 5 seconds to complete the rendering
        //Note: adjust the seconds according to your n/w speed
        setTimeout(function() {
          page.evaluate(function(){
             window.callPhantom({ write: true, msg: "waitFor 5 seconds to complete the rendering" });

             var timer = function (callbackFn) {
              	setTimeout(function(){
                  window.scrollTo(0,document.body.scrollHeight);
                  //console.log("document.body.scrollHeight:"+document.body.scrollHeight);
                  //console.log("Scroll:"+((window.innerHeight + window.scrollY) >= document.body.scrollHeight));
                  //console.log("hidden:"+document.getElementsByClassName("pagedlist_hidden").length);
                  if(callbackFn)
                    callbackFn();
                },9000,callbackFn);
              };

            var srchTimer = function(){
              setTimeout(function() {
                window.scrollTo(0,document.body.scrollHeight);
                //console.log("document.body.scrollHeight:"+document.body.scrollHeight);
                //console.log("hidden elements:"+document.getElementsByClassName("pagedlist_hidden").length);
                //no hidden elements
                var hasScrolledToBottom = ((window.innerHeight + window.scrollY) >= document.body.scrollHeight);
                //console.log("Scroll:"+hasScrolledToBottom);
                var hiddenAnswers = document.getElementsByClassName("pagedlist_hidden").length;
                if(hiddenAnswers == 0){
                    savePdfAndExit();
                }
                else if (hiddenAnswers < 4 ) {
                    hasScrolledToBottom ? timer(savePdfAndExit) : timer(srchTimer);
                }
                else {
                  timer(srchTimer);
                }
              },9000);
            };

            var savePdfAndExit = function () {
              //scroll to top
              document.body.scrollTop = document.documentElement.scrollTop = 0;
              //var clipRect = document.querySelector(".layout_2col_main").getBoundingClientRect();
              //var clipPos = { top:    clipRect.top, left:   clipRect.left, width:  clipRect.width, height: clipRect.height };
              cleanPage();
              var fileName = document.title.replace(/[^a-zA-Z0-9-_ \.]/g, '') + '.pdf';
              window.callPhantom({ exit: true, fileName: fileName });
            };

            var cleanPage = function () {
                [].forEach.call(document.querySelectorAll('.layout_2col_side'), function (el) {
                  el.style.visibility = 'hidden';
                });
                [].forEach.call(document.querySelectorAll('.SiteHeader'), function (el) {
                  el.style.visibility = 'hidden';
                });
                [].forEach.call(document.querySelectorAll('.ContentPageFeed'), function (el) {
                  el.style.visibility = 'hidden';
                });
            };

               timer();
               timer();
               timer();
               timer();
               timer(srchTimer);

          });
        }, 7000);

    } else {
      window.callPhantom({ write: true, msg: "status:"+status });
      phantom.exit(2);
    }
});
