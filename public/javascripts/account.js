$(function() {
    var fileList = $("#fileList");
    var submitButton = $("#submitQuery");
    var select = $("#queryType");
    var canvas = $("#myChart").get(0);
    var textArea = $("#box");
    var ctx = canvas.getContext("2d");
    var myBarChart;
    var stats;

    function display()
    {

        var  m= $("input:text[name=message]").val();
        var  s= $("input:text[name=service]").val();
        var  f= $("input:text[name=file]").val();
        var  mo= $("input:text[name=month]").val();
        var  d= $("input:text[name=day]").val();
        var  qType;


        
            if(select.val()=='visualize')
            {
                
                qType = "visualize"

                 $.post("/analyze", {message:m,service:s,file:f,month:mo,day:d,type:qType},
                  drawGraph);
            }
            else if(select.val()=='show')
            {
                qType = "show";
                 $.post("/analyze", {message:m,service:s,file:f,month:mo,day:d,type:qType},
                  showLog);
            }
            else if(select.val()=='download')
            {
                qType = "download";
                 $.post("/analyze", {message:m,service:s,file:f,month:mo,day:d,type:qType},
                  downloadLog);
            }
        }
    
        function drawGraph(content)
        {
           if (myBarChart) {
               myBarChart.destroy();
             }

            myBarChart = new Chart(ctx).Bar(content, {});
        }

        function showLog(content)
        {

          textArea.text(content);
        }
        function downloadLog(content)
        {
            var name = "LogFound";
           saveAs(new Blob([content],
            {type: "text/plain;charset=utf-8"}),
              name);
        }

    function downloadFile(i) {
        function saveDownloadedFile(fileContents) {
            console.log("Trying to save file");
            console.log(fileContents);
            saveAs(new Blob([fileContents],
                            {type: "text/plain;charset=utf-8"}),
                   stats[i].name);
        }
        
        return function() {
            $.post("/downloadFile", {downloadFile: stats[i].name},
                   saveDownloadedFile);
        }
    }
    
function doUpdateFileList (returnedStats) {
        var i;
        stats = returnedStats;
        fileList.empty();
        for (i=0; i<stats.length; i++) {
            fileList.append('<li> <a id="file' + i + '" href="#">' +
                            stats[i].name +
                            "</a> (" + stats[i].size + " bytes)");
            $("#file" + i).click(downloadFile(i));
        }
    }
    
    function updateFileList () {
        $.getJSON("/getFileStats", doUpdateFileList);
    }

    submitButton.click(display);
    updateFileList();
    
    $("#fileuploader").uploadFile({
        url:"/uploadText",
        fileName:"theFile",
        dragDrop: true,
        uploadStr: "Upload Files",
        afterUploadAll: updateFileList
    });    
 
});
