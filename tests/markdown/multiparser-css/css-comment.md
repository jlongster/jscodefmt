```pcss
.Avatar {
  /* ... */

  &__image {
    /* ... */

    @container (width > 100px) {
      /*
      Change some styles on the image element when the container is
      wider than 100px
      */
    }
  }

  @container (aspect-ratio > 3) {
    /* Change styles on the avatar itself, when the aspect-ratio is grater than 3 */
  }

  @container (width > 100px) and (height > 100px) {
    /* ... */
  }
}
```
