const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const users = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filterUsers = []
const paginator = document.querySelector('#paginator')
const USER_PER_PAGE = 30 // 一頁畫面有30個user
const messageIconArea = document.querySelector('#message-icon-area')



// 整個畫面的渲染
function renderUsersList(data) {
  let rawHTML = "";
  data.forEach((item) => {

    rawHTML += `
    <div class="col-sm-2">
        <div class="mb-2">
    <div class="card">
      <a href=""><img src="${item.avatar}" class="card-img-top" data-id="${item.id}" alt="User Avatar" data-bs-toggle="modal" data-bs-target="#user-modal"></a>
      <div class="card-body" >
        <p class="card-text">${item.name} ${item.surname} </p>
        
      </div>
    </div>
     </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// modal視窗裡面顯示的資料
function showUserModal(id) {
  const modalAvatar = document.querySelector("#user-modal-avatar");
  const modalName = document.querySelector("#user-modal-name");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalBirthday = document.querySelector("#user-modal-birthday");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector('#user-modal-region')
  const modalEmail = document.querySelector("#user-modal-email");

  axios.get(INDEX_URL + id).then((response) => {
    console.log(response);
    const data = response.data;
    // console.log(response.data.name);
    modalName.innerText = data.name + " " + data.surname;
    modalAvatar.innerHTML = `<img src="${data.avatar}" alt="User Avatar" class="img-fluid">`;
    modalGender.innerText = `Gender:  ${data.gender}`;
    modalBirthday.innerText = `Birthday:  ${data.birthday}`;
    modalAge.innerText = `Age:  ${data.age}`;
    modalRegion.innerText = `Region:  ${data.region}`
    modalEmail.innerHTML = `<a href="mailto:${data.email}" target="_blank"> ${data.email}</a>`;
  });
}

// 如果按下大頭照則跳出modal視窗
dataPanel.addEventListener("click", function (event) {
  event.preventDefault()
  const target = event.target;
  // console.log(target);
  // console.log(target.dataset);
  if (target.matches(".card-img-top")) {
    // console.log(target.dataset.id);
    showUserModal(Number(target.dataset.id));
  }
});

// 搜尋欄按下Search鍵即可搜尋朋友
searchForm.addEventListener('submit', function (event) {
  event.preventDefault() // 取消事件的預設行為
  filterUsers = [] // 只要按下搜尋鍵就歸零重整
  const keyword = searchInput.value.trim().toLowerCase()
  filterUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  if (filterUsers.length === 0) {
    alert(`The name you entered: ${keyword}\nNo matching search results`)
    searchInput.value = "" // 如果沒有符合的結果則搜尋欄內的值清空
    return renderPaginator(users.length) // 跑回原本的分頁器
  }
  renderUsersList(getUsersByPage(1))
  renderPaginator(filterUsers.length)
})

// 搜尋欄輸入文字即可一邊看到篩選結果
searchForm.addEventListener('input', function (event) {
  event.preventDefault() // 取消事件的預設行為
  filterUsers = [] // 只要按下搜尋鍵就歸零重整
  const keyword = searchInput.value.trim().toLowerCase()
  for (const user of users) {
    if (user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)) {
      filterUsers.push(user)
    }
  }
  renderUsersList(getUsersByPage(1))
  renderPaginator(filterUsers.length)
})

// 畫面一頁只顯示30個好友
function getUsersByPage(page) {
  // (三元運算子)如果搜尋清單有東西，就取搜尋清單filterUsers，否則就還是取總清單users
  const data = (filterUsers.length) ? filterUsers : users
  const startIndex = (page - 1) * USER_PER_PAGE
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

// 點擊分頁器進行跳頁
paginator.addEventListener('click', function (event) {
  let target = event.target
  if (target.tagName !== 'A') return
  const page = Number(target.dataset.page)
  renderUsersList(getUsersByPage(page))
})


// 計算分頁器有幾頁
function renderPaginator(amount) {
  const numbersOfPage = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numbersOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}


// 右下角Messenger圖示
messageIconArea.addEventListener('click', function (event) {
  let target = event.target
  const formInput = document.querySelector('#exampleFormControlInput1')
  const formText = document.querySelector('#exampleFormControlTextarea1')
  const sendModalTitle = document.querySelector('#send-button-modal-title')
  const sendModalContent = document.querySelector('#send-button-modal-content')
  const offCanvas = document.querySelector('#offcanvasRight')
  if (target.matches('.fa-facebook-messenger')) {
    event.preventDefault()
  }
  // 如果使用者有在訊息欄內輸入收件人&訊息內容
  if (target.matches('#send-button') && formInput.value.length !== 0 && formText.value.length !== 0) {
    // 按下send鍵後跳出通知
    sendModalTitle.innerHTML = `Notice:`
    sendModalContent.innerText = `Message has been sent!`
    // 輸入欄的值清空
    formInput.value = ''
    formText.value = ''
    // 如果使用者沒有在訊息欄內輸入收件人&訊息內容
  } else {
    sendModalTitle.innerHTML = `Alert:`
    sendModalContent.innerText = `You should input something.`
  }

})





axios
  .get(INDEX_URL)
  .then(function (response) {
    //console.log(response);
    users.push(...response.data.results);
    //console.log(users)
    renderUsersList(getUsersByPage(1));
    renderPaginator(users.length)
  })
  .catch(function (err) {
    console.log(err);
  });