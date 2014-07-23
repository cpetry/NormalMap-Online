start = new Date().getTime();
console.log(start);

function fib(n) {
	return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
};

var reverse_text = function (data) {
	fib(40);
	return global.env.a[data[0]] + data[1];
}

var log = function (data) {
	now = new Date().getTime();
	console.log("time_elapsed = " + (now - start));
	console.log(data); // logs sdrawrof
}

result = "";
function add(stuff){
	return stuff[0] + ",  " + stuff[1];
}

// Spawn a remote job (we'll see more on how to use then later)
var glob = ['thread1', 'thread2', 'thread3'];
var input = [[0,"0"],[1,"1"],[2,"2"]];
var p1 = new Parallel(input, {env: { a: glob }}).require(fib).map(reverse_text).reduce(add).then(log);



//var p3 = new Parallel('forwards').require(getStatus).spawn(reverse_text).then(log);
//r p4 = new Parallel('forwards').require(getStatus).spawn(reverse_text).then(log);

