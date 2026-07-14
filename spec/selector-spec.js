var Selector;

Selector = require('../lib/selector');

describe("Selector", function() {
  var S;
  S = function(string) {
    return Selector.create(string)[0];
  };
  describe("::matches(scopeChain)", function() {
    describe("for selectors with no combinators", function() {
      it("can match based on the class name of the rightmost element", function() {
        expect(S('.foo').matches('.bar .foo')).toBe(true);
        expect(S('.foo').matches('.foo .bar')).toBe(false);
        return expect(S('.foo').matches('.bar .foo.bar')).toBe(true);
      });
      it("can match based on the type of the rightmost element", function() {
        expect(S('p').matches('div p')).toBe(true);
        expect(S('p').matches('div div')).toBe(false);
        return expect(S('p').matches('div p.foo')).toBe(true);
      });
      it("can match based on the attributes of the rightmost element", function() {
        expect(S('[foo=bar][baz=qux]').matches('div [foo=bar][baz=qux]')).toBe(true);
        return expect(S('[foo=bar][baz=qux]').matches('div [foo=bar]')).toBe(false);
      });
      it("allows selectors not specifying a specific tag to match scopes with specific tags", function() {
        return expect(S('.foo').matches('div.foo')).toBe(true);
      });
      return it("allows classes such as .c\\+\\+", function() {
        return expect(S('.c\\+\\+').matches('.c\\+\\+')).toBe(true);
      });
    });
    describe("for selectors with descendant combinators", function() {
      return it("matches based on the ancestors of the chain's rightmost element", function() {
        expect(S('.foo .bar').matches('.baz .foo .bar')).toBe(true);
        expect(S('.foo .bar').matches('.baz .bar')).toBe(false);
        return expect(S('.foo .bar').matches('.foo .baz .bar')).toBe(true);
      });
    });
    describe("for selectors with child combinators", function() {
      return it("matches based on the parent of the chain's rightmost element", function() {
        expect(S('.foo > .bar').matches('.baz .foo .bar')).toBe(true);
        expect(S('.foo > .bar').matches('.baz .bar')).toBe(false);
        return expect(S('.foo > .bar').matches('.foo .baz .bar')).toBe(false);
      });
    });
    return describe("for selectors with :not pseudoclasses", function() {
      return it("does not match if the portion of the selector within the negation matches", function() {
        expect(S('.foo:not(.bar, .baz)').matches('.baz .foo.bar')).toBe(false);
        expect(S('.foo:not(.bar, .baz)').matches('.baz .foo.baz')).toBe(false);
        return expect(S('.foo:not(.bar, .baz)').matches('.baz .foo.qux')).toBe(true);
      });
    });
  });
  return describe("::toString()", function() {
    return it("strips redundant '*' expressions", function() {
      expect(S(".foo").toString()).toBe(".foo");
      expect(S(".foo .bar").toString()).toBe(".foo .bar");
      return expect(S("*").toString()).toBe("*");
    });
  });
});
