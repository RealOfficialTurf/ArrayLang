# ArrayLang

A parser to simplify array experssions in Automate, written in JavaScript.


## How to use

Download the html page and open the html page.

Write some code in the top textbox.

Press the Run button to convert the code into an array.

The resuting array will be on the bottom textbox that you can copy-paste in Automate as part of your flow.


## Example

This code will add 1 to the third element, and subtract 100 from the first element and add 1 to the second element if the first element is greater than or equal to 100.
Useful for game flows where the player requires 100 gold to buy an item, while also keeping track how many times the player have tried to buy the item.
```
var g[3];
if(g[0] >= 100){
	g[0]=g[0]-100;
	g[1]=g[1]+1;
	g[2]=true;
}
else{
	g[2]=false;
}
```
Result
```
[((g[0] >= 100) ? (g[0]-100) : g[0]), ((g[0] >= 100) ? (g[1]+1) : g[1]), ((g[0] >= 100) ? (true) : (false))]
```
