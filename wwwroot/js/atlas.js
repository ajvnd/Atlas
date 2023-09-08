makePostCall = function (url, data, success, error) {
    var json_data = JSON.stringify(data);

    return $.ajax({
        type: "POST",
        url: url,
        data: json_data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: success,
        error: error
    });
}

makeGetCall = function (url, success, error) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: success,
        error: error
    });
}

makeFormCall = function (url, data, success, error) {
    return $.ajax({
        type: "POST",
        url: url,
        data: data,
        contentType: false,
        processData: false,
        success: success,
        error: error
    });
}

//#region Devextreme Util
devextremeLoadCall = function (url, options, values) {
    const deferred = $.Deferred();
    makePostCall(url, values, (result) => {
        deferred.resolve(result);
    }, () => {
        deferred.reject();
    })
    return deferred.promise();
}

devextremeAddCall = function (url, values) {
    const deferred = $.Deferred();
    makePostCall(url, values, (f) => {
        deferred.resolve();
    }, (e) => {
        deferred.reject(e.responseText);
    })
    return deferred.promise();
}

devextremeUpdateCall = function (url, key, values) {
    const deferred = $.Deferred();
    makePostCall(url + key, values, () => {
        deferred.resolve();
    }, (e) => {
        deferred.reject(e.responseText);
    })
    return deferred.promise();
}

devextremeRemoveCall = function (url, key) {
    const deferred = $.Deferred();
    makeGetCall(url + key, () => {
        deferred.resolve();
    }, (e) => {
        deferred.reject(e.responseText);
    })
    return deferred.promise();
}

devextremeByKeyCall = function (url, key) {
    const deferred = $.Deferred();
    makeGetCall(url + key, (result) => {
        deferred.resolve(result);
    }, () => {
        deferred.reject();
    })
    return deferred.promise();
}

//#endregion 