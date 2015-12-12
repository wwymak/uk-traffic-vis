"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wwymak on 05/12/2015.
 */

var ukMap = (function () {
    function ukMap() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$height = _ref.height;
        var height = _ref$height === undefined ? 900 : _ref$height;
        var _ref$width = _ref.width;
        var width = _ref$width === undefined ? 900 : _ref$width;
        var _ref$scale = _ref.scale;
        var scale = _ref$scale === undefined ? 4000 : _ref$scale;
        var _ref$selection = _ref.selection;
        var selection = _ref$selection === undefined ? "body" : _ref$selection;
        var _ref$projection = _ref.projection;
        var projection = _ref$projection === undefined ? d3.geo.albers().center([4.5, 57]).rotate([4.4, 0]).parallels([50, 60]).scale(scale) : _ref$projection;
        var _ref$viewBox = _ref.viewBox;
        var viewBox = _ref$viewBox === undefined ? "0 0 400 800" : _ref$viewBox;

        _classCallCheck(this, ukMap);

        this.height = height;
        this.width = width;
        this.selection = selection;
        this.projection = projection;
        this.viewBox = viewBox;
    }

    _createClass(ukMap, [{
        key: "mapVis",
        value: function mapVis(selection) {
            var svg, svgG;
        }
    }, {
        key: "mapHeight",
        get: function get() {
            return this.height;
        }
    }]);

    return ukMap;
})();

/**
 * Class to hold the traffic vol data for a year, plus some basic ops
 */

var mapData = (function () {
    function mapData(trafficData) {
        var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _objectDestructuringEmpty(_ref2);

        _classCallCheck(this, mapData);

        this.trafficData = trafficData;
        this.quantize = d3.scale.quantize().range(d3.range(0.5, 2.5, 0.15));
    }

    /**
     *
     * @param categoryName -- one of "PedalCycles", "Motorcycles",
     * "CarsTaxis",	"bus", "AllHGVs", "AllMotorVehicles"
     */

    _createClass(mapData, [{
        key: "maxValOfCategory",
        value: function maxValOfCategory(categoryName) {
            return d3.max(this.trafficData, function (d) {
                return d[categoryName];
            });
        }
    }, {
        key: "minValOfCategory",
        value: function minValOfCategory(categoryName) {
            return d3.min(this.trafficData, function (d) {
                return d[categoryName];
            });
        }
    }, {
        key: "quantizeScale",
        value: function quantizeScale(categoryName) {
            return this.quantize.domain([this.minValOfCategory(categoryName), this.maxValOfCategory(categoryName)]);
        }
    }]);

    return mapData;
})();

(function () {
    var mapSVG = initMap();

    windowResizeHandler();

    var projection = d3.geo.albers().center([12, 57]).rotate([10, 0]).parallels([50, 60]).scale(4300),
        path = d3.geo.path().projection(projection);

    var dataMap = new Map(),
        mapProperties,
        roadScale;

    queue().defer(d3.json, 'data/a_road_topo.json').defer(d3.json, 'data/M_road_topo.json').defer(d3.csv, 'data/uk-traffic-2000.csv').defer(d3.csv, 'data/uk-traffic-2001.csv').await(function (error, aRoad, MRoad, uk_2000_traffic, uk_2001_traffic) {
        console.log("all done");

        mapProperties = new mapData(uk_2000_traffic);
        roadScale = mapProperties.quantizeScale("AllMotorVehicles");

        var maxVal = d3.max(uk_2000_traffic, function (d) {
            return d.AllMotorVehicles;
        });

        //quantisation scale for setting thickness of roads
        var quantize = d3.scale.quantize().domain([0, maxVal]).range(d3.range(0.2, 2.5, 0.15));

        uk_2000_traffic.map(function (d) {
            dataMap.set(d.road, {
                year: +d.year,
                cycles: +d.PedalCycles,
                motors: +d.AllMotorVehicles
            });
        });

        console.log(maxVal, uk_2000_traffic);

        var geoData = [topojson.feature(aRoad, aRoad.objects.a_road_trimmed), topojson.feature(MRoad, MRoad.objects.M_road_trimmed)];

        var roads = mapSVG.selectAll("g.road").data(geoData).enter().append("g").attr("class", "road").attr("id", function (d, i) {
            if (i == 0) {
                return "a-road";
            } else if (i == 1) {
                return "m-road";
            }
        });

        roads.selectAll("g").data(function (d) {
            console.log(d);
            return d.features;
        }).enter().append("path").attr("d", path).attr("class", "roadPath").style("stroke", function (d, i) {
            //if(i == 0){
            //    return "orange"
            //}
            //if(i == 1){
            //    return "red"
            //}
            return "white";
        }).style("stroke-width", function (d, i) {
            var roadNumber = d.properties.roadNumber;
            var valObj = dataMap.get(roadNumber) || {};

            return roadScale(valObj.motors || 0.2);
        }).on("mouseover", function (d, i) {
            var roadNumber = d.properties.roadNumber;
            var valObj = dataMap.get(roadNumber) || {};
            console.log(roadNumber, valObj);
        });

        /**
         * Update the roadwidth when toggling between viewing the map for
         * @param vehicleType "motors" or "cycles" as per above
         */
        var updateRoadWidth = function updateRoadWidth() {
            var vehicleType = arguments.length <= 0 || arguments[0] === undefined ? "motors" : arguments[0];

            console.log("click");
            d3.selectAll(".roadPath").style("stroke-width", function (d, i) {
                var roadNumber = d.properties.roadNumber;
                var valObj = dataMap.get(roadNumber) || {};

                return quantize(valObj[vehicleType] || 1);
            });
        };

        var setBtnClickHandler = function setBtnClickHandler() {
            d3.select("#motorDataSelect").on("click", updateRoadWidth);
            d3.select("#cycleDataSelect").on("click", function () {
                updateRoadWidth("cycles");
            });
        };

        setBtnClickHandler();
    });

    function initMap() {
        var dimen = d3.min([window.innerHeight, window.innerWidth]);
        var width = 0.8 * dimen,
            height = dimen;

        return d3.select("#ukMap").append("svg").attr("width", width).attr("height", height).attr("viewBox", "0 0 400 800").attr("preserveAspectRatio", "xMinYMin meet");
    }

    function windowResizeHandler() {
        var resizeTimer;
        d3.select(window).on("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var width = 0.8 * window.innerHeight,
                    height = window.innerHeight;

                mapSVG.attr("width", width).attr("height", height);
            }, 200);
        });
    }
})();
//# sourceMappingURL=map.js.map
