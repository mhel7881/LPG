export var getAuthToken = function () {
    return localStorage.getItem("auth_token");
};
export var setAuthToken = function (token) {
    localStorage.setItem("auth_token", token);
};
export var clearAuthToken = function () {
    localStorage.removeItem("auth_token");
};
export var isAuthenticated = function () {
    return !!getAuthToken();
};
export var getAuthHeaders = function () {
    var token = getAuthToken();
    return token
        ? {
            Authorization: "Bearer ".concat(token),
            "Content-Type": "application/json",
        }
        : {
            "Content-Type": "application/json",
        };
};
