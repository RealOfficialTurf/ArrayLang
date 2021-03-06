"use strict"
function debugstringpos(string,pos){
	return string+"\n"+" ".repeat(pos)+"^";
}

function replaceAll(str,mapObj){
	var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
	return str.replace(re, function(matched){
		return mapObj[matched.toLowerCase()];
	});
}

function parsecode(sourcecode){
	let pos = 0;
	let pos2 = 0;
	let code = {};
	code.statements = [];
	while(pos<sourcecode.length){
		let subcode;
		if(sourcecode.startsWith("if",pos)){
			subcode = {};
			console.log("IF",sourcecode.length,pos);
			//find the condition
			pos = pos2 = sourcecode.indexOf("(",pos2)+1; //begin
			pos2 = sourcecode.indexOf(")",pos2); //end
			subcode.condition = "("+sourcecode.slice(pos,pos2).trim()+")"; //condition
			//find the start cap and the matching end cap
			pos = sourcecode.indexOf("{",pos2)+1; //begin
			if(pos == -1){
				throw "ERROR: Missing open curly bracket.\n"+debugstringpos(sourcecode,pos2);
			}
			pos2 = pos; //end
			let i = 1;
			while(i>0){
				let j = sourcecode.indexOf("{",pos2);
				let k = sourcecode.indexOf("}",pos2);
				if((j!=-1&&j<k)||k==-1){
					// ... {! { ... }
					pos2 = j+1;
					++i;
				}
				else if((k!=-1&&j>k)||j==-1){
					// ... }! } ... {
					pos2 = k+1;
					--i;
				}
				else{
					throw "TEST: "+j+" "+k;
				}
			}
			--pos2;
			let newsourcecode = sourcecode.slice(pos,pos2);
			subcode.statements = parsecode(newsourcecode).statements; //statements
			pos = pos2 = pos2+1;
			console.log("ENDIF",sourcecode.length,pos);
			//Check whether the block is followed by an else
			if(sourcecode.startsWith("else",pos)){
				console.log("ELSE",sourcecode.length,pos);
				pos = sourcecode.indexOf("{",pos2)+1; //begin
				if(pos == -1){
					throw "ERROR: Missing open curly bracket.\n"+debugstringpos(sourcecode,pos2);
				}
				pos2 = pos; //end
				let i = 1;
				while(i>0){
					let j = sourcecode.indexOf("{",pos2);
					let k = sourcecode.indexOf("}",pos2);
					if((j!=-1&&j<k)||k==-1){
						// ... {! { ... }
						pos2 = j+1;
						++i;
					}
					else if((k!=-1&&j>k)||j==-1){
						// ... }! } ... {
						pos2 = k+1;
						--i;
					}
					else{
						throw "TEST: "+j+" "+k;
					}
				}
				--pos2;
				let newsourcecode = sourcecode.slice(pos,pos2);
				subcode.statementselse = parsecode(newsourcecode).statements;
				pos = pos2 = pos2+1;
			}
			else{
				subcode.statementselse = {}
			}
			code.statements.push(subcode);
		}
		else{
			subcode = {};
			console.log("...",sourcecode.length,pos);
			let pos1 = sourcecode.indexOf("=",pos2); //mid
			pos2 = sourcecode.indexOf(";",pos2); //end
			if(pos1==-1||pos1>pos2){
				throw "ERROR: Missing equal sign.\n"+debugstringpos(sourcecode,pos)+"\n"+debugstringpos(sourcecode,pos2);
			}
			subcode.assignvariable = sourcecode.slice(pos,pos1).trim();
			subcode.assignvalue = "("+sourcecode.slice(pos1+1,pos2).trim()+")";
			code.statements.push(subcode);
			pos = pos2 = pos2+1;
		}
	}
	return code;
}

function simplifystatements(statements){
	let statementlist = Object.create(null); //A Map would make more sense here, but it"s much simpler to use Object.keys() to get an array of keys rather than Map.keys() that only return the iterator....
	for(let i = 0;i<statements.length;++i){
		if(statements[i].condition){
			let templist1 = simplifystatements(statements[i].statements);
			let templist2 = simplifystatements(statements[i].statementselse);
			let tempstatementlist = Object.create(null);
			let j;
			for(j of Object.keys(templist1)){
				tempstatementlist[j]="";
			}
			for(j of Object.keys(templist2)){
				tempstatementlist[j]="";
			}
			for(j of Object.keys(tempstatementlist)){
				tempstatementlist[j]="("+statements[i].condition+" ? "+(templist1[j]===undefined?j:templist1[j])+" : "+(templist2[j]===undefined?j:templist2[j])+")";
			}
			//simplify the if into normal statements!
			let assignvariable = statements[i].assignvariable;
			let assignvalue = statements[i].assignvalue;
			//simplify every statements
			
			//check for expandable variables
			if(Object.keys(statementlist).length>0){
				for(j of Object.keys(tempstatementlist)){
					let assignvariable = j;
					let assignvalue = tempstatementlist[j];
					assignvalue = assignvalue.replace(new RegExp(Object.keys(statementlist).map(key=>key.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")).join("|"),"gi"),(m)=>statementlist[m]); //A replace-once one-liner! Woo!
					tempstatementlist[j]=assignvalue;
				}
			}
			//check for reassignments
			for(j of Object.keys(tempstatementlist)){
				statementlist[j]=tempstatementlist[j]; //Setting a value to the same key will overwrite the value, and previous variables has been expanded, so reassignments are done automatically.
			}
			console.log("Var list after if:",statementlist);
		}
		else{
			let assignvariable = statements[i].assignvariable;
			let assignvalue = statements[i].assignvalue;
			//simplify the statements
			//check for expandable variables
			if(Object.keys(statementlist).length>0){
				assignvalue = assignvalue.replace(new RegExp(Object.keys(statementlist).map(key=>key.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")).join("|"),"gi"),(m)=>statementlist[m]); //A replace-once one-liner! Woo!
			}
			//check for reassignments
			statementlist[assignvariable]=assignvalue; //Setting a value to the same key will overwrite the value, and previous variables has been expanded, so reassignments are done automatically.
		}
	}
	return statementlist; //Returns an object {assignvariable1: assignvalue1, assignvariable2: assignvalue2, ...}
}

function simplifyinstructions(instructions){
	return simplifystatements(instructions.statements);
}

function run(){
	//Replace all the \n into spaces and removes beginning and trailing whitespace between ;
	//Kinda like trim(), but whatever.
	var sourcecode = codetext.value;
	sourcecode = sourcecode.replaceAll(/\/\/.*/ig,""); //Removes comments
	sourcecode = sourcecode.replaceAll(/\n+|\t+/ig," "); //Replaces newline and tabs to space
	sourcecode = sourcecode.replaceAll(/(\s+\;)|(\;\s+)/ig,";");	
	sourcecode = sourcecode.replaceAll(/(\s+\{)|(\{\s+)/ig,"{"); //Replaces all whitespace infront or behind braces to brace
	sourcecode = sourcecode.replaceAll(/(\s+\})|(\}\s+)/ig,"}");
	sourcecode = sourcecode.trim();
	console.log(sourcecode); //For debugging purposes
	//Get the first statement!
	let statement = sourcecode.slice(0,sourcecode.indexOf(";",0));
	if(!statement.startsWith("var")){
		throw "ERROR: Code must start with a var";
		return;
	}
	//We don"t need the first statement anymore.
	sourcecode = sourcecode.slice(sourcecode.indexOf(";",0)+1);
	//Execute the first statement, which will be the "var" statement
	statement = statement.slice(4);
	let openbrckt = statement.indexOf("[");
	let closebrckt = statement.indexOf("]");
	let varname = statement.slice(0,openbrckt);
	let varelements = parseInt(statement.slice(openbrckt+1,closebrckt));
	if(isNaN(varelements)||varelements<=0||varelements>Number.MAX_SAFE_INTEGER){
		throw "ERROR: element count is invalid";
		return;
	}
	//Generate the variable names
	var variables = [];
	for(let i = 0;i<varelements;i++){
		variables.push([varname,"[",i,"]"].join(""));
	}
	console.log("{"+variables.join(", ")+"]");; //For debugging purposes
	//Execute order si- I mean, execute the statements!
	var instructions = parsecode(sourcecode);
	console.log("before simplification",instructions);
	let statements = simplifyinstructions(instructions);
	console.log("after simplification",statements);
	var output = "["+variables.join(", ")+"]";
	if(Object.keys(statements).length>0){
		output = output.replace(new RegExp(Object.keys(statements).map(key=>key.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")).join("|"),"gi"),(m)=>statements[m])
	}
	result.value = output;
}