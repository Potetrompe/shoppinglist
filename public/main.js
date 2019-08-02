$(document).ready(function(){

    //? Handle delete from Delete-form
    $(".deleteItem").on("click", function(e){
        var inputVal = document.getElementById("deleteField").value;
        $.ajax({
            type: "DELETE",
            url : "/" + inputVal,
            success: function(res){
                window.location.href="/";
            },
            error: function(err){
                console.log(err);
            }
        });
    });

    let boolRegisterLogin = false;
    function switchLoginRegister() {
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");

        if(
            // loginForm.style.display == "none" && 
            // registerForm.style.display == "block"
            boolRegisterLogin
        ){
            loginForm.style.display = "block";
            registerForm.style.display = "none";
            boolRegisterLogin = false;
        }else if(
            // loginForm.style.display == "block" && 
            // registerForm.style.display == "none"
            !boolRegisterLogin
        ){
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            boolRegisterLogin = true;
        }
    }
    const btnNoAcc = document.getElementById("btnNoAcc");
    const btnBackToLogin = document.getElementById("btnBackToLogin");
    btnNoAcc.onclick = switchLoginRegister;
    btnBackToLogin.onclick = switchLoginRegister;

    

});
