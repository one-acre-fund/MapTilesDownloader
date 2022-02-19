let mapView;

$(function() {

	let map = null;
	let draw = null;
	let geocoder = null;
	let bar = null;

	let cancellationToken = null;
	let requests = [];

	let sources = [
    {
      name: "Open Street Maps",
      url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
		{
      name: "Open Cycle Maps",
      url: "http://a.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
    },
		{
      name: "Open PT Transport",
      url: "http://openptmap.org/tiles/{z}/{x}/{y}.png",
    },
		{
      name: "CyclOSM",
      url: "https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    },
    
		{
      name: "div-2",
      url: "",
    },

    {
      name: "Google Maps",
      url: "https://mt0.google.com/vt?lyrs=m&x={x}&s=&y={y}&z={z}",
    },
		{
      name: "Google Maps Satellite",
      url: "https://mt0.google.com/vt?lyrs=s&x={x}&s=&y={y}&z={z}",
    },
		{
      name: "Google Maps Hybrid",
      url: "https://mt0.google.com/vt?lyrs=h&x={x}&s=&y={y}&z={z}",
    },
		{
      name: "Google Maps Terrain",
      url: "https://mt0.google.com/vt?lyrs=p&x={x}&s=&y={y}&z={z}",
    },

		{
      name: "div-3",
      url: "",
    },
    {
      name: "MapBox Streets",
      url: "http://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    },
		{
      name: "MapBox Satellite",
      url: "http://api.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    },
		{
      name: "div-4",
      url: "",
    },

		{
      name: "ESRI World Imagery",
      url: "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
		{
      name: "Wikimedia Maps",
      url: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png",
    },
		{
      name: "NASA GIBS",
      url: "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
    },
		
		{
      name: "div-5",
      url: "",
    },
		{
      name: "Carto Light",
      url: "http://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    },
		{
      name: "Stamen Toner B&W",
      url: "http://a.tile.stamen.com/toner/{z}/{x}/{y}.png",
    },
		{
      name: "Stamen Water Color",
      url: "http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.png",
    },		
		{
      name: "div-6",
      url: "",
    },
		{
      name: "Mapnik No Labels",
      url: "https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png",
    },
		{
      name: "Hillshading",
      url: "http://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png",
    },
		{
      name: "Mapnik Black/White",
      url: "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
    },
		{
      name: "Thunderforest Landscape",
      url: "http://tile.thunderforest.com/landscape/{z}/{x}/{y}.png",
    },
  ];

	function initializeMap() {

		mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpYXNocmFmIiwiYSI6ImNqdXl5MHV5YTAzNXI0NG51OWFuMGp4enQifQ.zpd2gZFwBTRqiapp1yci9g';
    const mb_sources = {};
    sources.forEach(function(source) {
      if(source.url) {
        mb_sources[source.name] = {
          type: 'raster',
          tiles: [
            source.url,
          ]
        };
      }
    });

		map = new mapboxgl.Map({
			container: 'map-view',
			center: [15,0],
			zoom: 3,
      style: {
        version: 8,
        sources: mb_sources,
        layers: [
          {
            id: 'tiles',
            type: 'raster',
            source: sources[0].name,
          },
          // fake invisible layer to use as a constant id for layer ordering
          {
            id: 'base',
            type: 'background',
            layout: {
              visibility: 'none',
            },
          },
        ]
      },
    });

		geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken });
		map.addControl(geocoder);
    map.addControl(new mapboxgl.GeolocateControl());
    map.addControl(new mapboxgl.ScaleControl());

    map.on('zoomend', () => {
      $('#zoom-level').text('Zoom: ' + map.getZoom().toFixed(0));
    });
	}

	function initializeMaterialize() {
		$('select').formSelect();
		$('.dropdown-trigger').dropdown({
			constrainWidth: false,
		});
	}

	function initializeSources() {

		let dropdown = $("#sources");

		for(let source of sources) {
      let name = source['name']
			let url = source['url'];

			if(url == "") {
				dropdown.append("<hr/>");
				continue;
			}

			let item = $("<li><a></a></li>");
			item.attr("data-url", url);
			item.find("a").text(name);

			item.click(function() {
				let url = $(this).attr("data-url");
				$("#source-box").val(url);
        if(map) {
          if (map.getLayer('tiles')) map.removeLayer('tiles');
          map.addLayer({
            id: 'tiles',
            type: 'raster',
            source: $(this).find("a").text(),
          }, 'base');
        }
			})

			dropdown.append(item);
		}
	}

	function initializeSearch() {
		$("#search-form").submit(function(e) {
			let location = $("#location-box").val();
			geocoder.query(location);

			e.preventDefault();
		})
	}

	function initializeMoreOptions() {

		$("#more-options-toggle").click(function() {
			$("#more-options").toggle();
		})

		let outputFileBox = $("#output-file-box")
		$("#output-type").change(function() {
			let outputType = $("#output-type").val();
			if(outputType == "mbtiles") {
				outputFileBox.val("tiles.mbtiles")
			} else if(outputType == "repo") {
				outputFileBox.val("tiles.repo")
			} else if(outputType == "directory") {
				outputFileBox.val("{z}/{x}/{y}.png")
			}
		})

	}

	function initializeRectangleTool() {
		
		let modes = MapboxDraw.modes;
		modes.draw_rectangle = DrawRectangle.default;

		draw = new MapboxDraw({
			modes: modes
		});
		map.addControl(draw);

		map.on('draw.create', function (e) {
			M.Toast.dismissAll();
		});

		$("#rectangle-draw-button").click(function() {
			startDrawing();
		})

	}

	function startDrawing() {
		removeGrid();
		draw.deleteAll();
		draw.changeMode('draw_rectangle');

		M.Toast.dismissAll();
		M.toast({html: 'Click two points on the map to make a rectangle.', displayLength: 7000})
	}

	function initializeGridPreview() {
		$("#grid-preview-button").click(previewGrid);

		map.on('click', showTilePopup);
	}

	function showTilePopup(e) {

		if(!e.originalEvent.ctrlKey) {
			return;
		}

		let maxZoom = getMaxZoom();

		let x = lat2tile(e.lngLat.lat, maxZoom);
		let y = long2tile(e.lngLat.lng, maxZoom);

		let content = "X, Y, Z<br/><b>" + x + ", " + y + ", " + maxZoom + "</b><hr/>";
		content += "Lat, Lng<br/><b>" + e.lngLat.lat + ", " + e.lngLat.lng + "</b>";

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(content)
            .addTo(map);

        console.log(e.lngLat)
	}

	function long2tile(lon,zoom) {
		return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
	}

	function lat2tile(lat,zoom)  {
		return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
	}

	function tile2long(x,z) {
		return (x/Math.pow(2,z)*360-180);
	}

	function tile2lat(y,z) {
		let n=Math.PI-2*Math.PI*y/Math.pow(2,z);
		return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	}

	function getTileRect(x, y, zoom) {

		let c1 = new mapboxgl.LngLat(tile2long(x, zoom), tile2lat(y, zoom));
		let c2 = new mapboxgl.LngLat(tile2long(x + 1, zoom), tile2lat(y + 1, zoom));

		return new mapboxgl.LngLatBounds(c1, c2);
	}

	function getMinZoom() {
		return Math.min(parseInt($("#zoom-from-box").val()), parseInt($("#zoom-to-box").val()));
	}

	function getMaxZoom() {
		return Math.max(parseInt($("#zoom-from-box").val()), parseInt($("#zoom-to-box").val()));
	}

	function getArrayByBounds(bounds) {

		return [
			[ bounds.getSouthWest().lng, bounds.getNorthEast().lat ],
			[ bounds.getNorthEast().lng, bounds.getNorthEast().lat ],
			[ bounds.getNorthEast().lng, bounds.getSouthWest().lat ],
			[ bounds.getSouthWest().lng, bounds.getSouthWest().lat ],
			[ bounds.getSouthWest().lng, bounds.getNorthEast().lat ],
		];
	}

	function getPolygonByBounds(bounds) {

		let tilePolygonData = getArrayByBounds(bounds);

		return turf.polygon([tilePolygonData]);
	}

	function isTileInSelection(tileRect) {

		let polygon = getPolygonByBounds(tileRect);

		let areaPolygon = draw.getAll().features[0];

		if(! turf.booleanDisjoint(polygon, areaPolygon)) {
			return true;
		}

		return false;
	}

	function getBounds() {

		let coordinates = draw.getAll().features[0].geometry.coordinates[0];

		return coordinates.reduce(function(bounds, coord) {
			return bounds.extend(coord);
		}, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
  }

	function getGrid(zoomLevel) {

		let bounds = getBounds();

		let rects = [];

		let thisZoom = zoomLevel

		let TY    = lat2tile(bounds.getNorthEast().lat, thisZoom);
		let LX   = long2tile(bounds.getSouthWest().lng, thisZoom);
		let BY = lat2tile(bounds.getSouthWest().lat, thisZoom);
		let RX  = long2tile(bounds.getNorthEast().lng, thisZoom);

		for(let y = TY; y <= BY; y++) {
			for(let x = LX; x <= RX; x++) {

				let rect = getTileRect(x, y, thisZoom);

				if(isTileInSelection(rect)) {
					rects.push({
						x: x,
						y: y,
						z: thisZoom,
						rect: rect,
					});
				}

			}
		}

		return rects
	}

	function getAllGridTiles() {
		let allTiles = [];

		for(let z = getMinZoom(); z <= getMaxZoom(); z++) {
			let grid = getGrid(z);
			// TODO shuffle grid via a heuristic (hamlet curve? :/)
			allTiles = allTiles.concat(grid);
		}

		return allTiles;
	}

	function removeGrid() {
		removeLayer("grid-preview");
	}

	function previewGrid() {

		let maxZoom = getMaxZoom();
		let grid = getGrid(maxZoom);

		let pointsCollection = []

		for(let i in grid) {
			let feature = grid[i];
			let array = getArrayByBounds(feature.rect);
			pointsCollection.push(array);
		}

		removeGrid();

		map.addLayer({
			'id': "grid-preview",
			'type': 'line',
			'source': {
				'type': 'geojson',
				'data': turf.polygon(pointsCollection),
			},
			'layout': {},
			'paint': {
				"line-color": "#fa8231",
				"line-width": 3,
			}
		});

		let totalTiles = getAllGridTiles().length;
		M.toast({html: 'Total ' + totalTiles.toLocaleString() + ' tiles in the region.', displayLength: 5000})

	}

	function previewRect(rectInfo) {

		let array = getArrayByBounds(rectInfo.rect);

		let id = "temp-" + rectInfo.x + '-' + rectInfo.y + '-' + rectInfo.z;

		map.addLayer({
			'id': id,
			'type': 'line',
			'source': {
				'type': 'geojson',
				'data': turf.polygon([array]),
			},
			'layout': {},
			'paint': {
				"line-color": "#ff9f1a",
				"line-width": 3,
			}
		});

		return id;
	}

	function removeLayer(id) {
		if(map.getSource(id) != null) {
			map.removeLayer(id);
			map.removeSource(id);
		}
	}

	function generateQuadKey(x, y, z) {
    let quadKey = [];
    for (let i = z; i > 0; i--) {
      let digit = '0';
      let mask = 1 << (i - 1);
      if ((x & mask) != 0) {
        digit++;
      }
      if ((y & mask) != 0) {
        digit++;
        digit++;
      }
      quadKey.push(digit);
    }
    return quadKey.join('');
	}

	function initializeDownloader() {

		bar = new ProgressBar.Circle($('#progress-radial').get(0), {
			strokeWidth: 12,
			easing: 'easeOut',
			duration: 200,
			trailColor: '#eee',
			trailWidth: 1,
			from: {color: '#0fb9b1', a:0},
			to: {color: '#20bf6b', a:1},
			svgStyle: null,
			step: function(state, circle) {
				circle.path.setAttribute('stroke', state.color);
			}
		});

		$("#download-button").click(startDownloading)
		$("#stop-button").click(stopDownloading)
	}

	function showTinyTile(base64) {
		let currentImages = $(".tile-strip img");

		for(let i = 4; i < currentImages.length; i++) {
			$(currentImages[i]).remove();
		}

		let image = $("<img/>").attr('src', "data:image/png;base64, " + base64)

		let strip = $(".tile-strip");
		strip.prepend(image)
	}

	async function startDownloading() {

		if(draw.getAll().features.length == 0) {
			M.toast({html: 'You need to select a region first.', displayLength: 3000})
			return;
		}

		cancellationToken = false; 
		requests = [];

		$("#main-sidebar").hide();
		$("#download-sidebar").show();
		$(".tile-strip").html("");
		$("#stop-button").html("STOP");
		removeGrid();
		clearLogs();
		M.Toast.dismissAll();

		let timestamp = new Date().toISOString().replace(/[^\w]/,'_');

		let allTiles = getAllGridTiles();
		updateProgress(0, allTiles.length);

		let numThreads = parseInt($("#parallel-threads-box").val());
		let outputDirectory = $("#output-directory-box").val();
		let outputFile = $("#output-file-box").val();
		let outputType = $("#output-type").val();
		let outputScale = $("#output-scale").val();
		let source = $("#source-box").val()

		let bounds = getBounds();
		let boundsArray = [bounds.getSouthWest().lng, bounds.getSouthWest().lat, bounds.getNorthEast().lng, bounds.getNorthEast().lat]
		let centerArray = [bounds.getCenter().lng, bounds.getCenter().lat, getMaxZoom()]
		
		let data = new FormData();
		data.append('minZoom', getMinZoom())
		data.append('maxZoom', getMaxZoom())
		data.append('outputDirectory', outputDirectory)
		data.append('outputFile', outputFile)
		data.append('outputType', outputType)
		data.append('outputScale', outputScale)
		data.append('source', source)
		data.append('timestamp', timestamp)
		data.append('bounds', boundsArray.join(","))
		data.append('center', centerArray.join(","))

		await $.ajax({
			url: "/start-download",
			async: true,
			timeout: 30 * 1000,
			type: "post",
			contentType: false,
			processData: false,
			data: data,
			dataType: 'json',
		})

		let i = 0;
		async.eachLimit(allTiles, numThreads, function(item, done) {

			if(cancellationToken) {
				return;
			}

			let boxLayer = previewRect(item);

			let url = "/download-tile";

			let data = new FormData();
			data.append('x', item.x)
			data.append('y', item.y)
			data.append('z', item.z)
			data.append('quad', generateQuadKey(item.x, item.y, item.z))
			data.append('outputDirectory', outputDirectory)
			data.append('outputFile', outputFile)
			data.append('outputType', outputType)
			data.append('outputScale', outputScale)
			data.append('timestamp', timestamp)
			data.append('source', source)
			data.append('bounds', boundsArray.join(","))
			data.append('center', centerArray.join(","))

			let request = $.ajax({
				"url": url,
				async: true,
				timeout: 30 * 1000,
				type: "post",
        contentType: false,
        processData: false,
				data: data,
				dataType: 'json',
			}).done(function(data) {

				if(cancellationToken) {
					return;
				}

				if(data.code == 200) {
					showTinyTile(data.image)
					logItem(item.x, item.y, item.z, data.message);
				} else {
					logItem(item.x, item.y, item.z, data.code + " Error downloading tile");
				}

			}).fail(function(data, textStatus, errorThrown) {

				if(cancellationToken) {
					return;
				}

				logItem(item.x, item.y, item.z, "Error while relaying tile");
				//allTiles.push(item);

			}).always(function(data) {
				i++;

				removeLayer(boxLayer);
				updateProgress(i, allTiles.length);

				done();
				
				if(cancellationToken) {
					return;
				}
			});

			requests.push(request);

		}, async function(err) {

			await $.ajax({
				url: "/end-download",
				async: true,
				timeout: 30 * 1000,
				type: "post",
				contentType: false,
				processData: false,
				data: data,
				dataType: 'json',
			})

			updateProgress(allTiles.length, allTiles.length);
			logItemRaw("All requests are done");

			$("#stop-button").html("FINISH");
		});

	}

	function updateProgress(value, total) {
		let progress = value / total;

		bar.animate(progress);
		bar.setText(Math.round(progress * 100) + '<span>%</span>');

		$("#progress-subtitle").html(value.toLocaleString() + " <span>out of</span> " + total.toLocaleString())
	}

	function logItem(x, y, z, text) {
		logItemRaw(x + ',' + y + ',' + z + ' : ' + text)
	}

	function logItemRaw(text) {

		let logger = $('#log-view');
		logger.val(logger.val() + '\n' + text);

		logger.scrollTop(logger[0].scrollHeight);
	}

	function clearLogs() {
		let logger = $('#log-view');
		logger.val('');
	}

	function stopDownloading() {
		cancellationToken = true;

		for(const request of requests) {
			try {
				request.abort();
			} catch(e) {

			}
		}

		$("#main-sidebar").show();
		$("#download-sidebar").hide();
		removeGrid();
		clearLogs();

	}

	initializeMaterialize();
	initializeSources();
	initializeMap();
	initializeSearch();
	initializeRectangleTool();
	initializeGridPreview();
	initializeMoreOptions();
	initializeDownloader();
});