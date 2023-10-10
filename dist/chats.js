


// Get chats container 
const  section = document.querySelector('#chatSection');



const userInfo = document.querySelector('.user_info');
const displayUsername = document.querySelector('.user_info .username h4');
const displayAvatar = document.querySelector('.user_info .username img');
const displayEmail = document.querySelector('.user_info span');



const displayUserCred = (userCred,username) => {
  displayEmail.textContent = userCred.email
  displayUsername.textContent = username
  displayAvatar.src = `https://robohash.org/${username}?bgset=bg1&set=set3`
}



// Display nav Buttons on user Status 
const registerBtn = document.querySelector('.register');
const signInBtn = document.querySelector('.signInBtn');
const signOutBtn = document.querySelector('.logOutBtn');
const deleteAccountBtn = document.querySelector('.deleteAccountBtn');

// Get Forms 
const formsWrapper = document.querySelector('.forms_wrapper');
const signInForm = document.querySelector('.signInForm');
const createAccount = document.querySelector('.create-account');

signInBtn.addEventListener('click', () => {

  signInForm.style.display = 'block'
  formsWrapper.style.display = 'block'

  createAccount.style.display = 'none'
   
});

registerBtn.addEventListener('click', () => {

  createAccount.style.display = 'block'
  formsWrapper.style.display = 'block'

  signInForm.style.display = 'none'

});



const displayNavBtns = (user) => {
    if(user){
      signOutBtn.classList.add('active');
      deleteAccountBtn.classList.add('active');

      registerBtn.classList.remove('active');
      signInBtn.classList.remove('active');
    }else {
      registerBtn.classList.add('active');
      signInBtn.classList.add('active');
      
      signOutBtn.classList.remove('active');
      deleteAccountBtn.classList.remove('active');

    }


}




const displayChats = (chats) => {
  }
  
 
 
 
 


