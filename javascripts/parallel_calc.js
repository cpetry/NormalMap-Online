start = new Date().getTime();
console.log(start);

function fib(n) {
  return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
};

var reverse_text = function (data) {
	data = data.split("").reverse().join("");
	fib(40);
	return data;
}

var reverse_text2 = function (data) {
	data = data.split("").reverse().join("");
	fib(40);
	fib(40);
	return data;
}

var reverse_text3 = function (data) {
	data = data.split("").reverse().join("");
	fib(40);
	fib(40);
	fib(40);
	return data;
}

var log = function (data) {
	now = new Date().getTime();
	console.log("time_elapsed = " + (now - start));
	console.log(data); // logs sdrawrof
}


// Spawn a remote job (we'll see more on how to use then later)
var p1 = new Parallel('thread1').require(fib).spawn(reverse_text).then(log);
var p2 = new Parallel('thread2').require(fib).spawn(reverse_text).then(log);
var p3 = new Parallel('thread3').require(fib).spawn(reverse_text2).then(log);
var p4 = new Parallel('thread4').require(fib).spawn(reverse_text2).then(log);
var p5 = new Parallel('thread5').require(fib).spawn(reverse_text3).then(log);


//var p3 = new Parallel('forwards').require(getStatus).spawn(reverse_text).then(log);
//r p4 = new Parallel('forwards').require(getStatus).spawn(reverse_text).then(log);

