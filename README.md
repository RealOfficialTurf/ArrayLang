# ArrayLang

A parser to simplify array experssions in Automate, written in JavaScript.


## How to use

Download both the html page and the js file, then open the html page.

Write some code in the top textbox.

Press the Run button to convert the code into an array.

The resuting array will be on the bottom textbox that you can copy-paste in Automate as part of your flow.


## The code

The code must begin with `var` followed by the array name and the number of elements in an array.

All statements are separated by semicolons.

Only `if-else` statements are supported for now.

Comments (`//`) are also supported.


## Example

This code will and subtract 100 from the first element, add 1 to the second element, and set the third element to true; if the first element is greater than or equal to 100; otherwise, the third element is set to false.
Useful for game flows where the player requires 100 gold to buy an item, while also tracking the outcome of the transaction.
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

## Feedbacks and reports, please

That would've be great.

## Plans for the future

- implementation of `switch-case` statement using dictionary such as `{3:"Pi to the nearest integer", 21:"Sum of 9 and 10", 8128:"Perfect number"}[x]` (any other values will return `null`, though).