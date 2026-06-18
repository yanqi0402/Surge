var args = parseArguments(typeof $argument === "string" ? $argument : "");
var defaultsUrl = args["defaults-url"] || args.defaultsUrl || "";
var groupFilter = parseGroups(args.groups);

if (!defaultsUrl || defaultsUrl.indexOf("{{") !== -1) {
  finish("Group Default Import", "Missing defaults URL. Refresh the managed profile from the Worker first.", "error");
} else {
  importSelections();
}

function importSelections() {
  $httpClient.get(
    {
      url: withCacheBust(defaultsUrl),
      headers: {
        Accept: "application/json"
      },
      timeout: 20
    },
    function (error, response, data) {
      if (error) {
        finish("Group Default Import", "Download failed: " + error, "error");
        return;
      }

      var status = response && response.status;
      if (!status || status < 200 || status >= 300) {
        finish("Group Default Import", "Download failed: HTTP " + status, "error");
        return;
      }

      var defaults = parseJson(data);
      if (!defaults || !defaults.selections || typeof defaults.selections !== "object") {
        finish("Group Default Import", "defaults.json has no selections object.", "error");
        return;
      }

      var selections = filterSelections(defaults.selections, groupFilter);
      var groupNames = Object.keys(selections);
      if (groupNames.length === 0) {
        finish("Group Default Import", "No selections to import.", "error");
        return;
      }

      applySelections(groupNames, selections, function (applied, failed) {
        var detail = "Applied " + applied.length + " select group selections.";
        if (failed.length > 0) {
          detail += "\nFailed: " + failed.join(", ");
        }

        notify("Surge group selections imported", detail);
        finish("Group Default Import", detail, failed.length > 0 ? "alert" : "good");
      });
    }
  );
}

function applySelections(groupNames, selections, callback) {
  var applied = [];
  var failed = [];
  var index = 0;

  function next() {
    if (index >= groupNames.length) {
      callback(applied, failed);
      return;
    }

    var groupName = groupNames[index++];
    var policy = selections[groupName];
    $httpAPI("POST", "/v1/policy_groups/select", { group_name: groupName, policy: policy }, function (result) {
      if (result && result.error) {
        failed.push(groupName);
      } else {
        applied.push(groupName);
      }
      next();
    });
  }

  next();
}

function filterSelections(selections, filter) {
  var result = {};
  var allowed = null;
  if (filter && filter.length > 0) {
    allowed = {};
    filter.forEach(function (groupName) {
      allowed[groupName] = true;
    });
  }

  Object.keys(selections).forEach(function (groupName) {
    var policy = selections[groupName];
    if (typeof policy !== "string" || policy.length === 0) {
      return;
    }
    if (allowed && !allowed[groupName]) {
      return;
    }
    result[groupName] = policy;
  });

  return result;
}

function withCacheBust(url) {
  return url + (url.indexOf("?") === -1 ? "?" : "&") + "_group_default_select=" + Date.now();
}

function parseArguments(argument) {
  var result = {};
  if (!argument) {
    return result;
  }

  argument.split("&").forEach(function (part) {
    if (!part) {
      return;
    }
    var index = part.indexOf("=");
    var key = index >= 0 ? part.slice(0, index) : part;
    var value = index >= 0 ? part.slice(index + 1) : "";
    result[decodeURIComponent(key)] = decodeURIComponent(value);
  });

  return result;
}

function parseGroups(value) {
  if (!value) {
    return null;
  }

  var groups = value.split("|").map(function (item) {
    return item.trim();
  }).filter(Boolean);

  return groups.length > 0 ? groups : null;
}

function parseJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function notify(title, body) {
  $notification.post(title, "", body);
}

function finish(title, content, style) {
  $done({
    title: title,
    content: content,
    style: style || "info"
  });
}
