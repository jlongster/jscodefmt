// @flow

let tests = [
  // should work with Object.create()
  function() {
    document.registerElement('custom-element', {
      prototype: Object.create(HTMLElement.prototype, {
        createdCallback: { value: function createdCallback () {
        }},
        attachedCallback: { value: function attachedCallback () {
        }},
        detachedCallback: { value: function detachedCallback () {
        }},
        attributeChangedCallback: {
          value: function attributeChangedCallback (
            attributeLocalName,
            oldAttributeValue,
            newAttributeValue,
            attributeNamespace
          ) {
          }
        }
      })
    })
  },
  // or with Object.assign()
  function() {
    document.registerElement('custom-element', {
      prototype: Object.assign(Object.create(HTMLElement.prototype), {
        createdCallback () {
        },
        attachedCallback () {
        },
        detachedCallback () {
        },
        attributeChangedCallback (
          attributeLocalName,
          oldAttributeValue,
          newAttributeValue,
          attributeNamespace
        ) {
        }
      })
    })
  },
  // should complain about invalid callback parameters
  function() {
    document.registerElement('custom-element', {
      prototype: {
        attributeChangedCallback(
          localName: string,
          oldVal: string, // Error: This might be null
          newVal: string, // Error: This might be null
          namespace: string) {}
      },
    });
  },
];
