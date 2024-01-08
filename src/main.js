import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';
import errorSvg from '/img/error.svg';

axios.defaults.baseURL = 'https://pixabay.com/api/';

let limit;

const searchParams = {
  key: '41647148-76dbe9dab66bab2692c283b6e',
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

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!searchInput.value.trim()) {
    showErrorMessage('Please fill in the search field');
    return;
  }
  try {
    gallery.innerHTML = '';
    loader.style.display = 'inline-block';
    searchParams.q = searchInput.value.trim();
    searchParams.page = 1;
    const data = await fetchPhotos();
    limit = data.totalHits;
    createGallery(data);
  } catch (error) {
    console.log(error);
  }
});

loadMoreBtn.addEventListener('click', async () => {
  try {
    loader.style.display = 'inline-block';
    const photos = await fetchPhotos();
    createGallery(photos);
  } catch (error) {
    console.log(error);
  }
});

async function fetchPhotos() {
  const response = await axios.get('', { params: searchParams });
  return response.data;
}

function createGallery(photos) {
  if (!photos.total) {
    showErrorMessage(
      'Sorry, there are no images matching your search query. Please, try again!'
    );
    loader.style.display = 'none';
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
  loader.style.display = 'none';
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
    loadMoreBtn.style.display = 'none';
  } else {
    searchParams.page += 1;
    loadMoreBtn.style.display = 'inline-block';
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
