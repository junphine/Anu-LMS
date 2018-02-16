import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

class EditableElement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isPlaceholderVisible: false,
    };

    this.handleElementChange = this.handleElementChange.bind(this);
    this.handleElementBlur = this.handleElementBlur.bind(this);
    this.handlePlaceholderClick = this.handlePlaceholderClick.bind(this);
  }

  componentDidMount() {
    this.refs.element.innerText = this.props.initialValue;
    if (!this.props.initialValue) {
      this.setState({ isPlaceholderVisible: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.refs.element.innerText = this.props.initialValue;

      const placeholderVisible = !this.props.initialValue;
      this.setState({ isPlaceholderVisible: placeholderVisible });
    }
  }

  handleElementChange() {
    const { onChange, maxLength } = this.props;
    const text = this.refs.element.innerText;

    // Trim the text down to max length if set.
    if (maxLength && text.length > maxLength) {
      this.refs.element.innerText = text.substr(0, maxLength);
      this.setCursorToTheEnd();
    }

    // Pass set text to the external handler.
    onChange(text);
  }

  handleElementBlur() {
    this.handleElementChange();

    const isPlaceholderVisible = this.state.isPlaceholderVisible;

    // If on blur there is no text and the current placeholder state is
    // hidden, then we should show the placeholder again.
    if (!this.refs.element.innerText && !isPlaceholderVisible) {
      this.setState({ isPlaceholderVisible: true });
    }

    // If on blur there is a text and the current placeholder is visible,
    // then we should hide the placeholder.
    else if (this.refs.element.innerText && isPlaceholderVisible) {
      this.setState({ isPlaceholderVisible: false });
    }
  }

  setCursorToTheEnd() {
    // Set the cursor to the end of the element.
    let range, selection;
    range = document.createRange();
    range.selectNodeContents(this.refs.element);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  handlePlaceholderClick() {

    // TODO: Bug - so far it's' possible to click next to the placeholder.
    // So far solved in css.

    this.setCursorToTheEnd();

    // Hide clicked placeholder.
    this.setState({ isPlaceholderVisible: false });
  }

  render() {
    return (
      <Fragment>

        {this.state.isPlaceholderVisible &&
        <span
          className="placeholder"
          onClick={this.handlePlaceholderClick}
        >
          {this.props.placeholder}
          </span>
        }

        <span
          ref="element"
          contentEditable={true}
          onInput={this.handleElementChange}
          onBlur={this.handleElementBlur}
          style={{ visibility: this.state.isPlaceholderVisible ? 'none' : 'visible' }}
        />

      </Fragment>
    )
  }
}

EditableElement.propTypes = {
  id: PropTypes.number,
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  maxLength: PropTypes.number,
  onChange: PropTypes.func,
};

EditableElement.defaultProps = {
  maxLength: 0,
  initialValue: '',
  onChange: () => {},
};

export default EditableElement;