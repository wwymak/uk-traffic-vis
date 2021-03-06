/**
 * Created by wwymak on 05/12/2015.
 */

class ukMap {
    constructor(
        {height = 900, width = 900,
        scale = 4000,
        selection = "body",
        projection = d3.geo.albers()
            .center([4.5, 57])
            .rotate([4.4, 0])
            .parallels([50, 60])
            .scale(scale),
        viewBox = "0 0 400 800"} = {}
    ) {
        this.height = height;
        this.width = width;
        this.selection = selection;
        this.projection = projection;
        this.viewBox = viewBox;
    }

    get mapHeight(){
        return this.height;
    }

    mapVis(selection){
        var svg, svgG;


    }
}

/**
 * Class to hold the traffic vol data for a year, plus some basic ops
 */
class mapData {
    constructor(trafficData, {

        } = {}){
        this.trafficData = trafficData;
        this.quantize = d3.scale.quantize().range(d3.range(0.5,2.5,0.15));
    }

    /**
     *
     * @param categoryName -- one of "PedalCycles", "Motorcycles",
     * "CarsTaxis",	"bus", "AllHGVs", "AllMotorVehicles"
     */
    maxValOfCategory(categoryName){
        return  d3.max(this.trafficData, (d) => {
            return d[categoryName];
        });
    }

    minValOfCategory(categoryName){
        return  d3.min(this.trafficData, (d) => {
            return d[categoryName];
        });
    }

    quantizeScale(categoryName){
        return this.quantize.domain([this.minValOfCategory(categoryName), this.maxValOfCategory(categoryName)])
    }
}

(() => {
    var mapSVG = initMap();

    windowResizeHandler();

    var projection = d3.geo.albers()
        .center([12, 57])
        .rotate([10, 0])
        .parallels([50, 60])
        .scale(4300),

        path = d3.geo.path()
            .projection(projection);

    var dataMap = new Map(),
        mapProperties, roadScale;


    queue().defer(d3.json, 'data/a_road_topo.json')
        .defer(d3.json, 'data/M_road_topo.json')
        .defer(d3.csv, 'data/uk-traffic-2000.csv')
        .defer(d3.csv, 'data/uk-traffic-2001.csv')
        .await((error, aRoad, MRoad, uk_2000_traffic, uk_2001_traffic) => {
            console.log("all done");

            mapProperties = new mapData(uk_2000_traffic)
            roadScale = mapProperties.quantizeScale("AllMotorVehicles")

            var maxVal = d3.max(uk_2000_traffic, (d) => {
                return d.AllMotorVehicles
            });

            //quantisation scale for setting thickness of roads
            var quantize = d3.scale.quantize().domain([0, maxVal]).range(d3.range(0.2,2.5,0.15));

            uk_2000_traffic.map((d) => {
                dataMap.set(d.road, {
                    year: +d.year,
                    cycles: +d.PedalCycles,
                    motors: +d.AllMotorVehicles
                })
            });

            console.log(maxVal, uk_2000_traffic)


            var geoData = [topojson.feature(aRoad, aRoad.objects.a_road_trimmed),
                topojson.feature(MRoad,MRoad.objects.M_road_trimmed)
            ];

            var roads = mapSVG.selectAll("g.road").data(geoData)
                .enter().append("g")
                .attr("class", "road")
                .attr("id", (d, i) => {
                    if(i == 0){
                        return "a-road"
                    } else if (i == 1){
                        return "m-road"
                    }
                });

            roads.selectAll("g")
                .data((d) => {
                    console.log(d)
                    return d.features;
                }).enter()
                .append("path")
                .attr("d", path)
                .attr("class", "roadPath")
                .style("stroke", (d, i) =>{
                    //if(i == 0){
                    //    return "orange"
                    //}
                    //if(i == 1){
                    //    return "red"
                    //}
                    return "white"
                }).style("stroke-width", (d, i) => {
                    var roadNumber = d.properties.roadNumber;
                    var valObj = dataMap.get(roadNumber) || {};

                    return roadScale(valObj.motors || 0.2);
                }).on("mouseover", (d,i) => {
                var roadNumber = d.properties.roadNumber;
                var valObj = dataMap.get(roadNumber) || {};
                console.log(roadNumber, valObj)
            });


            /**
             * Update the roadwidth when toggling between viewing the map for
             * @param vehicleType "motors" or "cycles" as per above
             */
            var updateRoadWidth = function(vehicleType = "motors"){
                console.log("click")
                d3.selectAll(".roadPath").style("stroke-width", (d, i) => {
                    var roadNumber = d.properties.roadNumber;
                    var valObj = dataMap.get(roadNumber) || {};

                    return quantize(valObj[vehicleType] || 1);
                })
            }

            var  setBtnClickHandler = function(){
                d3.select("#motorDataSelect").on("click", updateRoadWidth);
                d3.select("#cycleDataSelect").on("click", () =>{updateRoadWidth("cycles")});
            }

            setBtnClickHandler();


        });

    function initMap(){
        var dimen = d3.min([window.innerHeight, window.innerWidth])
        var width = 0.8 * dimen,
            height = dimen;

        return d3.select("#ukMap").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 400 800")
            .attr("preserveAspectRatio", "xMinYMin meet");
    }

    function windowResizeHandler(){
        var resizeTimer;
        d3.select(window).on("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() =>{
                var width = 0.8 * window.innerHeight,
                    height = window.innerHeight;

                mapSVG.attr("width", width).attr("height", height);
            }, 200)
        });
    }





})();