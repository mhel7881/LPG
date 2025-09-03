import { useState } from 'react';
export var useGeolocation = function () {
    var _a = useState(null), position = _a[0], setPosition = _a[1];
    var _b = useState(null), error = _b[0], setError = _b[1];
    var _c = useState(false), loading = _c[0], setLoading = _c[1];
    var getCurrentPosition = function () {
        if (!navigator.geolocation) {
            setError({
                code: 0,
                message: 'Geolocation is not supported by this browser'
            });
            return;
        }
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(function (position) {
            setPosition({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            });
            setLoading(false);
        }, function (error) {
            var message = 'Unknown error occurred';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location access denied by user';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out';
                    break;
            }
            setError({
                code: error.code,
                message: message
            });
            setLoading(false);
        }, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000
        });
    };
    return {
        position: position,
        error: error,
        loading: loading,
        getCurrentPosition: getCurrentPosition
    };
};
export var formatCoordinates = function (position) {
    return "".concat(position.latitude.toFixed(6), ", ").concat(position.longitude.toFixed(6));
};
export var calculateDistance = function (pos1, pos2) {
    var R = 6371; // Earth's radius in kilometers
    var dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    var dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};
