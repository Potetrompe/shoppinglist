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



    const btnRegister = document.getElementById("btnRegister");
    
    let btnRegisterBool = false;

    btnRegister.onclick = () => {
        //console.log(btnRegister);
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");

        if(btnRegisterBool){
            loginForm.style.display = "block";
            registerForm.style.display = "none";
            btnRegister.innerHTML = "No account?";
            btnRegisterBool = false;
        }else if(!btnRegisterBool){
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            btnRegister.innerHTML = "Back to login";
            btnRegisterBool = true;
        }
        //console.log(btnRegisterBool);

    }
    
    

});
