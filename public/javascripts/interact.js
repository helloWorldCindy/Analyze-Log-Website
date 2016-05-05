$(function () {

    var updateButton = $("#updateGraph");
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");
    var myBarChart;
    
    var data = {
        labels: [],
        datasets: [
            {
                label: "Word Frequencies A",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: []
            },
			{
                label: "Word Frequencies B",
                fillColor: "rgba(151,0,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: []
            }
        ]
    };
    
    function wordFreq(words, otherWords) {
        var freq = {};

        words.forEach(function(w) {
            if (w === '') {
                return;
            }
            
            if (freq[w]) {
                freq[w]++;
            } else {
                freq[w] = 1;
            }
        });
		
	if (otherWords){
	    otherWords.forEach(function(w){
		if (w === '')
		    return;
		
		if (!freq[w])
		    freq[w] = 0;
	    });
	}
	
        return freq;
    }

    function freqCompare(a, b) {
        // Notice the comparisons are reversed since we want
        // the most frequent to be in index 0.
        if (a.freq > b.freq)
            return -1;
        else if (a.freq < b.freq)
            return 1;
        else {
	    if (a.word.toLowerCase() < b.word.toLowerCase())
		return -1;
	    if (a.word.toLowerCase() > b.word.toLowerCase())
		return 1;
	    else
		return 0;
        }
    }
    
    function updateGraph() {
        var start = freqMin.val();
        var end = freqMax.val();
	var textA, textB, wordsA, wordsB, freqA, freqB, labels;
	var freqArray, sortedFreq, sortedLabels, sortedValuesA, sortedValuesB;
	
	var sortOrder = $("input:radio[name=sortOrder]:checked").val();
	var caseSensitive = $("input:radio[name=caseSensitive]:checked").val();

    textA = userDataA.val();
	textB = userDataB.val();
    wordsA = textA.split(/\W/);
	wordsB = textB.split(/\W/);	
		
	if (caseSensitive === 'no'){
	    wordsA.forEach(function(word, index){
		wordsA[index] = word.toLowerCase();
	    });
	    
	    wordsB.forEach(function(word, index){
		wordsB[index] = word.toLowerCase();
	    });
	}
	
	freqA = wordFreq(wordsA, wordsB);
	freqB = wordFreq(wordsB, wordsA);
	
	labels = Object.keys(freqA);	
	
	if (sortOrder.indexOf('freq') !== -1){
	    if (sortOrder === 'freqA') {	
		freqArray = labels.map(function(word) {
		    return {word: word, freq: freqA[word]};
		});
	    }
	    else {	
		freqArray = labels.map(function(word) {
		    return {word: word, freq: freqB[word]};
		});
	    }
	    
	    sortedFreq = freqArray.sort(freqCompare);
	    sortedLabels = sortedFreq.map(function(f) {
		return f.word;
	    });	
	} else  /// sortOrder === 'alpha'
	    sortedLabels = labels.sort();
	
	sortedValuesA = sortedLabels.map(function(word) {
	    return freqA[word];
	});
	sortedValuesB = sortedLabels.map(function(word) {
	    return freqB[word];
	});
	
	data.labels = sortedLabels.slice(start, end);
	data.datasets[0].data = sortedValuesA.slice(start, end);
	data.datasets[1].data = sortedValuesB.slice(start, end);
	
	if (myBarChart) {
	    myBarChart.destroy();
	}
	
        myBarChart = new Chart(ctx).Bar(data, {});
    }

    updateButton.click(updateGraph);
    userDataA.val("Please enter the text to analyze here.");
    userDataB.val("Please enter more text to analyze here.");
});
