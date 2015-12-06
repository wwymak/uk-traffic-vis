"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

(function () {
    var mapSVG = initMap();

    var projection = d3.geo.albers().center([12, 57]).rotate([10, 0]).parallels([50, 60]).scale(3500),
        path = d3.geo.path().projection(projection);

    var dataMap = new Map();

    queue().defer(d3.json, 'data/a_road_topo.json').defer(d3.json, 'data/M_road_topo.json').defer(d3.csv, 'data/uk-traffic-2000.csv').defer(d3.csv, 'data//uk-traffic-counts-2001.csv').await(function (error, aRoad, MRoad, uk_2000_traffic, uk_2001_traffic) {
        console.log("all done");

        var maxVal = d3.max(uk_2000_traffic, function (d) {
            return d.AllMotorVehicles;
        });

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

        var roads = mapSVG.selectAll("g.road").data(geoData).enter().append("g").attr("class", "road");

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

            return quantize(valObj.motors || 1);
        }).on("mouseover", function (d, i) {
            var roadNumber = d.properties.roadNumber;
            var valObj = dataMap.get(roadNumber) || {};
            console.log(roadNumber, valObj);
        });
    });

    function initMap() {
        var width = 700,
            height = 900;

        return d3.select("#ukMap").append("svg").attr("width", width).attr("height", height).attr("viewBox", "0 0 400 800").attr("preserveAspectRatio", "xMinYMin meet");
    }
})();
//# sourceMappingURL=map.js.map
