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
devextremeLoadCall = function (url, options, isRemote) {
    const deferred = $.Deferred();
    makePostCall(url, options, (result) => {
        if (isRemote) {
            deferred.resolve(result.data, {totalCount: result.totalCount});
        } else {
            deferred.resolve(result);
        }
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

devextremeUpdateCall = function (url, values) {
    const deferred = $.Deferred();
    makePostCall(url, values, () => {
        deferred.resolve();
    }, (e) => {
        deferred.reject(e.responseText);
    })
    return deferred.promise();
}

devextremeRemoveCall = function (url) {
    const deferred = $.Deferred();
    makeGetCall(url, () => {
        deferred.resolve();
    }, (e) => {
        deferred.reject(e.responseText);
    })
    return deferred.promise();
}

devextremeByKeyCall = function (url) {
    const deferred = $.Deferred();
    makeGetCall(url, (result) => {
        deferred.resolve(result);
    }, () => {
        deferred.reject();
    })
    return deferred.promise();
}

//#endregion 