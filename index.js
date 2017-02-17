var edit = 'addPoint';
var pathLength = 0;
var bestPath = 0;
var pathComplete = false;
var nodes = [];
var path = [];
var allLinks = {};
var pathLinks = [];
var id = {
  id: 0,
  new: function () {
    return this.id++;
  }
};

function createNode(x, y) {
  var node = {
    x: x,
    y: y,
    id: id.new()
  }

  return node;
};

function calculateLength(node1, node2) {
  var a = Math.abs(node1.x - node2.x);
  var b = Math.abs(node1.y - node2.y);
  var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  return c;
}

function createLink(node1, node2) {
  var link = {
    node1: node1,
    node2: node2,
    id: (node1.id < node2.id) ? node1.id + '-' + node2.id : node2.id + '-' + node1.id,
    length: calculateLength(node1, node2)
  }

  return link;
};

function drawSVGNode(node) {
  var points = document.getElementsByClassName('points')[0];
  var point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  // var point = document.createElement('circle'); 
  point.setAttribute('class', 'node');
  point.setAttribute('id', node.id);
  point.setAttribute('cx', node.x);
  point.setAttribute('cy', node.y);
  point.setAttribute('r', 5);
  point.setAttribute('fill', 'red');
  point.setAttribute('stroke', 'red');
  node.point = point;
  points.appendChild(point);
};

function drawSVGLink(link) {
  var lines = document.getElementsByClassName('lines')[0];
  var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('id', link.id);
  line.setAttribute('x1', link.node1.x);
  line.setAttribute('y1', link.node1.y);
  line.setAttribute('x2', link.node2.x);
  line.setAttribute('y2', link.node2.y);
  line.setAttribute('class', 'link');
  line.setAttribute('stroke-width', 1);
  line.setAttribute('stroke', 'black');
  lines.appendChild(line);
}

function clickedSVG(evt) {
  var name = evt.target.nodeName;
  if (name === 'svg' && edit === 'addPoint') {
    return addPoint(evt);
  }
  if (name === 'circle' && edit === 'addLink') {
    return addLinkEvt(evt);
  }
  return evt.stopPropagation();
};

function clickedRadio(evt) {
  edit = evt.target.value;
};

function addPoint(evt) {
  var e = evt.target;
  var dim = e.getBoundingClientRect();
  var x = evt.clientX - dim.left;
  var y = evt.clientY - dim.top;
  var node = createNode(x, y);
  var numOfPoints = document.getElementById('numOfPoints');
  drawSVGNode(node);
  createLinks(node);
  nodes.push(node);
  numOfPoints.innerHTML = nodes.length;
}

function createLinks(node1) {
  nodes.map(function(node2) {
    var link = createLink(node1, node2);
    allLinks[link.id] = link;
  });
}

function addLinkEvt(evt) {
  var id = Number(evt.target.id);
  addLink(id);
} 

function getNodeById(id) {
  return nodes.filter(function (n) {
    return n.id === id;
  })[0];
}

function addLink(id) {
  var point = document.getElementById(id);
  var currentPath = document.getElementById('currentPath');
  var exists = path.filter(function (n) {
    return n === id;
  });
  var linkID;
  var link;
  var id1;
  var id2;

  point.setAttribute('stroke', 'blue');
  pathComplete = (path.length === nodes.length && path[0] === exists[0]);
  if (exists.length === 0 || pathComplete) {
    path.push(id);
    if (path.length >= 2) {
      id1 = path[path.length - 2];
      id2 = path[path.length - 1];

      linkID = (id1 < id2) ? id1 + '-' + id2 : id2 + '-' + id1;
      link = allLinks[linkID];
      drawSVGLink(link);
      pathLinks.push(link);
      pathLength = pathLinks.reduce(function (value, link) {
        return link.length + value;
      }, 0);
      currentPath.innerHTML = Math.round(pathLength * 100) / 100;
    }
  }
}

function removedChildElements(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

function clearAll() {
  var points = document.getElementsByClassName('points')[0];
  document.getElementById('numOfPoints').innerHTML = 0;
  removedChildElements(points);
  nodes = [];
  path = [];
  pathLength = 0;
  currentPath = 0;
  bestPath = 0;
  clearLines();
};

function resetPointStroke() {
  var points = document.getElementsByClassName('points')[0].childNodes;
  points.forEach(function (point) {
    point.setAttribute('stroke', 'red');
  })
}

function clearLines() {
  var lines = document.getElementsByClassName('lines')[0];
  var bp = document.getElementById('bestPath');
  var cp = document.getElementById('currentPath');
  var currentPath = Math.round(pathLength * 100) / 100;
  resetPointStroke();
  if (pathComplete) {
    bestPath = (bestPath === 0 || bestPath > currentPath) ? currentPath : bestPath;
    bp.innerHTML = bestPath;
  }
  cp.innerHTML = 0;
  pathComplete = false;
  removedChildElements(lines);
  path = [];
  pathLinks = [];
};

function swap(a, index1, index2) {
  var array = a.slice();
  var temp = array[index1];

  array[index1] = array[index2];
  array[index2] = temp;

  return array;
}

function permutate(a, index, callback) {
  var count = 0;
  var array = a.slice();
  var i = index;

  if (!index && array[0] < array[array.length - 1]) {
    callback(array);
    count = count + 1;
  }

  if (index) {
    count = permutate(array, index - 1, callback);

    while (i--) {
      newArray = swap(array, i, index);
      count = count + permutate(newArray, index - 1, callback);
    }
  }

  return count;
};

function permute(array) {
  var results = {
    permutations: [],
    count: 0,
    runTime: 0
  };
  var push = function (a) {
    results.permutations.push(a);
    return true;
  };
  var startTime = Date.now();

  if (Array.isArray(array) && array.length > 0) {
    results.count = permutate(array.slice(), array.length - 1, push);
    results.runTime = Date.now() - startTime;
  }
  // Start the permutation   
  return results;
};

function calculateTotalPaths() {
  var n = nodes.length;
  var c = [];
  var totalPaths = 0;
  var domTP = document.getElementById('numOfpaths');
  var input = R.pluck('id', nodes);
  var startNode = input.shift();
  var results;
  var permutations

  if (n > 2) {
    // if less then 2 we would just multiply by 1 and 2
    // this is canceled out by the reversed path calculation
    // therefore why devide the total paths by 2 at the end
    while (n - 1 > 2) {
      c.push(--n);
    }

    totalPaths = c.reduce(
      function (total, value) {
        return total * value;
      }, 1
    );
  }

  domTP.innerHTML = totalPaths;
  results = permute(input);
  results.permutations = results.permutations.map(function(permutation) {
    var linkLen = [];
    var length;
    var id1;
    var id2;
    permutation.splice(0,0,startNode);
    permutation.push(startNode);

    permutation.map(function(id, index) {
      var id2;
      var linkID;

      if(index > 0) {
        id2 = permutation[index - 1];
        linkID = (id < id2) ? id + '-' + id2 : id2 + '-' + id;
        linkLen.push(allLinks[linkID]);
      }
    });

    length = linkLen.reduce(function(acc, link) {
      return acc + link.length;
    }, 0);

    return {
      length: length,
      permutation: permutation
    };
  })

  permutations = results.permutations.sort(function(a, b) {
    return a.length < b.length ? -1 : 1;
  });

  results.permutations = permutations;

  updatePaths(results);
}

function updatePaths(results) {
  var domPaths = document.getElementById('pathList');
  removedChildElements(domPaths);

  results.permutations.map(function(permutation){
    var div = document.createElement('div');
    var a = document.createElement('a');
    a.href='#';
    a.innerHTML = permutation.permutation.join(',');
    a.addEventListener('click', function(e) {
      showPath(permutation.permutation);
    });
    div.appendChild(a);
    domPaths.appendChild(div);
  })
};

function showPath(permutation) {
  clearLines();
  permutation.map(function(id) {
    addLink(id);
  })
};

function attachEvents() {
  var svg = document.getElementsByTagName('svg')[0];
  var radios = document.getElementsByName('edit');
  var clearall = document.getElementById('clearAll');
  var clearlines = document.getElementById('clearLines');
  var generatepaths = document.getElementById('generatePaths');
  radios.forEach(function (radio) {
    radio.addEventListener('click', clickedRadio)
  })
  svg.addEventListener('click', clickedSVG);
  clearall.addEventListener('click', clearAll);
  clearlines.addEventListener('click', clearLines);
  generatepaths.addEventListener('click', calculateTotalPaths);
};

window.onload = function () {
  attachEvents();
};
