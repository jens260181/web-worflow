const GREETING = 'Hallo von Web-Workflow';
const H3 = document.getElementsByTagName('h3')[0];

H3.innerHTML = GREETING;

// In Production kein console.log, Kommentare, alert, ...
console.log(GREETING);
// Was anderes
alert(GREETING);