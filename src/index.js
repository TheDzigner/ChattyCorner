import DOMPurify from 'dompurify';

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";


import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from 'firebase/auth'


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4WdM9rFxpDhuycTXY7G7snOfsorMa1cA",
  authDomain: "chattycorner-361c5.firebaseapp.com",
  projectId: "chattycorner-361c5",
  storageBucket: "chattycorner-361c5.appspot.com",
  messagingSenderId: "183708460924",
  appId: "1:183708460924:web:10c5e2e37ad64b68a6e6f9",
  measurementId: "G-XP54L2Z2WJ",
};

initializeApp(firebaseConfig);



// Initialize Firestore service
const db = getFirestore();

// Reference to the 'chats' collection in Firestore
const chatsRef = collection(db, "chats");

// Initialize Firebase Authentication service
const auth = getAuth();

// Get DOM Elements
const createAccount = document.querySelector('.create-account'); // Button to create an account
const username = document.getElementById('signUpUsername'); // Input field for username
const avatar_preview = document.querySelector('.avatar_preview img'); // Image element for avatar preview






// Listen for input events on the username input field
username.addEventListener('input', (e) => {
  // Generate an avatar URL based on the input value
  avatar_preview.setAttribute('src', `https://robohash.org/${e.target.value}?bgset=bg1&set=set3`);
});

// Listen for form submission on the create account form
createAccount.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the form from submitting

  // Get user input values
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;

  // Create a new user object
  const newUser = {
    email: email,
    password: password,
    username: username.value
  };

  // Create a new user in Firebase Authentication
  createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // Save user data to Firestore
      saveUserInFirestore(uid, email, newUser.username);


    })
    .catch((error) => {
      alert(error.message);
    });

  // Reset the form and hide the account creation wrapper
  createAccount.reset();
  document.querySelector('.account_wrapper').style.display = 'none';
});

// Function to save user data in Firestore
function saveUserInFirestore(uid, email, username) {
  const userRef = doc(db, 'users', uid);
  setDoc(userRef, {
    email: email,
    username: username,
    avatar_url: `https://robohash.org/${username}?bgset=bg1&set=set3`
  })
    .then(() => {
      console.log("Document successfully written!");
      alert("Document successfully written!");
      location.reload(true);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

// Sign user in
// Get the sign-in form element
const signInForm = document.querySelector('.signInForm');

// Listen for form submission on the sign-in form
signInForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the form from submitting

  // Get user input values for email and password
  const signInEmail = document.querySelector('#signInEmail').value;
  const signInPassword = document.querySelector('#signInPassword').value;

  // Create a user object with email and password
  const user = {
    email: signInEmail,
    password: signInPassword
  };

  // Sign in the user using Firebase Authentication
  signInWithEmailAndPassword(auth, user.email, user.password)
    .then((userCredential) => {
      // Reload the page to reflect the signed-in state
      location.reload(true);
    })
    .catch((error) => {
      console.log(`Failed to sign in: ${error}`);
      alert(`Failed to sign in: ${error}`);
    });
});

// Get the log-out button element
const logOutBtn = document.querySelector('.logOutBtn');

// Listen for click events on the log-out button
logOutBtn.addEventListener('click', () => {
  // Sign out the user using Firebase Authentication
  signOut(auth)
    .then(() => {
      // Reload the page to reflect the signed-out state
      location.reload(true);
    })
    .catch((error) => {
      console.log(`Failed to sign out: ${error}`);
    });
});


const deleteAccountBtn = document.querySelector('.deleteAccountBtn');

deleteAccountBtn.addEventListener('click', () => {
  // Check if the user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If the user is authenticated, get their UID
      const uid = user.uid;
      const userRef = doc(db, 'users', uid);

      // Delete the user's account
      user.delete()
        .then(() => {
          document.querySelector('.signInForm').style.display = 'block'
          console.log("Account successfully deleted!");
          alert("Account successfully deleted!");
          // Reload the page after deletion
          location.reload(true);
        })
        .catch((error) => {
          console.error("Error deleting account: ", error);
          alert("Error deleting account: " + error.message);
        });
    } else {
      alert("You must be signed in to delete your account.");
    }
  });
});




// Get the message form element
const mssg_form = document.getElementById('mssg_form');

mssg_form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the form from submitting

  // Get the message content from the input field
  const mssgInput = document.getElementById('mssg_input');
   let mssg = mssgInput.value.trim(); // Trim leading and trailing spaces
   // Sanitize the message using DOMPurify
    mssg = DOMPurify.sanitize(mssg);
  // Check if the message is empty or too long
  if (mssg === '' || mssg.length > 70) {
    alert("Message must not be empty and should be 50 characters or less.");
    return; // Stop execution if the message is invalid
  }

  // // Check if the message contains spaces
  // if (/\s/.test(mssg)) {
    // alert("Message cannot contain spaces.");
    // return; // Stop execution if the message contains spaces
  // }

  // Check if the user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If the user is authenticated, get their UID
      const uid = user.uid;
      const userRef = doc(db, 'users', uid);

      // Get the user's username from Firestore
      getDoc(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            // Retrieve the sender's username
            const sender = snapshot.data().username;

            // Add a new message document to the 'chats' collection
            addDoc(chatsRef, {
               mssg: mssg,
              sender: sender,
              like: 0,
              likedBy: [],
              createdAt: serverTimestamp()
            })
              .then(() => {
                console.log("Message was sent successfully!");
              })
              .catch((error) => {
                console.error("Failed to send message: ", error);
              });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    } else {
      // If the user is not authenticated, display an alert
      alert("Please sign up or sign in to send a message.");
    }
  });

  // Reset the message input field
  mssgInput.value = '';
});




const section = document.querySelector('#chatSection');
let allChats = '';

// Create a query to order chat messages by createdAt in descending order
const onTimeAdded = query(chatsRef, orderBy('createdAt', 'desc'));

// Set up a listener to react to changes in the chat messages
onSnapshot(onTimeAdded, (snapshot) => {
  let chats = [];

  // Check if the user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;

      // Retrieve the username associated with the authenticated user
      const userRef = doc(db, 'users', uid);
      getDoc(userRef).then((userCredential) => {
        const username = userCredential.data().username;

        // Iterate through chat messages and add them to the chats array
        snapshot.forEach((snap) => {
          chats.push({ ...snap.data(), id: snap.id, userCred: username });
        });

        // Display the chat messages, user credentials, and navigation buttons
        displayChats(chats, uid);
        displayUserCred(user, username);
        displayNavBtns(user);
      });
    } else {
      console.log('User is not authenticated');
      // Clear and hide chat messages and navigation buttons for unauthenticated users
      displayChats([]);
      displayNavBtns();
    }
  });
});




function displayChats(chats, uid) {
  let html = '';

  chats.forEach((chat) => {
  

    html += `
      <div class="card chat_card">
        <div class="card_head">
          <div class="avatar">
            <img
              src="https://robohash.org/${chat.sender}?bgset=bg1&set=set3"
              alt="User Avatar with Background"
            />
          </div>
          <h4>${chat.sender}</h4>
        </div>
        <div class="content">
          <p>${chat.mssg ? chat.mssg : ''}</p>
          <video
            src="${chat.gift ? chat.gift : ''}"
            class="${chat.gift ? 'active' : ''}"
            muted="true"
            loop="true"
            autoplay="true"
          ></video>
        </div>
        <div class="reaction_btns">
          <div class="like">
            <button class="likechatBtn ${chat.likedBy.find(
              (id) => id.userID === uid
            ) ? 'liked' : ''}" data-id="${chat.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#000000" viewBox="0 0 256 256"><path d="M178,36c-21.44,0-39.92,10.19-50,27.07C117.92,46.19,99.44,36,78,36A58.07,58.07,0,0,0,20,94c0,28.59,18,58.47,53.4,88.79a333.81,333.81,0,0,0,52.7,36.73,4,4,0,0,0,3.8,0,333.81,333.81,0,0,0,52.7-36.73C218,152.47,236,122.59,236,94A58.07,58.07,0,0,0,178,36ZM128,211.42C114,203.46,28,152.07,28,94A50.06,50.06,0,0,1,78,44c21.11,0,38.85,11.31,46.3,29.51a4,4,0,0,0,7.4,0C139.15,55.31,156.89,44,178,44a50.06,50.06,0,0,1,50,50C228,152,142,203.46,128,211.42Z"></path></svg>
            </button>
            <span class="like-count">${chat.like ? chat.like : '0'}</span>
          </div>
          <div class="delete${chat.sender === chat.userCred ? 'active' : ''}">
            <button class="deletechatBtn" data-id="${chat.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#000000" viewBox="0 0 256 256"><path d="M216,52H40a4,4,0,0,0,0,8H52V208a12,12,0,0,0,12,12H192a12,12,0,0,0,12-12V60h12a4,4,0,0,0,0-8ZM196,208a4,4,0,0,1-4,4H64a4,4,0,0,1-4-4V60H196ZM84,24a4,4,0,0,1,4-4h80a4,4,0,0,1,0,8H88A4,4,0,0,1,84,24Z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // Set the HTML content of the section to the generated chat messages
  section.innerHTML = html;

  // Select all chat cards and apply further interactions
  allChats = document.querySelectorAll('section .card');
  getChats(allChats);
}
function getChats(chats) {
  chats.forEach((chat) => {
    const deleteChatBtn = chat.querySelector('.reaction_btns .deletechatBtn');
    const likeChatBtn = chat.querySelector('.reaction_btns .likechatBtn');

    deleteChatBtn.addEventListener('click', deleteChat);
    likeChatBtn.addEventListener('click', () => likeChat(chat));
  });
}

function deleteChat() {
  const chatID = this.dataset.id
  const chatRef = doc(db, 'chats', chatID)

  deleteDoc(chatRef).then(() => {
   console.log('chat deleted')
  }).catch((error) => {
   alert('failed to deleted chat', error)
  })


 }


 async function likeChat(chat) {
  const chatID = chat.querySelector('.likechatBtn').dataset.id;
  const chatRef = doc(db, 'chats', chatID);

  try {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      const snapshot = await getDoc(chatRef);

      if (snapshot.exists()) {
        const likedBy = snapshot.data().likedBy || [];
        const isLiked = likedBy.some((id) => id.userID === uid);

        if (!isLiked) {
          // User is liking the chat
          likedBy.push({ userID: uid });
          const like = snapshot.data().like + 1;

          await updateDoc(chatRef, {
            likedBy: likedBy,
            like: like,
          });

          console.log('Chat liked');
          chat.querySelector('.likechatBtn').classList.add('liked');
        } else {
          // User is unliking the chat
          const updatedLikedBy = likedBy.filter((id) => id.userID !== uid);
          const like = snapshot.data().like - 1;

          await updateDoc(chatRef, {
            likedBy: updatedLikedBy,
            like: like,
          });

          console.log('Chat unliked');
          chat.querySelector('.likechatBtn').classList.remove('liked');
        }
      } else {
        alert('Chat does not exist');
      }
    } else {
      alert('Please sign in to like a chat');
    }
  } catch (error) {
    alert('Error liking/unliking chat', error);
  }
}







const searchGiftInput = document.getElementById('searchGiftInput');
const gift_results = document.querySelector('.gift_results');


let GiftQuery = '';
let isLoading = false; // Track if a request is in progress

searchGiftInput.addEventListener('input', debounce(handleInput, 500));

async function handleInput() {
  const inputValue = searchGiftInput.value.trim();

  // Check if the input is not empty and is different from the current query
  if (inputValue && inputValue !== GiftQuery && !isLoading) {
    GiftQuery = inputValue;
    isLoading = true; // Set loading state
  } else if (!inputValue && !isLoading) {
    // If no query is provided, display random GIFs
    GiftQuery = 'sponge bob';
    isLoading = true; // Set loading state
  } else {
    return; // Do nothing if an API request is already in progress
  }

  try {
    const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=13mz57VDX3vtWq16fW9cWbHQZ0FI5zWz&q=${GiftQuery}&limit=30&offset=&rating=g&lang=en&bundle=messaging_non_clips`;
    const data = await fetch(endpoint);
    const json = await data.json();
    displayGift(json.data);
  } catch (error) {
    alert(error);
  } finally {
    isLoading = false; // Reset loading state
  }
}

function displayGift(gifts) {
  let html = '';
  gifts.forEach((gift) => {
    const src = gift.images.original.mp4;
    html += `
    <div class="gift">
      <video src="${src}" loop="true" autoplay="true" muted="true" loading="lazy"></video>
    </div>`;
  });

  gift_results.innerHTML = html
 const allGifts = document.querySelectorAll('.gift_results video');
 getGifts(allGifts);
}

  

function getGifts(allGifts) {


allGifts.forEach((gift) => {
  gift.addEventListener('click', () => {
    const src = gift.src;

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, 'users', uid);

        getDoc(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const sender = snapshot.data().username;
              addGiftToFirestore(src, sender, uid);
            } else {
              console.log("No such document!");
            }
          })
          .catch((error) => {
            alert("Error getting document:", error);
          });
      } else {
        alert('Sign up or sign in to send a message.');
      }
    });
  });
});

}

function addGiftToFirestore(giftSrc, sender, uid) {
  const chatRef = collection(db, 'chats');

  addDoc(chatRef, {
    gift: giftSrc,
    sender: sender,
    like: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
  })
    .then(() => {
      console.log("Gift sent successfully!");
      gift_container.classList.remove('active');
    })
    .catch((error) => {
      alert("Error sending gift: ", error);
      // Handle and display the error to the user
    });
}


// Debounce function
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Get DOM elements
const openGiftContainer = document.querySelector('.openGiftContainer');
const gift_container = document.querySelector('.gift_container');

// Add click event listener to openGiftContainer
openGiftContainer.addEventListener('click', () => {
  if (gift_container.classList.contains('active')) {
    // If the gift container is active, remove the 'active' class to hide it
    gift_container.classList.remove('active');
  } else {
    // If the gift container is not active, add the 'active' class to show it
    gift_container.classList.add('active');
    // Call the handleInput function when opening the gift container
    handleInput();
  }
});
