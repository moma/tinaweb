var completion, getGraph, graphUrl, ids;

jQuery.fn.disableTextSelect = function() {
  return this.each(function() {
    if (typeof this.onselectstart !== "undefined") {
      return this.onselectstart = function() {
        return false;
      };
    } else if (typeof this.style.MozUserSelect !== "undefined") {
      return this.style.MozUserSelect = "none";
    } else {
      this.onmousedown = function() {
        return false;
      };
      return this.style.cursor = "default";
    }
  });
};

ids = 0;

completion = {};

graphUrl = "";

getGraph = function() {
  return graphUrl;
};

$(document).ready(function() {
  var cache, popfilter, xhrs;
  popfilter = function(label, type, options) {
    var footer, header, id, id1, id2, input, labelization;
    id = ids++;
    id1 = "filter" + id;
    id2 = "combo" + id;
    header = "<li id=\"" + id1 + "\" class=\"filter\" style=\"padding-top: 5px;\">";
    labelization = "<span style=\"color: #fff;\">&nbsp; " + label + " </span>";
    input = "<input type=\"text\" id=\"" + id2 + "\" class=\"medium filter" + type + "\" placeholder=\"" + type + "\" />";
    footer = "</li>;";
    $(header + labelization + input + footer).insertBefore("#refine");
    $("#" + id2).catcomplete({
      minLength: 2,
      source: function(request, response) {
        var term;
        term = request.term;
        return $.getJSON("autocomplete.php", {
          category: type,
          term: request.term
        }, function(data, status, xhr) {
          return response(data.results);
        });
      }
    });
    $("#" + id1 + "").hide();
    $("#" + id1 + "").fadeIn(500);
    return false;
  };
  jQuery(".unselectable").disableTextSelect();
  $(".unselectable").hover((function() {
    return $(this).css("cursor", "default");
  }), function() {
    return $(this).css("cursor", "auto");
  });
  $("#search-form").hide();
  $(".topbar").hover((function() {
    return $(this).stop().animate({
      opacity: 0.98
    }, "fast");
  }), function() {
    return $(this).stop().animate({
      opacity: 0.93
    }, "fast");
  });
  $.widget("custom.catcomplete", $.ui.autocomplete, {
    _renderMenu: function(ul, items) {
      var categories, self;
      self = this;
      categories = _.groupBy(items, function(o) {
        return o.category;
      });
      return _.each(categories, function(data, category) {
        var size, term, total;
        size = 0;
        total = 0;
        term = "";
        _.each(data, function(item) {
          size = item.size;
          total = item.total;
          term = item.term;
          return self._renderItem(ul, item);
        });
        ul.append("<li class='ui-autocomplete-category'>" + size + "/" + total + " results</li>");
        console.log(term);
        return ul.highlight(term);
      });
    }
  });
  cache = {};
  xhrs = {};
  $("#addfiltercountry").click(function() {
    return popfilter("in", "countries", []);
  });
  $("#addfilterorganization").click(function() {
    return popfilter("from", "organizations", []);
  });
  $("#addfilterlaboratory").click(function() {
    var prefix;
    prefix = "working";
    return popfilter(prefix + " at", "laboratories", []);
  });
  $("#addfilterkeyword").click(function() {
    var prefix;
    prefix = "working";
    return popfilter(prefix + " on", "keywords", []);
  });
  $("#addfiltertag").click(function() {
    return popfilter("tagged", "tags", []);
  });
  $("#loading").fadeOut();
  $("#example").click(function() {
    $(".hero-unit").fadeOut("slow");
    return $("#welcome").fadeOut("slow", function() {
      return $("#loading").fadeIn("fast");
    });
  });
  return $("#generate").click(function() {
    $(".hero-unit").fadeOut("slow");
    $("#welcome").fadeOut("slow", function() {
      var collect, query, url;
      $("#loading").fadeIn("fast");
      console.log("loading");
      collect = function(k) {
        var t;
        t = [];
        console.log("collecting " + ".filter" + k + "");
        $(".filter" + k + "").each(function(i, e) {
          var value;
          value = $(e).val();
          if (value === void 0) return;
          value = value.replace(/^\s+/g, "").replace(/\s+$/g, "");
          if (value === "" || value === " ") return t.push(value);
        });
        return t;
      };
      console.log("collecting..");
      query = {
        categorya: $("#categorya :selected").text(),
        categoryb: $("#categoryb :selected").text(),
        keywords: collect("keywords"),
        countries: collect("countries"),
        laboratories: collect("laboratories"),
        coloredby: [],
        tags: collect("tags"),
        organizations: collect("organizations")
      };
      console.log(query);
      url = "getgraph.php?query=" + encodeURIComponent(JSON.stringify(query));
      console.log(url);
      graphUrl = url;
      return $("#visualization").html("<iframe src=\"tinaframe.html\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>");
    });
    return false;
  });
});
