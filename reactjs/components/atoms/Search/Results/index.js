import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchTabs from '../Tabs';
import Empty from '../Empty';
import LessonItem from '../LessonItem';
import CommentItem from '../CommentItem';
import NotebookItem from '../NotebookItem';
import ResourceItem from '../ResourceItem';
import SearchLoader from '../Loader';
import MediaItem from '../MediaItem';
import * as searchActions from '../../../../actions/search';

class SearchResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTabsBorder: false,
      isOpenedFirstTime: true,
    };

    // Use an additional variable because we can't get value from prevState in DidUpdate,
    // because we update the component only when fetching has finished.
    this.currentTab = 'all';

    this.toggleTabsBorder = this.toggleTabsBorder.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.onTouch = this.onTouch.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    // Don't rerender results list if search in progress.
    return !nextProps.isFetching;
  }

  /**
   * Use deprecated method here instead of new getDerivedStateFromProps because
   * nextjs doesn't support it yet https://github.com/zeit/next.js/pull/4090.
   * @todo: update when nextjs can be update to the stable 6.0.4 version.
   */
  componentWillUpdate(nextProps, nextState) {
    if (nextState.isOpenedFirstTime && nextProps.query.length > 1) {
      nextState.isOpenedFirstTime = false;
    }
  }

  componentDidUpdate(prevProps) {
    const { dispatch, isLoadMoreFetching, results, category } = this.props;
    const itemsPerPage = 7;

    // Scroll user to the top of the results when he switched the category tab.
    if (this.currentTab !== category) {
      this.currentTab = category;
      document.getElementById('search-results-scroll').scrollTop = 0;
    }

    // If browser window height is bigger than list height of first loaded items,
    // we make a request to get a second portion.
    if (!prevProps.isLoadMoreFetching && !isLoadMoreFetching && results.length === itemsPerPage) {
      const scrollAreaHeight = document.getElementById('search-results-scroll').offsetHeight;
      const listHeight = document.getElementById('search-results-list').offsetHeight;
      if (scrollAreaHeight > listHeight) {
        dispatch(searchActions.loadMore());
      }
    }
  }

  /**
   * Remove focus from search input when user scroll on mobile (to hide keyboard).
   */
  onTouch() {
    const searchInput = document.getElementById('search-bar-input');
    if (document.activeElement === searchInput) {
      searchInput.blur();
    }
  }

  /**
   * Returns Component by given type and category.
   */
  getSearchComponent(type, category) {
    const components = {
      'lesson': category === 'media' ? MediaItem : LessonItem,
      'paragraph_comment': CommentItem,
      'notebook': NotebookItem,
      'media_resource': ResourceItem,
    };
    return components[type] ? components[type] : null;
  }

  /**
   * Click tab link.
   */
  tabClick(category) {
    const { query, dispatch, activeOrganization } = this.props;
    dispatch(searchActions.fetch(query, activeOrganization, category));
  }

  /**
   * Request another piece of search results.
   */
  loadMore() {
    const { dispatch, isFetching, isLoadMoreFetching } = this.props;
    if (!isFetching && !isLoadMoreFetching) {
      dispatch(searchActions.loadMore());
    }
  }

  /**
   * Show border under tabs when user scroll down.
   */
  toggleTabsBorder() {
    const tabs = document.getElementById('search-tabs');
    const list = document.getElementById('search-results-list');
    const tabsBottom = tabs.getBoundingClientRect().bottom;

    if (!this.state.showTabsBorder && list.getBoundingClientRect().top < tabsBottom) {
      this.setState({ showTabsBorder: true });
    }
    else if (this.state.showTabsBorder && list.getBoundingClientRect().top >= tabsBottom) {
      this.setState({ showTabsBorder: false });
    }
  }

  render() {
    const { category, query, results, isError, isLoadMoreFetching } = this.props;
    const { isOpenedFirstTime } = this.state;

    return (
      <div className="search-container" onTouchStart={this.onTouch}>
        {!isOpenedFirstTime &&
        <SearchTabs
          activeTab={category}
          onTabClick={this.tabClick}
          showBorder={this.state.showTabsBorder}
        />
        }

        <div className="search-results">
          <Scrollbars
            style={{ height: '100%' }}
            onScroll={this.toggleTabsBorder}
            renderView={props => <div {...props} id="search-results-scroll" />}
          >
            <InfiniteScroll
              dataLength={results.length}
              next={this.loadMore}
              hasMore
              scrollableTarget="search-results-scroll"
            >
              <div id="search-results-list" className="inner-wrapper">
                <div className="inner">

                  {!isError && results.length > 0 &&
                  <div className="list">
                    {results.map(resultItem => {
                      // eslint-disable-next-line max-len
                      const SearchItemComponent = this.getSearchComponent(resultItem.type, category);
                      if (SearchItemComponent) {
                        // eslint-disable-next-line max-len
                        return <SearchItemComponent key={resultItem.entity.uuid} searchItem={resultItem} />;
                      }

                      return null;
                    })}

                    {isLoadMoreFetching &&
                    <div className="load-more-loader"><SearchLoader /></div>
                    }
                  </div>
                  }

                  {!isOpenedFirstTime && query.length > 1 && results.length === 0 && !isError &&
                  <Empty />
                  }

                  {isError &&
                  <div className="search-error">
                    {/* eslint-disable-next-line max-len */}
                    The error has occurred. Please try to reload the page or contact site administrator.
                  </div>
                  }
                </div>
              </div>

            </InfiniteScroll>
          </Scrollbars>
        </div>
      </div>
    );
  }
}

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape),
  query: PropTypes.string,
  category: PropTypes.oneOf(['all', 'media', 'resources']),
  isFetching: PropTypes.bool,
  isFetched: PropTypes.bool,
  isError: PropTypes.bool,
  isLoadMoreFetching: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  activeOrganization: PropTypes.number,
};

SearchResults.defaultProps = {
  results: [],
  query: '',
  category: 'all',
  isFetching: false,
  isFetched: false,
  isError: false,
  isLoadMoreFetching: false,
  activeOrganization: null,
};

const mapStateToProps = ({ search, user }) => ({
  query: search.query,
  category: search.category,
  results: search.results,
  isFetching: search.isFetching,
  isFetched: search.isFetched,
  isError: search.isError,
  isLoadMoreFetching: search.isLoadMoreFetching,
  activeOrganization: user.activeOrganization,
});

export default connect(mapStateToProps)(SearchResults);
