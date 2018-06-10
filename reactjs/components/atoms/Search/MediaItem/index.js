import React from 'react';
import PropTypes from 'prop-types';
import SearchItem from '../Item';
import Icon from '../../Icons/Lesson';

const MediaItem = ({ searchItem }) => {
  const { entity, type } = searchItem;
  const { title, url } = entity;

  // Prepares list of media urls.
  const urls = entity.blocks.map(block => {
    let mediaUrl = null;
    if (block.type === 'image_centered_caption') {
      mediaUrl = block.image.uri.url;
    }
    else if (block.type === 'media_video') {
      mediaUrl = block.url.uri;
    }
    return mediaUrl;
  });

  return (
    <SearchItem
      icon={Icon}
      title={`<span class="thin">From</span> ${title}`}
      body={urls.join('<br /> ')}
      className={type}
      itemLink={url}
    />
  );
};

MediaItem.propTypes = {
  searchItem: PropTypes.shape({
    type: PropTypes.string,
    excerpt: PropTypes.string,
    entity: PropTypes.object,
  }).isRequired,
};

export default MediaItem;
