<page-query lang="graphql">
query { posts: allWordPressPost {
    edges {
   node {
          id
      title
      }
    }
  }
}
</page-query>
