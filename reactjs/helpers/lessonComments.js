import Debug from 'debug';

const debug = Debug('anu:lessonCommentsHelper');

/**
 * Returns comment by given id.
 */
export const getCommentById = (comments, id) => {
  const index = comments.findIndex(comment => comment.id === id);
  return index !== -1 ? comments[index] : null;
};

/**
 * Returns true if comment has children comments.
 */
export const hasChildrenComments = (comments, id) => {
  const index = comments.findIndex(comment => comment.parentId === id);
  return index !== -1;
};

/**
 * Converts flat list of comments to 2 level nested list.
 *
 * [
 *  [id => 1],
 *  [id => 2, parent => 1],
 *  [id => 3, parent => 2],
 *  [id => 4],
 * ];
 * converts to:
 * [
 *  [id => 1, children => [id => 2, id => 3]],
 *  [id => 4],
 * ];
 */
function getThreadedCommentsList(comments) {
  const tree = [];
  const rootOf = {};
  const processed = {}; // Processed items (itemId => rootId);
  debug('comments', comments);

  // Recursive function to find root Id (parent element without parent).
  // Run through elements from children to the root parent
  // adds elements to the rootOf array and returns root element id.
  const findRootId = item => {
    if (item.parentId) {
      // Returns Root Id if item has been already processed.
      if (processed[item.id]) {
        return processed[item.id];
      }

      // Get parent comment object.
      const parent = getCommentById(comments, item.parentId);
      debug('parent', parent, comments, item);

      if (!parent) {
        console.error(`Wrong structure of comments. Comment id: ${item.id}`);
        return; // eslint-disable-line consistent-return
      }

      // Get root id of parent comments (recursively to get root of nested comments).
      const rootId = findRootId(parent);
      debug('findRootId', item.id, parent.id, rootId);

      if (!rootId) {
        return; // eslint-disable-line consistent-return
      }

      // Save some parent data to current element to use it in render.
      item.parent = {
        id: parent.id,
        author: parent.author,
      };

      // Adds element to rootOf array.
      rootOf[rootId] = rootOf[rootId] || [];
      rootOf[rootId].push(item);

      // Adds element to processed array to skip process later.
      processed[item.id] = rootId;

      return rootId;
    }

    return item.id;
  };

  for (let i = 0; i < comments.length; i += 1) {
    if (!comments[i]) {
      console.error('Wrong structure of comments.');
      continue; // eslint-disable-line no-continue
    }

    const item = comments[i];
    // Skip processed elements, they've already added to rootOf array in findRootId function.
    if (processed[item.id]) {
      continue; // eslint-disable-line no-continue
    }

    if (!item.parentId) {
      // Initialize rootOf element.
      rootOf[item.id] = rootOf[item.id] || [];

      // Adds link from rootOf array to children array.
      item.children = rootOf[item.id] || [];

      // Adds root element to the tree.
      tree.push(item);
    }
    else {
      findRootId(item);
    }
  }
  debug('rootOf', rootOf);
  debug('processed', processed);
  debug('tree', tree);

  return tree;
}

/**
 * Converts flat list of comments to ordered 2 level nested list.
 */
export const getOrderedComments = comments => {
  // Converts flat list of comments to 2 level nested.
  const threadedComments = getThreadedCommentsList(comments);

  // Sort children comments from newlest to oldest.
  threadedComments.forEach(element => {
    element.children.sort((a, b) => (a.created - b.created));
  });

  // Sort root comments from newlest to oldest.
  return threadedComments.sort((a, b) => (a.created - b.created));
};
