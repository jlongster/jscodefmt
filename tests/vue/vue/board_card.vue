<script>
import './issue_card_inner';
import eventHub from '../eventhub';

const Store = gl.issueBoards.BoardsStore;

export default {
  name: 'BoardsIssueCard',
  components: {
    'issue-card-inner': gl.issueBoards.IssueCardInner,
  },
  props: {
    list: Object,
    issue: Object,
    issueLinkBase: String,
    disabled: Boolean,
    index: Number,
    rootPath: String,
  },
  data() {
    return {
      showDetail: false,
      detailIssue: Store.detail,
    };
  },
  computed: {
    issueDetailVisible() {
      return (
        this.detailIssue.issue && this.detailIssue.issue.id === this.issue.id
      );
    },
  },
  methods: {
    mouseDown() {
      this.showDetail = true;
    },
    mouseMove() {
      this.showDetail = false;
    },
    showIssue(e) {
      if (e.target.classList.contains('js-no-trigger')) return;

      if (this.showDetail) {
        this.showDetail = false;

        if (Store.detail.issue && Store.detail.issue.id === this.issue.id) {
          eventHub.$emit('clearDetailIssue');
        } else {
          eventHub.$emit('newDetailIssue', this.issue);
          Store.detail.list = this.list;
        }
      }
    },
  },
};
</script>

<template>
  <li class="card"
    :class="{ 'user-can-drag': !disabled && issue.id, 'is-disabled': disabled || !issue.id, 'is-active': issueDetailVisible }"
    :index="index"
    :data-issue-id="issue.id"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    @mouseup="showIssue($event)">
    <issue-card-inner
      :list="list"
      :issue="issue"
      :issue-link-base="issueLinkBase"
      :root-path="rootPath"
      :update-filters="true" />
  </li>
</template>
