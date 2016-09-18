"use strict"

/*
 * When copying out a max patcher, the ordering of the objects changes each time, killing the git history.
 * => hack hack
 *
 */

var fs = require("fs")
var device = JSON.parse(fs.readFileSync("./device.json", "utf8"))

function parseId(idstr) {
	return parseInt(idstr.substr(4))
}

device.boxes.sort((b1, b2) => parseId(b1.box.id) - parseId(b2.box.id))

device.lines.sort((l1, l2) => {
	var p1 = l1.patchline
	var p2 = l2.patchline
	var s = parseId(p1.source[0]) - parseId(p2.source[0])
	if(s) return s
	s = p1.source[1] - p2.source[1]
	if(s) return s
	s = parseId(p1.destination[0]) - parseId(p2.destination[0])
	if(s) return s
	return p1.destination[1] - p2.destination[1]
})


function getTabs(indent) {
	var str = "";
	for(var i=0;i<indent;++i) str += "\t"
	return str
}

function printSorted(obj, indent) {
	var keys = Object.keys(obj).sort()
	var str = getTabs(indent) + "{\n"
	keys.forEach((key, index) => {
		var val = obj[key]
		str += getTabs(indent + 1) + '"' + key + '": '
		if(val instanceof String) str += '"' + val + '"'
		else str += JSON.stringify(val)
		if(index + 1 == keys.length) str += "\n" + getTabs(indent) + "}"
		else str += ",\n"
	})
	return str
}

var outstr = '{\n\t"boxes": [\n';

device.boxes.forEach((box, index) => {
	outstr += '\t\t{ "box":\n' + printSorted(box.box, 3) + "\n\t\t}"
	if(index + 1 != device.boxes.length) outstr += ",\n"
})
outstr += '\n\t],\n\t"lines": [\n';

device.lines.forEach((line, index) => {
	outstr += '\t\t{ "patchline":\n' + printSorted(line.patchline, 3) + "\n\t\t}"
	if(index + 1 != device.lines.length) outstr += ",\n"
})

outstr += '\n\t\],\n\t"appversion":\n' + printSorted(device.appversion, 2) + "\n}\n"

fs.writeFileSync("./device.json", outstr)