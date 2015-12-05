'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wwymak on 05/12/2015.
 */

var ukMap = function ukMap() {
    var height = arguments.length <= 0 || arguments[0] === undefined ? 900 : arguments[0];
    var width = arguments.length <= 1 || arguments[1] === undefined ? 900 : arguments[1];
    var scale = arguments.length <= 2 || arguments[2] === undefined ? 4000 : arguments[2];
    var projection = arguments.length <= 3 || arguments[3] === undefined ? d3.geo.albers().center([3.5, 57]).rotate([4.4, 0]).parallels([50, 60]).scale(scale) : arguments[3];
    var viewBox = arguments.length <= 4 || arguments[4] === undefined ? "0 0 400 800" : arguments[4];

    _classCallCheck(this, ukMap);

    this.height = height;
    this.width = width;
};

(function () {
    var q = new queue();
    q.defer('data/a_road_topo.json', d3.json).defer('data/M_road_topo.json', d3.json).defer('data/uk-traffic-counts-2000.csv', d3.csv).defer('data//uk-traffic-counts-2001.json', d3.json).await(function (error, aRoad, bRoad, uk_2000_traffic, uk_2001_traffic) {
        console.log("all done");
    });
})();
//# sourceMappingURL=map.js.map
