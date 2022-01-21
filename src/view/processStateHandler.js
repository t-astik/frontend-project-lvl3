import i18next from 'i18next';

const renderSuccess = (message, elements) => {
  const { feedback } = elements;
  feedback.innerHTML = '';
  feedback.textContent = i18next.t(`success.${message}`);
  feedback.classList.add('text-success');
};

export default function processStateHandler({ form: { processState } }, elements) {
  const { input, submit } = elements;

  switch (processState) {
    case ('filling'):
      input.readOnly = false;
      submit.disabled = false;
      break;
    case ('sending'):
      input.readOnly = true;
      submit.disabled = true;
      break;
    case ('finished'):
      renderSuccess(processState, elements);
      input.readOnly = false;
      input.value = '';
      submit.disabled = false;
      break;
    case ('failed'):
      // removeFeedback();
      input.readOnly = false;
      submit.disabled = false;
      break;
    default:
      throw new Error(`Unknow state: ${processState}`);
  }
}
