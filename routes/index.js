var express = require('express');
var router = express.Router();
var num=0;
var numEn=0;
var ObjectId = require('mongodb').ObjectID;
var mc = require('mongodb').MongoClient;
var fs = require('fs');
var multer  = require('multer')
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
router.get('/', function(req, res) {
    res.render('index', {title: 'COMP 2406 Log Analysis & Visualization',
			 numFiles: num,
			 numEntries: numEn});
});

//var files = [];
var db,filesCollection;
var entries=[];
var entry,lines;
var queries=[];

function uploadLog(req, res) {
    var theFile = req.file;
    var line=[];
    if (req.file) {
	//files.push(theFile);
	line = theFile.buffer.toString().split("\n");
	for(var i=0;i< line.length;i++)
	{
	if(line[i]!= "")
	{
	lines=line[i].split(/\s+/);
	entry={};
	entry.fileName=theFile.originalname;
	entry.month = lines[0];
	entry.day  =  lines[1];
	entry.time = lines[2];
	entry.host = lines[3];
	entry.service = lines[4].slice(0,-1);
	entry.message = lines.slice(5).join(' ');
	numEn++;
	entries.push(entry);
	}
	
	}
	db.collection('logs').insert(entries,function(err, result) {
    	if (err) {
		throw err;
    	}
 
    	console.log("Inserted the following log record:");
    	console.log(result.ops[0]);
    	res.send("File uploaded succeeded");
    	num++;
		});

    } else {
	res.send("File upload failed");
    }
    return entries;
}


 


/*function getLogs(query, returnQuery) {
    // use query object to retrieve logs from server
    // return an array of log objects
    // NOTE: you may need to add properties to these objects to get the
    // required functionality
    
    console.log("Processing query:");
    var searchMessage = new RegExp( query.message );
    var searchService = new RegExp( query.service );
    var searchMonth = new RegExp( query.month );
    var searchDay = new RegExp( query.day );
    var searchFile = new RegExp( query.file );
    console.log(searchMessage);
    console.log(searchService);
    	 db.collection('logs').find( { service : searchService , message: searchMessage,month : searchMonth, day : searchDay, fileName: searchFile}).toArray(function(err, data)
    	    
    	 {
    	 	 if (err) {
			throw err;
  				}
  			console.log(data);
    	 	returnQuery(data);
    	 });

   

    
 
    
}*/

function entriesToLines(theLogs) {
   /* return ["Here are log entries",
	    "One per line",
	    "Just as they were uploaded."].join('\n');*/
	    var logLine;
		theLogs.forEach(function(c){
			logLine+=c.month+" "+c.day+" "+c.time+" "+c.host+" "+c.service+" "+c.message+"\n";
		});
		return logLine;
}

function analyzeSelected(theLogs) {

	var data={
		labels:[],
		datasets:[
            {
		label: "Feb 16",
		fillColor: "rgba(151,187,205,0.5)",
		strokeColor: "rgba(151,187,205,0.8)",
		highlightFill: "rgba(151,187,205,0.75)",
		highlightStroke: "rgba(151,187,205,1)",
		data: []
            }
	]
    };

	var analyze = [];
	var choice;

	theLogs.forEach(function(q)
	{
		var r={};
		
			r.month=q.month;
			r.day=q.day;
			r.date=r.month+" "+r.day;
			var labels=[];
   		    var values=[];
			var counts={};
		    analyze.push(r);

		    analyze.forEach(function(a)
		    {
			choice=a.date;
			if(counts[choice])
			{
				
				counts[choice]=counts[choice]+1;
			}
			else
			{
				counts[choice]=1;
			}
		
			});

		Object.keys(counts).forEach(function(c) {
	    labels.push(c);
	    values.push(counts[c]);
	    data.labels=labels;
		data.datasets[0].data=values;
		});
		});
	
    //return "var data = " + JSON.stringify(data);
    return data;

}


/*function doQuery(req, res) {

    var query = { message: req.body.message,
		  service: req.body.service,
		  file: req.body.file,
		  month: req.body.month,
		  day: req.body.day,
		  queryType: req.body.queryType};

    function returnQuery(theLogs) {
	if (query.queryType === 'visualize') {
	    res.render('visualize', {title: "Query Visualization",
				     theData: analyzeSelected(theLogs)});
	} else if (query.queryType === 'show') {
		var logLine;
		theLogs.forEach(function(c){
			logLine+=c.month+" "+c.day+" "+c.time+" "+c.host+" "+c.service+" "+c.message+"\n";
		});
	    res.render('show', {title: "Query Results", logs: logLine});
	} else if (query.queryType === 'download') {
	    res.type('text/plain');
	    res.send(entriesToLines(theLogs));
	} else {
	    res.send("ERROR: Unknown query type.  This should never happen.");
	}
    }

    getLogs(query, returnQuery);
}*/
//router.post('/doQuery', doQuery);

router.get('/testVis', function(req, res) {
    res.render('visualize', {title: "Query Visualization Test",
			     theData: analyzeSelected()});
});

/*router.get('/visualize', function(req, res) {

	var query = { message: req.body.message,
		  service: req.body.service,
		  file: req.body.file,
		  month: req.body.month,
		  day: req.body.day,
		  queryType: req.body.queryType};

    function returnQuery(theLogs) {
	if (query.queryType === 'show') {
		var logLine;
		theLogs.forEach(function(c){
			logLine+=c.month+" "+c.day+" "+c.time+" "+c.host+" "+c.service+" "+c.message+"\n";
		});
	   // res.render('show', {title: "Query Results", logs: logLine});
	} 
    }

    getLogs(query, returnQuery);

    function returnStats(err, stats) {
        if (err) {
            sendStatus(500);
        } else {
            res.send(stats);
        }
    }
    filesCollection.find({}, {content: 0}).toArray(getLogs);
});		*/

 


router.get('/getFileStats', function(req, res) {
    function returnStats(err, stats) {
        if (err) {
            sendStatus(500);
        } else {
            res.send(stats);
        }
    }
    filesCollection.find({}, {content: 0}).toArray(returnStats);
});

router.post("/uploadText", upload.single('theFile'), function(req, res) {
    var theFile = req.file;
    var storedFile;
    var line=[];

    function returnResult(err, result) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.send("Upload succeeded: " + storedFile.name + "\n");
        }
    }
   
    if (theFile) {
        storedFile = {
            name: theFile.originalname,
            size: theFile.size,
            content: theFile.buffer.toString('utf8')
        };
        filesCollection.update({name: theFile.originalname},
                               storedFile,
                               {upsert: true},
                               returnResult);
}
    /* line = theFile.buffer.toString().split("\n");
	for(var i=0;i< line.length;i++)
	{
	if(line[i]!= "")
	{
	lines=line[i].split(/\s+/);
	entry={};
	entry.fileName=theFile.originalname;
	entry.month = lines[0];
	entry.day  =  lines[1];
	entry.time = lines[2];
	entry.host = lines[3];
	entry.service = lines[4].slice(0,-1);
	entry.message = lines.slice(5).join(' ');
	numEn++;
	entries.push(entry);
	}
	
	}
	db.collection('logs').insert(entries,function(err, result) {
    	if (err) {
		throw err;
    	}
 
    	console.log("Inserted the following log record:");
    	console.log(result.ops[0]);
    	res.send("File uploaded succeeded");
    	num++;
		});
    } else {
        res.sendStatus(403);
    }

*/

});

router.post('/analyze',function(req,res)
{
	var searchMessage = new RegExp( req.body.message);
	var searchService  = new RegExp( req.body.service);
	var searchFile = new RegExp( req.body.file);
	var searchMonth = new RegExp( req.body.month);
	var searchDay = new RegExp( req.body.day);
	var type     =   req.body.type;
	console.log(searchMessage);

   
	function returnStats(err, stats) {
        if (err) {
            sendStatus(500);
        } else {
        if((type=="show")||(type=="download"))
   		{
   			var logLine;
			stats.forEach(function(c){
			logLine+=c.month+" "+c.day+" "+c.time+" "+c.host+" "+c.service+" "+c.message+"\n";
			});
            res.send(logLine);

        }
        else if(type=="visualize")
		{

        	res.send(analyzeSelected(stats));
        }
        }
    }
        

    db.collection('logs').find( { service : searchService , message: searchMessage,month : searchMonth, day : searchDay, fileName: searchFile}).toArray(returnStats);
});

router.get('/getFileStats', function(req, res) {
    function returnStats(err, stats) {
    	console.log(stats)
        if (err) {
            sendStatus(500);
        } else {
            res.send(stats);
        }
    }
    
    filesCollection.find({},{content: 0}).toArray(returnStats);
});

router.post("/downloadFile", function (req, res) {
    var name = req.body.downloadFile;

    function returnFile(err, theFile) {
        if (err) {
            res.send("File not found");
        } else {
            res.send(theFile.content);
        }
    }
	filesCollection.findOne({name: name},
                                returnFile);    
    
});

var connectCallback = function(err, returnedDB) {
	if (err) {
		throw err;
	}
	db = returnedDB;
	filesCollection = db.collection('files');
}
mc.connect('mongodb://localhost/log-demo', connectCallback);
//router.post("/uploadText", upload.single('theFile'), uploadLog);
module.exports = router;

