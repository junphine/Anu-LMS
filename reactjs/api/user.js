import * as dataProcessors from '../utils/dataProcessors';

/**
 * Fetch current user.
 */
export const fetchCurrent = request => new Promise((resolve, reject) => {
  request
    .get('/user/me')
    .query({ '_format': 'json' })
    .then(response => {
      const user = dataProcessors.userData(response.body);
      resolve(user);
    })
    .catch(error => {
      console.error('Could not fetch current user.', error);
      reject(error);
    });
});

/**
 * Fetch tagged users.
 */
export const fetchTaggedUsers = (request, query, organizationId) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  request
    .get('/user/tagged')
    .query({
      'query': query,
      'organization_id': organizationId,
      '_format': 'json',
    })
    .then(response => {
      const comments = response.body.map(user => dataProcessors.userData(user));
      resolve(comments);
    })
    .catch(error => {
      console.error('Could not fetch tagged users.', error);
      reject(error);
    });
});

/**
 * Update user data.
 */
export const update = (request, uuid, data) => new Promise((resolve, reject) => {
  request
    .patch(`/jsonapi/user/user/${uuid}`)
    .send({
      data: {
        type: 'user--user',
        id: uuid,
        attributes: data,
      },
    })
    .then(response => {
      const user = dataProcessors.userData(response.body.data);
      resolve(user);
    })
    .catch(error => {
      console.error('Could not update user data.', error);
      reject(error);
    });
});

/**
 * Update password of user.
 */
export const updatePassword = (request, uuid, password, passwordNew) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  request
    .patch(`/jsonapi/user/user/${uuid}`)
    .send({
      data: {
        type: 'user--user',
        id: uuid,
        attributes: {
          pass: {
            existing: password,
            value: passwordNew,
          },
        },
      },
    })
    .then(() => {
      resolve();
    })
    .catch(error => {
      console.error('Could not update user password.', error);
      reject(error);
    });
});

/**
 * Validate registration token.
 */
export const validateRegistrationToken = (request, token) => new Promise((resolve, reject) => {
  request
    .get(`/user/register/validate/${token}`)
    .query({ '_format': 'json' })
    .then(response => {
      resolve(response.body);
    })
    .catch(error => {
      console.error('Could not validate registration link.', error);
      reject(error);
    });
});

/**
 * Register a new user.
 */
export const registerUser = (request, data) => new Promise((resolve, reject) => {
  request
    .post('/user/registration')
    .set('Content-Type', 'application/json')
    .query({ '_format': 'json' })
    .send({
      ...data,
    })
    .then(response => {
      const user = dataProcessors.userData(response.body);
      resolve(user);
    })
    .catch(error => {
      console.error('Could register user.', error);
      reject(error);
    });
});
