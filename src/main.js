import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';
import errorSvg from '/img/error.svg';

const API_BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '41647148-76dbe9dab66bab2692c283b6e';

axios.defaults.baseURL = API_BASE_URL;

let limit;

const searchParams = {
  key: API_KEY,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
  page: 1,
};

const simpleGallery = new SimpleLightbox('.gallery a', {
  overlayOpacity: 0.8,
  captionsData: 'alt',
  captionDelay: 500,
});

const form = document.querySelector('.gallery-form');
const searchInput = document.querySelector('.search-input');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more-btn');

async function startSearch(event) {
  event.preventDefault();
  if (!searchInput.value.trim()) {
    showErrorMessage('Please fill in the search field');
    return;
  }
  try {
    gallery.innerHTML = '';
    isContentVisible(loader, true);
    isContentVisible(loadMoreBtn, false);
    searchParams.q = searchInput.value.trim();
    searchParams.page = 1;
    const data = await fetchPhotos();
    limit = data.totalHits;
    createGallery(data);
  } catch (error) {
    console.log(error);
  }
}

async function loadMore() {
  try {
    isContentVisible(loader, true);
    isContentVisible(loadMoreBtn, false);
    const photos = await fetchPhotos();
    createGallery(photos);
  } catch (error) {
    console.log(error);
  }
}

async function fetchPhotos() {
  const response = await axios.get('', { params: searchParams });
  return response.data;
}

function createGallery(photos) {
  if (!photos.total) {
    showErrorMessage(
      'Sorry, there are no images matching your search query. Please, try again!'
    );
    isContentVisible(loader, false);
    return;
  }
  const markup = photos.hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
        <img class="api-img" src="${webformatURL}" alt="${tags}">
        <div class="img-desc">
        <span><b>Likes:</b> <br/>${likes}</span>
        <span><b>Views:</b> <br/>${views}</span>
        <span><b>Comments:</b> <br/>${comments}</span>
        <span><b>Downloads:</b> <br/>${downloads}</span>
        </div>
        </a>
        </li>
        `;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  isContentVisible(loader, false);
  checkLimit();
  scrollPage();
  simpleGallery.refresh();
  form.reset();
}

function checkLimit() {
  if (Math.ceil(limit / searchParams.per_page) === searchParams.page) {
    showErrorMessage(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    searchParams.page += 1;
    isContentVisible(loadMoreBtn, true);
  }
}

function isContentVisible(content, isVisible) {
  if (isVisible) {
    content.classList.remove('hidden');
  } else {
    content.classList.add('hidden');
  }
}

function scrollPage() {
  if (searchParams.page > 1) {
    const rect = document
      .querySelector('.gallery-item')
      .getBoundingClientRect();
    window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
  }
}

function showErrorMessage(message) {
  iziToast.show({
    position: 'topRight',
    iconUrl: errorSvg,
    message,
    backgroundColor: '#EF4040',
    messageColor: '#FAFAFB',
    messageSize: '16px',
    close: false,
    closeOnClick: true,
    closeOnEscape: true,
  });
}

form.addEventListener('submit', event => startSearch(event));

loadMoreBtn.addEventListener('click', () => loadMore());
