var DEFAULT_GROUPS = [
  "Proxy",
  "Termius",
  "Netflix",
  "HBO_Max",
  "YouTube",
  "DMM",
  "GitHub",
  "Telegram",
  "Steam",
  "Apple_Intelligence",
  "OpenAI",
  "AI_Suite",
  "Apple",
  "Microsoft",
  "JD",
  "TikTok",
  "Global",
  "Final"
];

var args = parseArguments(typeof $argument === "string" ? $argument : "");
var exportUrl = args["export-url"] || args.exportUrl || "";
var groups = parseGroups(args.groups) || DEFAULT_GROUPS;

if (!exportUrl || exportUrl.indexOf("{{") !== -1) {
  finish("Group Default Export", "Missing export URL. Refresh the managed profile from the Worker first.", "error");
} else {
  exportSelections();
}

function exportSelections() {
  readSelections(groups, function (selections, skipped) {
    var count = Object.keys(selections).length;
    if (count === 0) {
      finish("Group Default Export", "No select group selections were found.", "error");
      return;
    }

    var payload = {
      version: 1,
      source: {
        system: safeString($environment && $environment.system),
        deviceModel: safeString($environment && $environment["device-model"]),
        surgeVersion: safeString($environment && $environment["surge-version"]),
        surgeBuild: safeString($environment && $environment["surge-build"]),
        scriptName: safeString($script && $script.name)
      },
      selections: selections
    };

    $httpClient.post(
      {
        url: exportUrl,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        timeout: 20
      },
      function (error, response, data) {
        if (error) {
          finish("Group Default Export", "Upload failed: " + error, "error");
          return;
        }

        var status = response && response.status;
        var result = parseJson(data) || {};
        if (!status || status < 200 || status >= 300 || result.ok === false) {
          finish("Group Default Export", "Upload failed: " + (result.error || ("HTTP " + status)), "error");
          return;
        }

        var detail = "Uploaded " + (result.selectionCount || count) + " select group selections.";
        if (skipped.length > 0) {
          detail += "\nSkipped: " + skipped.join(", ");
        }
        if (result.rawUrl) {
          detail += "\n" + result.rawUrl;
        }

        notify("Surge group selections exported", detail, result.githubUrl || result.rawUrl);
        finish("Group Default Export", detail, "good");
      }
    );
  });
}

function readSelections(groupNames, callback) {
  var selections = {};
  var skipped = [];
  var index = 0;

  function next() {
    if (index >= groupNames.length) {
      callback(selections, skipped);
      return;
    }

    var groupName = groupNames[index++];
    $httpAPI("GET", "/v1/policy_groups/select?group_name=" + encodeURIComponent(groupName), null, function (result) {
      if (result && typeof result.policy === "string" && result.policy.length > 0) {
        selections[groupName] = result.policy;
      } else {
        skipped.push(groupName);
      }
      next();
    });
  }

  next();
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

function safeString(value) {
  return typeof value === "string" ? value : "";
}

function notify(title, body, url) {
  var options = url ? { action: "open-url", url: url } : undefined;
  $notification.post(title, "", body, options);
}

function finish(title, content, style) {
  $done({
    title: title,
    content: content,
    style: style || "info"
  });
}
