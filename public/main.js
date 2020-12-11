if (
	document.location.host.split(':')[0] == 'localhost' ||
	document.location.host.split(':')[0] == '127.0.0.1' ||
	document.location.host.split(':')[0] == '0.0.0.0'
) {
	document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')
}

