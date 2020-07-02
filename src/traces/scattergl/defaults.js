/**
* Copyright 2012-2020, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../lib');
var Registry = require('../../registry');

var helpers = require('./helpers');
var attributes = require('./attributes');
var constants = require('../scatter/constants');
var subTypes = require('../scatter/subtypes');
var handleXYDefaults = require('../scatter/xy_defaults');
var handleMarkerDefaults = require('../scatter/marker_defaults');
var handleLineDefaults = require('../scatter/line_defaults');
var handleFillColorDefaults = require('../scatter/fillcolor_defaults');
var handleTextDefaults = require('../scatter/text_defaults');

module.exports = function supplyDefaults(gd, traceIn, traceOut, defaultColor, layout) {
    function coerce(attr, dflt) {
        return Lib.coerce(traceIn, traceOut, attributes, attr, dflt);
    }

    var isOpen = traceIn.marker ? helpers.isOpenSymbol(traceIn.marker.symbol) : false;
    var isBubble = subTypes.isBubble(traceIn);

    var len = handleXYDefaults(gd, traceIn, traceOut, layout, coerce);
    if(!len) {
        traceOut.visible = false;
        return;
    }
    var defaultMode = len < constants.PTS_LINESONLY ? 'lines+markers' : 'lines';

    coerce('text');
    coerce('hovertext');
    coerce('hovertemplate');
    coerce('mode', defaultMode);

    if(subTypes.hasLines(traceOut)) {
        coerce('connectgaps');
        handleLineDefaults(gd, traceIn, traceOut, defaultColor, layout, coerce);
        coerce('line.shape');
    }

    if(subTypes.hasMarkers(traceOut)) {
        handleMarkerDefaults(gd, traceIn, traceOut, defaultColor, layout, coerce);
        coerce('marker.line.width', isOpen || isBubble ? 1 : 0);
    }

    if(subTypes.hasText(traceOut)) {
        coerce('texttemplate');
        handleTextDefaults(gd, traceIn, traceOut, layout, coerce);
    }

    var lineColor = (traceOut.line || {}).color;
    var markerColor = (traceOut.marker || {}).color;

    coerce('fill');
    if(traceOut.fill !== 'none') {
        handleFillColorDefaults(gd, traceIn, traceOut, defaultColor, coerce);
    }

    var errorBarsSupplyDefaults = Registry.getComponentMethod('errorbars', 'supplyDefaults');
    errorBarsSupplyDefaults(gd, traceIn, traceOut, lineColor || markerColor || defaultColor, {axis: 'y'});
    errorBarsSupplyDefaults(gd, traceIn, traceOut, lineColor || markerColor || defaultColor, {axis: 'x', inherit: 'y'});

    Lib.coerceSelectionMarkerOpacity(traceOut, coerce);
};
