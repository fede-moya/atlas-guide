'use strict';

const path = require('path');
const format = require(path.join(__dirname, '../utils/format'));
const formatBytes = format.bytes;

function dataUri(background, backgroundImage, fontFaces) {
    const props = [].concat(background).concat(backgroundImage).concat(fontFaces.src);
    const dataUri = {
        'total': {
            raw: 0,
            fmt: 0
        },
        'data': []
        // nice to have selectors here
    };

    props.forEach(value => {
        if (/data:/g.test(value)) {
            const uriString = /\((.*?)\)/.exec(value)[1];
            const size = Buffer.byteLength(uriString, 'utf8');
            dataUri.data.push({
                sizeRaw: size,
                size: formatBytes(size),
                type: /data:(.*?)\//.exec(uriString)[1],
                typeRaw: /data:(.*?),/.exec(uriString)[1],
                displayValue: /data:image/.test(uriString) ? uriString : ''
            });
        }
    });

    dataUri.data.sort((a, b) => b.sizeRaw - a.sizeRaw);

    dataUri.data.forEach(item => dataUri.total.raw += item.sizeRaw);
    dataUri.total.fmt = formatBytes(dataUri.total.raw);

    return dataUri;
}

module.exports = dataUri;
