/*
  Permutate the elements in the specified array by swapping them
  in-place and calling the specified callback function on the array
  for each permutation.

  Return the number of permutations.

  If array is undefined, null or empty, return 0.

  NOTE: when permutation succeeds, the array should be in the original state
  on exit!
*/
function permutate(array, callback) {
    // Do the actual permuation work on array[], starting at index
    function p(array, index, callback) {
        // Swap elements i1 and i2 in array a[]
        function swap(a, i1, i2) {
            var t = a[i1];
            a[i1] = a[i2];
            a[i2] = t;
        }

        // Are we at the last element of the array?                        
        if (index == array.length - 1) {
            // Nothing more to do - call the callback
            callback(array);
            // We have found a single permutation
            return 1;
        } else {
            // Still work to do.
            // Count the number of permutations to our right
            var count = p(array, index + 1, callback);
            // Swap the element at position index with
            // each element to its right, permutate again,
            // and swap back
            for (var i = index + 1; i < array.length; i++) {
                swap(array, i, index);
                count += p(array, index + 1, callback);
                swap(array, i, index);
            }
            return count;
        }
    }

    // No data? Then no permutations!        
    if (!array || array.length == 0) {
        return 0;
    }

    // Start the permutation    
    return p(array, 0, callback);
}

var x = [1, 2, 3];

// Simply permutate and display the result
var count = permutate(x, function(a) {
    document.write("[" + a + "]<br />");
});

document.write("Permutations found: ", count, "<br />");

var result = [];
permutate(x, function(a) {
    result.push(a.slice(0));
});

for (var i = 0; i < result.length; i++)
{
    document.write(i, ": [", result[i], "]<br />");
}
document.write("Permutations found: ", result.length, "<br />");