This is basically an experiment to map the UK roads traffic flows and to make a data vis application out of it

all the files under es6_js folder is complied to files in the js folder by babel (Grunt task)

how it works (a lot in my head at the moment...) :
- thickness of the roads correspond to the annual traffic volume 

TODO:

- other linked charts
- map to change with year
- explanation text
- voroni for roads? as in if you click on a road it updates the linked charts with info on that road 
    Only problem is that thinner roads are very hard to tap on
- map zoom?
    
??

- try using angular? for binding to controls
- module pattern? 

Data sources:

- OS open roads data simplified (with QGIS, in https://github.com/wwymak/os-openroads-geodata)
- uk traffic count data parsed (from http://www.dft.gov.uk/traffic-counts/download.php)

Map functioning?
- first screen = intro text on left side, something about vol of traffic
- click on a road, transition to a pane where it shows you stats about that road e.g. vol of traffic from 2000 to 2014
- possible also show accident data? (no data source yet)

Questions:
- vol change of motor traffic (e.g. trucks vs cars etc?)
- busiest roads: see only A roads or only M roads (at the moment the M roads are swamping out all the A road details)
- 