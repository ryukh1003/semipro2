const hamBtn = document.querySelector('.ham');
const gnb = document.querySelector('header .gnb');
const listCon = document.querySelector('.listCon');
const modal = document.querySelector('.modalBack');
const header = document.querySelector('header');

let recipeList = [];
let total_count = 0;
let itemPerView = 15;
let page = 1;
let groupSize = 5;
let currentPage = 1;

let startIdx = (page - 1) * itemPerView + 1;
let endIdx = page * itemPerView;

hamBtn.addEventListener('click', () => {
  gnb.classList.toggle('on');
});

window.addEventListener('scroll', function () {
  if (window.scrollY > 0) {
    header.classList.add('on');
  } else {
    header.classList.remove('on');
  }
});

const API_KEY = '9b9d1da9843446bd8c23';

const fetchFromApi = async (url, category = '밥') => {
  url.searchParams.append('RCP_PAT2', category);

  const response = await fetch(url);
  const data = await response.json();
  total_count = data.COOKRCP01.total_count;
  console.log('---------------------', data);
  recipeList = data.COOKRCP01.row;
  renderRecipe(recipeList);
  pagination(category);
};

const fetchFromApi2 = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data.COOKRCP01.row;
};

const searchRecipe = (search) => {
  startIdx = 1;
  endIdx = 20;
  page = 1;
  const url = new URL(
    `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIdx}/${endIdx}/RCP_NM=${search}`
  );
  fetchFromApi(url);
};

document.querySelector('.searchBtn').addEventListener('click', () => {
  const search = document.querySelector('.inputArea>input').value;
  searchRecipe(search);
  document.querySelector('.inputArea>input').value = '';
});

document.querySelector('.inputArea>input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const search = document.querySelector('.inputArea>input').value;
    searchRecipe(search);
    document.querySelector('.inputArea>input').value = '';
  }
});

const getRecipe = () => {
  const url = new URL(
    `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIdx}/${endIdx}`
  );
  fetchFromApi(url);
  console.log('getURL', url);
};

const recipeCate = (category) => {
  const url = new URL(
    `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIdx}/${endIdx}/RCP_PAT2=${category}`
  );
  fetchFromApi(url, category);
};

gnb.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  let category = li.dataset.cate;
  recipeCate(category);
  page = 1;
});

const modalCreate = async (rcpName) => {
  const url = new URL(
    `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIdx}/${endIdx}/RCP_NM=${rcpName}`
  );
  let recipeList = await fetchFromApi2(url);
  renderManual(recipeList);
};

listCon.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  let rcpName = li.querySelector('.dishName').textContent;
  console.log(rcpName);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  modalCreate(rcpName);
});

modal.addEventListener('click', function (e) {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

const createHtml = (recipe) => {
  let filenomain = recipe.ATT_FILE_NO_MAIN || '../img/noimg.png';
  let rcpnm = recipe.RCP_NM || '이름 다 있음';
  let hashtag = recipe.HASH_TAG || '';
  let hashway = recipe.RCP_WAY2 || '이것도 다 있음';
  let hashpat = recipe.RCP_PAT2 || '이것도 다 있음';
  let html = ` 
    <li>
      <div class="manualImg">
        <img src="${filenomain}" alt="${rcpnm}" />
      </div>
      <div class="cardText">
        <span class="hashTag">${hashtag}</span>
        <span class="hashWay">${hashway}</span>
        <span class="hashPat">${hashpat}</span>
        <strong class="dishName">${rcpnm}</strong>
      </div>
  </li>`;

  if (!hashtag) {
    const selectDiv = document.createElement('div');
    selectDiv.innerHTML = html;
    const selectHash = selectDiv.querySelector('.hashTag');
    if (selectHash) {
      selectHash.style.display = 'none';
    }
    html = selectDiv.innerHTML;
  }

  return html;
};

const createRecipe = (recipe) => {
  let filenomain = recipe.ATT_FILE_NO_MAIN || '../img/noimg.png';
  let rcpnm = recipe.RCP_NM || '이름 다 있음';
  let rcpDetail = recipe.RCP_PARTS_DTLS || '없음';
  let infoNa = recipe.INFO_NA || '-';
  let infoPro = recipe.INFO_PRO || '-';
  let rcpTip = recipe.RCP_NA_TIP || '-';
  let manuals = '';

  for (let i = 1; recipe['MANUAL0' + i] !== undefined; i++) {
    if (recipe['MANUAL0' + i] === '') {
      break;
    }
    manuals += `<div class="explain">
                  <div class="explainText">
                      <div class="|">
                          <p>${recipe['MANUAL0' + i]}</p>
                      </div>
                  </div>
                  <div class="mimgBox">
                    <img src="${
                      recipe['MANUAL_IMG0' + i]
                    }" alt="#" || '../img/noimg.png'/>
                  </div>
                </div>`;
  }

  return `           
  <div class="upperBox">
    <div class="imgBox">
      <img src="${filenomain}" alt="${rcpnm}" />
    </div>
    <div class="textBox1">
      <p>${rcpDetail}</p>
      <p>${rcpTip}</p>
      <div class="spanbox">
        <span>나트륨 : ${infoNa}</span>
        <span>단백질 : ${infoPro}</span>
      </div>
    </div>
  </div>
  <div class="lowerBox">
    ${manuals}
  </div>`;
};

// pagination

const moveToPage = async (pageNum, category) => {
  page = pageNum;
  startIdx = (page - 1) * itemPerView + 1;
  endIdx = page * itemPerView;
  console.log(
    `moveToPage --------------------: startIdx=${startIdx}, endIdx=${endIdx}`
  );
  const url = new URL(
    `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${startIdx}/${endIdx}/RCP_PAT2=${category}`
  );

  console.log('url 확인', url);
  await fetchFromApi(url, category);
};

const moveToPrevGroup = (category) => {
  let pageGroup = Math.ceil(page / groupSize);
  if (pageGroup > 1) {
    moveToPage((pageGroup - 2) * groupSize + 1, category);
  }
};

const moveToNextGroup = (category) => {
  let pageGroup = Math.ceil(page / groupSize);
  let totalPage = Math.ceil(total_count / itemPerView);
  if (pageGroup * groupSize < totalPage) {
    moveToPage(pageGroup * groupSize + 1, category);
  }
};

const pagination = (category) => {
  console.log('category -- ', category);
  let pageGroup = Math.ceil(page / groupSize);
  let currentPage = page;

  let lastPage = Math.min(
    Math.ceil(total_count / itemPerView),
    pageGroup * groupSize
  );
  let firstPage = (pageGroup - 1) * groupSize + 1;
  let totalPage = Math.ceil(total_count / itemPerView);

  let paginationHtml = `<button class="prevGroup"  ${
    pageGroup == 1 ? 'disabled' : ''
  } onclick="moveToPrevGroup('${category}')"><i class="fa-solid fa-backward"></i></button>`;

  paginationHtml += `<button class="prev" ${
    currentPage == 1 ? 'disabled' : ''
  } onclick="moveToPage(${
    currentPage - 1
  },  '${category}')"><i class="fa-solid fa-angle-left"></i></button>`;

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHtml += `<button class="${
      i == page ? 'on' : ''
    }" onclick="moveToPage(${i}, '${category}')">${i}</button>`;
  }

  paginationHtml += `<button class="next" ${
    pageGroup * groupSize >= totalPage ? 'disabled' : ''
  } onclick="moveToPage(${
    currentPage + 1
  },  '${category}')"><i class="fa-solid fa-angle-right"></i></button>`;

  paginationHtml += `<button class="nextGroup"  ${
    pageGroup * groupSize >= totalPage ? 'disabled' : ''
  } onclick="moveToNextGroup('${category}')"><i class="fa-solid fa-forward"></i></button>`;

  document.querySelector('.pgCon').innerHTML = paginationHtml;
  console.log(page);
};

const renderRecipe = (recipeList) => {
  console.log(recipeList);
  if (!Array.isArray(recipeList)) {
    console.error('배열이 아닙니다.');
    document.querySelector('.listCon').innerHTML = '검색 결과가 없습니다.';
    return;
  }
  if (recipeList.length === 0) {
    document.querySelector('.listCon').innerHTML = '검색 결과가 없습니다.';
    return;
  }
  const recipeHtml = recipeList.map((recipe) => createHtml(recipe)).join('');
  document.querySelector('.listCon').innerHTML = recipeHtml;
};

const renderManual = (recipeList) => {
  const menualHtml = recipeList.map((recipe) => createRecipe(recipe)).join('');
  document.querySelector('.mmw').innerHTML = menualHtml;
};

getRecipe();
