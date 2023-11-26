const renderError = (value) => {
  const errorElement = document.querySelector('p.feedback');
  errorElement.textContent = '';
  if (!value) {
    return;
  }
  errorElement.textContent = value;
};

export default (path, value) => {
  switch (path) {
    case 'inputError':
      renderError(value);
      break;
    default:
  }
};
