import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'invalid-url',
  },
  mixed: {
    default: 'Invalid',
    notOneOf: 'rss already exist',
  },
});

const validateUrl = ({ rssLinks }) => {
  const schema = yup.object().shape({
    url: yup.string()
      .url()
      .notOneOf(rssLinks)
      .required(),
  });
  return schema;
};

export default validateUrl;
