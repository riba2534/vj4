import _ from 'lodash';
import DOMAttachedObject from '../DOMAttachedObject';
import * as util from '../../misc/Util';
import TextareaHandler from '../cmeditor/textareaHandler';

let initialized = false;
const $template = $('.dczcomments__box').eq(0).clone();

function getClosestInstance($dom) {
  return $dom.closest('.dczcomments__box').data('instance');
}

function onBoxCancel(ev) {
  const commentBox = getClosestInstance($(ev.currentTarget));
  if (commentBox) {
    commentBox.onCancel(ev);
  }
}

function onBoxSubmit(ev) {
  const commentBox = getClosestInstance($(ev.currentTarget));
  if (commentBox) {
    commentBox.onSubmit(ev);
  }
}

function init() {
  if (initialized) {
    return;
  }
  $(document).on('click', '.dczcomments__box__submit', onBoxSubmit);
  $(document).on('click', '.dczcomments__box__cancel', onBoxCancel);
  initialized = true;
}

export default class CommentBox extends DOMAttachedObject {

  constructor($dom, options = {}) {
    super($dom);
    init(); // delay initialize
    this.$box = $template.clone();
    this.$box.data('instance', this);
    this.options = options;
    if (options.initialText) {
      this.setText(options.initialText);
    }
    if (options.mode) {
      const submitButton = this.$box.find('.dczcomments__box__submit');
      submitButton.val(submitButton.attr(`data-value-${options.mode}`));
    }
  }

  getTextareaHandler() {
    const $textarea = this.$box.find('textarea');
    return TextareaHandler.getOrConstruct($textarea);
  }

  focus() {
    this.getTextareaHandler().focus();
    return this;
  }

  setText(text) {
    this.getTextareaHandler().val(text);
    return this;
  }

  getText() {
    return this.getTextareaHandler().val();
  }

  insertText(text) {
    const handler = this.getTextareaHandler();
    handler.val(handler.val() + text);
    return this;
  }

  appendTo($dom) {
    this.$box.appendTo($dom);
    this.$box.trigger('vjContentNew');
    return this;
  }

  onSubmit() {
    util
      .post('', {
        ...this.options.form,
        content: this.getText(),
      })
      .then(() => window.location.reload());
  }

  onCancel(ev) {
    this.$box.remove();
    if (this.options && this.options.onCancel) {
      this.options.onCancel(ev);
    }
    this.detach();
  }

}

CommentBox.DOMAttachKey = 'vjCommentBoxInstance';
_.assign(CommentBox, DOMAttachedObject);
