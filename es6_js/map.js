/**
 * Created by wwymak on 05/12/2015.
 */

class ukMap {
    constructor(
        height = 900, width = 900,
        scale = 4000,
        projection = d3.geo.albers()
            .center([3.5, 57])
            .rotate([4.4, 0])
            .parallels([50, 60])
            .scale(scale),
        viewBox = "0 0 400 800"
    ) {
        this.height = height;
        this.width = width;
    }
}


(() => {
    console.log("starting")
    queue().defer(d3.json, 'data/a_road_topo.json')
        .defer(d3.json, 'data/M_road_topo.json')
        .defer(d3.csv, 'data/uk-traffic-counts-2000.csv')
        .defer(d3.csv, 'data//uk-traffic-counts-2001.csv')
        .await((error, aRoad, bRoad, uk_2000_traffic, uk_2001_traffic) => {
            console.log("all done")
        })

})();