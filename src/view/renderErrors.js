import i18next from 'i18next';

const renderErrors = ({ form: { errors } }, elements) => {
  const { feedback } = elements;
  if (!errors.length) {
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
  } else {
    errors.forEach((err) => {
      feedback.textContent = i18next.t(`errors.${err.message}`);
      feedback.classList.add('text-danger');
    });
  }
};

export default renderErrors;
