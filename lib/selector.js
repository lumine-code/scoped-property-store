(function() {
  var Selector, indexCounter, slick;

  slick = require('atom-slick');

  indexCounter = 0;

  module.exports = Selector = class Selector {
    static create(source, options) {
      var i, j, len, len1, ref, results, selectorAst, selectorComponent;
      ref = slick.parse(source);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selectorAst = ref[i];
        for (j = 0, len1 = selectorAst.length; j < len1; j++) {
          selectorComponent = selectorAst[j];
          this.parsePseudoSelectors(selectorComponent);
        }
        results.push(new this(selectorAst, options));
      }
      return results;
    }

    static parsePseudoSelectors(selectorComponent) {
      var i, len, pseudoClass, ref;
      if (selectorComponent.pseudos == null) {
        return;
      }
      ref = selectorComponent.pseudos;
      for (i = 0, len = ref.length; i < len; i++) {
        pseudoClass = ref[i];
        if (pseudoClass.name === 'not') {
          if (selectorComponent.notSelectors == null) {
            selectorComponent.notSelectors = [];
          }
          selectorComponent.notSelectors.push(...this.create(pseudoClass.value));
        } else {
          console.warn(`Unsupported pseudo-selector: ${pseudoClass.name}`);
        }
      }
    }

    constructor(selector1, options) {
      var priority, ref;
      this.selector = selector1;
      priority = (ref = options != null ? options.priority : void 0) != null ? ref : 0;
      this.specificity = this.calculateSpecificity();
      this.index = priority + indexCounter++;
    }

    matches(scopeChain) {
      var requireMatch, scopeIndex, selectorIndex;
      if (typeof scopeChain === 'string') {
        scopeChain = slick.parse(scopeChain)[0];
        if (scopeChain == null) {
          return false;
        }
      }
      selectorIndex = this.selector.length - 1;
      scopeIndex = scopeChain.length - 1;
      requireMatch = true;
      while (selectorIndex >= 0 && scopeIndex >= 0) {
        if (this.selectorComponentMatchesScope(this.selector[selectorIndex], scopeChain[scopeIndex])) {
          requireMatch = this.selector[selectorIndex].combinator === '>';
          selectorIndex--;
        } else if (requireMatch) {
          return false;
        }
        scopeIndex--;
      }
      return selectorIndex < 0;
    }

    selectorComponentMatchesScope(selectorComponent, scope) {
      var attribute, className, i, j, k, l, len, len1, len2, len3, ref, ref1, ref2, ref3, ref4, ref5, ref6, scopeAttributes, selector;
      if (selectorComponent.classList != null) {
        ref = selectorComponent.classList;
        for (i = 0, len = ref.length; i < len; i++) {
          className = ref[i];
          if (((ref1 = scope.classes) != null ? ref1[className] : void 0) == null) {
            return false;
          }
        }
      }
      if (selectorComponent.tag != null) {
        if (!(selectorComponent.tag === scope.tag || selectorComponent.tag === '*')) {
          return false;
        }
      }
      if (selectorComponent.attributes != null) {
        scopeAttributes = {};
        ref3 = (ref2 = scope.attributes) != null ? ref2 : [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          attribute = ref3[j];
          scopeAttributes[attribute.name] = attribute;
        }
        ref4 = selectorComponent.attributes;
        for (k = 0, len2 = ref4.length; k < len2; k++) {
          attribute = ref4[k];
          if (((ref5 = scopeAttributes[attribute.name]) != null ? ref5.value : void 0) !== attribute.value) {
            return false;
          }
        }
      }
      if (selectorComponent.notSelectors != null) {
        ref6 = selectorComponent.notSelectors;
        for (l = 0, len3 = ref6.length; l < len3; l++) {
          selector = ref6[l];
          if (selector.matches([scope])) {
            return false;
          }
        }
      }
      return true;
    }

    compare(other) {
      if (other.specificity === this.specificity) {
        return other.index - this.index;
      } else {
        return other.specificity - this.specificity;
      }
    }

    isEqual(other) {
      return this.toString() === other.toString();
    }

    calculateSpecificity() {
      var a, b, c, i, len, ref, selectorComponent;
      a = 0;
      b = 0;
      c = 0;
      ref = this.selector;
      for (i = 0, len = ref.length; i < len; i++) {
        selectorComponent = ref[i];
        if (selectorComponent.classList != null) {
          b += selectorComponent.classList.length;
        }
        if (selectorComponent.attributes != null) {
          b += selectorComponent.attributes.length;
        }
        if (selectorComponent.tag != null) {
          c += 1;
        }
      }
      return (a * 100) + (b * 10) + (c * 1);
    }

    toString() {
      return this.selector.toString().replace(/\*\./g, '.');
    }

  };

}).call(this);
