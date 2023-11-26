import i18n from 'i18next';

const renderError = (value) => {
  const errorElement = document.querySelector('p.feedback');
  errorElement.textContent = '';
  if (!value) {
    return;
  }
  errorElement.textContent = i18n.t(`inputErrors.${value}`);
};

export default (path, value) => {
  switch (path) {
    case 'inputError':
      renderError(value);
      break;
    default:
  }
};
