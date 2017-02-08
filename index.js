var edit = 'addPoint';
var pathLength = 0;
var bestPath = 0;
var pathComplete = false;
var nodes = [];
var path = [];
var links = [];
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
    id: id.new(),
    length: calculateLength(node1, node2)
  }

  return link;
};

function addSVGNode(node) {
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

function addSVGLink(link) {
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
  addSVGNode(node);
  nodes.push(node);
  numOfPoints.innerHTML = nodes.length;
}

function addLinkEvt(evt) {
  var id = Number(evt.target.id);
  evt.target.setAttribute('stroke', 'blue');
  addLink(id);
} 

function addLink(id) {
  var currentPath = document.getElementById('currentPath');
  var node = nodes.filter(function (n) {
    return n.id === id;
  })[0];
  var exists = path.filter(function (n) {
    return n.id === id;
  });
  var link;
  pathComplete = (path.length === nodes.length && path[0] === exists[0]);
  if (exists.length === 0 || pathComplete) {
    path.push(node);
    if (path.length >= 2) {
      link = createLink(path[path.length - 2], path[path.length - 1]);
      addSVGLink(link);
      links.push(link);
      pathLength = links.reduce(function (value, link) {
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
  links = [];
  path = [];
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

    // for (var i = index + 1; i < array.length; i++) {
    //   newArray = swap(array, i, index);
    //   count = count + permutate(newArray, index + 1, callback);
    // }
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
  results.permutations.map(function(permutation) {
    permutation.splice(0,0,startNode);
    permutation.push(startNode);
  });

  console.log(results);
  updatePaths(results);
}

function updatePaths(results) {
  var domPaths = document.getElementById('pathList');
  removedChildElements(domPaths);

  results.permutations.map(function(permutation){
    var div = document.createElement('div');
    div.innerHTML = permutation.join(',');
    div.addEventListener('click', function(e) {
      showPath(permutation);
    });
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
