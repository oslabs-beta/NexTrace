const collectorOptions = {
    url: "http://localhost:9999/otel"
};

console.log('Test log 1');
console.log('Test log 2');
function testFunction() {
    console.log('Test log 3', 'hehe sneaky');
}
const myArr = [5, 4, 3, 2, 1];
console.error('Will it catch this?');
console.log(myArr);
const a = 5;
const b = 3;
console.log(a + b);