#!/usr/bin/env python
'''
    Open 'metadata.json' file from:
    1. Last created directory at ./output dir
    2. User defined directory at ./output dir
    generate index.html and open it in web browser
'''

import json
import webbrowser
import os
import sys


path = './output'
file_name = 'metadata.json'

print('-' * 40)

if len(sys.argv) > 1:
	path = path + '/' + sys.argv[1]
	print('Parameter ', sys.argv[1], 'found.\nTry to open file at directory:', path)
	
else:
	files_and_dirs = [os.path.join(path, name) for name in os.listdir(path)]
	dirs = [name for name in files_and_dirs if os.path.isdir(name)]
	path = max(dirs, key=os.path.getctime)
	path = path.replace('\\', '/')
	print('No parameter found.\nUse the last created directory:', path)
	
path += '/' 

try:
	with open(path + 'metadata.json') as f:
		json_file = json.load(f)

	max_zoom = str(json_file['maxzoom'])
	map_center = json_file['center'].split(',')
	lat = map_center[1] 
	lng = map_center[0]

	# generate html page and open webbrowser
	html = open('open_map.html', 'w')
	html.write('<!DOCTYPE html><html><head>\n')
	html.write('<title>Offline Map</title><meta charset="utf-8" />\n')
	html.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
	html.write('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" /><style>#map {height: 100%;}html, body {height: 100%;margin: 0;padding: 0;}</style>\n')
	html.write('<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" ></script></head><body>\n')
	html.write('<div id="map"></div>\n')
	html.write('<script>var map = L.map("map").setView(['+ lat + ',' + lng + '], 0);\n')
	html.write('L.tileLayer("' + path + '{z}/{x}/{y}.png", {maxZoom: ' + max_zoom + '}).addTo(map);\n')
	html.write('L.control.scale().addTo(map);\n')
	html.write('var ZoomViewer = L.Control.extend({onAdd: function(){var gauge = L.DomUtil.create("div");\n')
	html.write('gauge.style.width = "200px";gauge.style.background = "rgba(255,255,255,0.5)";\n')
	html.write('gauge.style.textAlign = "left";map.on("zoomstart zoom zoomend", function(ev){\n')
	html.write('gauge.innerHTML = "Zoom level: " + map.getZoom();});return gauge;}});\n')
	html.write('(new ZoomViewer).addTo(map);\n')
	html.write('map.setZoom(' + max_zoom + ');\n')
	html.write('</script></body></html>')
	html.close()
	print("\nOpen web browser with Offline Map ...")
	webbrowser.open("file://" + os.path.realpath('open_map.html'))

except FileNotFoundError as e:
	print(e) 
