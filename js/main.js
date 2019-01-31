var feed = document.getElementById("feed");
var btnDelete = document.getElementById("btnDelete");

//* Globals
var trArr = [];
//trArr[i].firstElementChild.innerHTML = "";\
var trActive = true;

function newIndex(text, auth, bg, col){
    var tr = document.createElement("tr");
    var tdText = document.createElement("td");
    var tdAuth = document.createElement("td");

    text = String(text);
    auth = String(auth);

    tdText.innerHTML = text;
    tdAuth.innerHTML = auth;
    
    tr.appendChild(tdText);
    tr.appendChild(tdAuth);

    if(col != "" && bg != ""){
        tr.style.background = "#0ff";
        tr.style.color = "#000";
    }
    trArr.push(tr);
    for (let i = 0; i < trArr.length; i++) {

        trArr[i].onclick = function(){
            this.classList.toggle("trActive");
            
            if(trActive){
                btnDelete.style.visibility = "visible";
                trActive = false;
            }else{
                btnDelete.style.visibility = "hidden";
                trActive = true;
            }
            //console.log(this.classList);
        }
        
    }

    feed.firstElementChild.firstElementChild.appendChild(tr);
}

newIndex("text", "auth", "s");


console.log(trArr);
