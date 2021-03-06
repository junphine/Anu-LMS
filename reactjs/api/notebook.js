import * as dataProcessors from '../utils/dataProcessors';

/**
 * Fetch notes from the backend.
 */
export const fetchNotes = (request, uid) => new Promise((resolve, reject) => {
  request
    .get('/jsonapi/notebook/notebook')
    .query({
      // Filter notes by current user.
      'filter[uid][value]': uid,
      // Sort by changed date. Here we sort in the reverse
      // order from what we need, because in the reducer all new notes
      // get added to the start of the queue, which will make the final
      // order of the notes on the page correct.
      'sort': 'changed',
    })
    .then(response => {
      const notes = dataProcessors.notebookListData(response.body.data);
      resolve(notes);
    })
    .catch(error => {
      console.error('Could not fetch notes.', error);
      reject(error);
    });
});

/**
 * First time save the note on the backend.
 */
export const createNote = (request, title = '', body = '') => new Promise((resolve, reject) => {
  request
    .post('/jsonapi/notebook/notebook')
    .send({
      data: {
        type: 'notebook--notebook',
        attributes: {
          field_notebook_title: title,
          field_notebook_body: {
            value: body,
            format: 'filtered_html',
          },
        },
      },
    })
    .then(response => {
      const note = dataProcessors.notebookData(response.body.data);
      resolve(note);
    })
    .catch(error => {
      console.error('Could not save the note.', error);
      reject(error);
    });
});

/**
 * Update the existing note on the backend.
 */
export const updateNote = (request, title, body, uuid) => new Promise((resolve, reject) => {
  request
    .patch(`/jsonapi/notebook/notebook/${uuid}`)
    .send({
      data: {
        type: 'notebook--notebook',
        id: uuid,
        attributes: {
          field_notebook_title: title,
          field_notebook_body: {
            value: body,
            format: 'filtered_html',
          },
        },
      },
    })
    .then(response => {
      const note = dataProcessors.notebookData(response.body.data);
      resolve(note);
    })
    .catch(error => {
      console.error('Could not update the note.', error);
      reject(error);
    });
});

/**
 * Remove the note from the backend.
 */
export const deleteNote = (request, uuid) => new Promise((resolve, reject) => {
  request
    .delete(`/jsonapi/notebook/notebook/${uuid}`)
    .send()
    .then(() => {
      resolve();
    })
    .catch(error => {
      console.error('Could not delete the note.', error);
      reject(error);
    });
});
